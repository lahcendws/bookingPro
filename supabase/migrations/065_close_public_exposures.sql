-- Migration 065: Close public exposures and fix security issues
-- Idempotent, rerunnable

-- =============================================================================
-- A. inspection_checklists: enable RLS, revoke anon, member policies via vehicle
-- =============================================================================
alter table public.inspection_checklists enable row level security;
revoke all on public.inspection_checklists from anon;

-- Members (employees do check-ins) can select/insert/update/delete via vehicle->business
drop policy if exists "ic_members_select" on public.inspection_checklists;
create policy "ic_members_select" on public.inspection_checklists
  for select using (
    vehicle_id in (
      select v.id from public.vehicles v
      join public.business_members bm on bm.business_id = v.business_id
      where bm.user_id = auth.uid()
    )
  );

drop policy if exists "ic_members_insert" on public.inspection_checklists;
create policy "ic_members_insert" on public.inspection_checklists
  for insert with check (
    vehicle_id in (
      select v.id from public.vehicles v
      join public.business_members bm on bm.business_id = v.business_id
      where bm.user_id = auth.uid()
    )
  );

drop policy if exists "ic_members_update" on public.inspection_checklists;
create policy "ic_members_update" on public.inspection_checklists
  for update using (
    vehicle_id in (
      select v.id from public.vehicles v
      join public.business_members bm on bm.business_id = v.business_id
      where bm.user_id = auth.uid()
    )
  ) with check (
    vehicle_id in (
      select v.id from public.vehicles v
      join public.business_members bm on bm.business_id = v.business_id
      where bm.user_id = auth.uid()
    )
  );

drop policy if exists "ic_members_delete" on public.inspection_checklists;
create policy "ic_members_delete" on public.inspection_checklists
  for delete using (
    vehicle_id in (
      select v.id from public.vehicles v
      join public.business_members bm on bm.business_id = v.business_id
      where bm.user_id = auth.uid()
    )
  );

-- Index on vehicle_id for the join
create index if not exists idx_inspection_checklists_vehicle on public.inspection_checklists (vehicle_id);

-- =============================================================================
-- B. jobs & job_inspections: drop public tracking-token policies, add member policies
-- =============================================================================
drop policy if exists "Public can view jobs via tracking token" on public.jobs;
drop policy if exists "Public can view inspections via tracking token" on public.job_inspections;

-- Member policies (via my_business_ids())
drop policy if exists "jobs_member_all" on public.jobs;
create policy "jobs_member_all" on public.jobs
  for all using (business_id in (select public.my_business_ids()))
  with check (business_id in (select public.my_business_ids()));

drop policy if exists "job_inspections_member_all" on public.job_inspections;
create policy "job_inspections_member_all" on public.job_inspections
  for all using (
    job_id in (
      select j.id from public.jobs j
      where j.business_id in (select public.my_business_ids())
    )
  ) with check (
    job_id in (
      select j.id from public.jobs j
      where j.business_id in (select public.my_business_ids())
    )
  );

-- =============================================================================
-- C. Revoke dangerous privileges from anon & authenticated on all base tables
-- =============================================================================
do $$
declare r record;
begin
  for r in
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_type = 'BASE TABLE'
  loop
    execute format('revoke insert, update, delete, truncate, references, trigger on public.%I from anon', r.table_name);
    execute format('revoke truncate, references, trigger on public.%I from authenticated', r.table_name);
  end loop;
end $$;

-- audit_logs: append-only for authenticated
revoke insert, update, delete on public.audit_logs from authenticated;

-- Default privileges: no dangerous grants to anon
alter default privileges in schema public revoke insert, update, delete, truncate on tables from anon;

-- =============================================================================
-- D. businesses policy: fix tautological check, ensure plan immutability trigger
-- =============================================================================
drop policy if exists "owner_update_business_settings" on public.businesses;
create policy "owner_update_business_settings" on public.businesses
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- enforce_plan_immutability: SECURITY INVOKER, blocks authenticated/anon only
drop trigger if exists trg_enforce_plan_immutability on public.businesses;
create or replace function public.enforce_plan_immutability()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  -- On INSERT: if plan_id is null, force to basic (any role)
  if tg_op = 'INSERT' and new.plan_id is null then
    new.plan_id := (select id from public.plans where slug = 'basic' limit 1);
    new.plan := 'basic';
    new.subscription_status := 'active';
  end if;

  -- On INSERT: authenticated/anon forced to basic
  if tg_op = 'INSERT' and current_user in ('authenticated', 'anon') then
    new.plan_id := (select id from public.plans where slug = 'basic' limit 1);
    new.plan := 'basic';
    new.subscription_status := 'active';
  end if;

  -- On UPDATE: block plan changes for authenticated/anon
  if tg_op = 'UPDATE' and current_user in ('authenticated', 'anon') then
    if new.plan_id is distinct from old.plan_id
       or new.plan is distinct from old.plan
       or new.subscription_status is distinct from old.subscription_status then
      raise exception 'PLAN_IMMUTABLE';
    end if;
  end if;
  return new;
end $$;

create trigger trg_enforce_plan_immutability
  before insert or update on public.businesses
  for each row execute function public.enforce_plan_immutability();

-- =============================================================================
-- E. Function execute privileges: revoke from public/anon, grant to authenticated/service_role
-- =============================================================================
revoke execute on function public.fn_log_audit_event() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_new_business() from public, anon, authenticated;
revoke execute on function public.protect_business_owner() from public, anon, authenticated;
revoke execute on function public.link_owner_employee() from public, anon, authenticated;
revoke execute on function public.enforce_cnp_cross_tenant() from public, anon, authenticated;
revoke execute on function public.enforce_scp_same_business() from public, anon, authenticated;
revoke execute on function public.enforce_plan_immutability() from public, anon, authenticated;
revoke execute on function public.enforce_employees_limit() from public, anon, authenticated;
revoke execute on function public.enforce_workstations_limit() from public, anon, authenticated;
revoke execute on function public.enforce_appointments_limit() from public, anon, authenticated;

revoke execute on function public.get_plan_features(uuid) from public, anon;
revoke execute on function public.business_has_feature(uuid, text) from public, anon;

grant execute on function public.get_plan_features(uuid) to authenticated, service_role;
grant execute on function public.business_has_feature(uuid, text) to authenticated, service_role;

-- Do NOT revoke is_member, is_admin, my_business_ids (policies call them)

-- =============================================================================
-- F. anonymize_client: add authorization, scrub audit_logs, SECURITY DEFINER with search_path
-- =============================================================================
drop function if exists public.anonymize_client(uuid, text);

create or replace function public.anonymize_client(p_client_id uuid, p_anonymous_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
  v_name text;
begin
  -- 1. Lookup client's business_id
  select business_id into v_business_id
  from public.clients
  where id = p_client_id;

  if v_business_id is null then
    raise exception 'CLIENT_NOT_FOUND';
  end if;

  -- 2. Authorization BEFORE any change
  -- Allow only service_role (via auth.jwt() claims) or admin of that business
  if (auth.jwt() ->> 'role') is distinct from 'service_role'
     and not public.is_admin(v_business_id) then
    raise exception 'FORBIDDEN';
  end if;

  -- 3. Compute anonymous name (fallback to truncated UUID)
  v_name := left(coalesce(nullif(trim(p_anonymous_name), ''),
                  'Client #' || left(p_client_id::text, 6)), 60);

  -- 4. Anonymize client row
  update public.clients
  set name = v_name,
      phone = null,
      email = null,
      notes = '[Anonymized for GDPR compliance]',
      telegram_id = null,
      viber_user_id = null,
      whatsapp_number = null,
      birthday = null
  where id = p_client_id;

  -- 5. Scrub audit_logs for entity 'client': NULL old_values, new_values; replace metadata label; remove client_name
  update public.audit_logs
  set old_values = null,
      new_values = null,
      metadata = (metadata - 'client_name' - 'fields') || jsonb_build_object('label', v_name)
  where business_id = v_business_id
    and entity_type = 'client'
    and entity_id = p_client_id;

  -- 6. Scrub appointment audit_logs: remove client_name from metadata; reduce 'Client : <name>' to 'Client'
  update public.audit_logs
  set metadata = metadata - 'client_name',
      actor_label = case
        when actor_type = 'client' and actor_label like 'Client : %' then 'Client'
        else actor_label
      end
  where business_id = v_business_id
    and entity_type = 'appointment'
    and entity_id in (
      select id from public.appointments
      where client_id = p_client_id and business_id = v_business_id
    );
end $$;

-- grants are handled in 066 at the end of the migration chain

-- =============================================================================
-- G. get_booked_slots: drop 2-arg overload, recreate with business timezone overlap logic
-- =============================================================================
drop function if exists public.get_booked_slots(uuid, date);
drop function if exists public.get_booked_slots(uuid, date, uuid);

create or replace function public.get_booked_slots(p_business_id uuid, p_date date, p_employee_id uuid default null)
returns table(starts_at timestamptz, ends_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select a.starts_at, a.ends_at
  from public.appointments a
  join public.businesses b on b.id = a.business_id
  where a.business_id = p_business_id
    and a.status not in ('cancelled', 'no_show')
    -- Appointment overlaps the local day in business timezone
    and a.starts_at < (p_date + interval '1 day') at time zone coalesce(b.timezone, 'UTC')
    and a.ends_at > p_date at time zone coalesce(b.timezone, 'UTC')
    -- Exclude expired holds (expires_at in past) and pending deposits that are still valid
    and (a.expires_at is null or a.expires_at > now())
    -- If deposit is pending and not expired, it still holds the slot
    -- If deposit_status is 'paid' or 'none', it holds the slot
    -- Only exclude if deposit_status='pending' AND expires_at is past (already covered above)
    and (p_employee_id is null or a.employee_id = p_employee_id)
$$;

grant execute on function public.get_booked_slots(uuid, date, uuid) to authenticated, service_role;

-- =============================================================================
-- H. Tracking tokens: unique index, expiry, revocation columns on jobs
-- =============================================================================
alter table public.jobs
  add column if not exists tracking_expires_at timestamptz,
  add column if not exists tracking_revoked_at timestamptz;

create unique index if not exists uq_jobs_tracking_token on public.jobs (tracking_token);

-- inspection_checklists: add revoked_at for share_token
alter table public.inspection_checklists
  add column if not exists share_revoked_at timestamptz;

-- Create index on share_token for lookup
create or replace function public.set_job_tracking_expiry() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.status = 'livre'
     and (tg_op = 'INSERT' or old.status is distinct from new.status)
     and new.tracking_expires_at is null then
    new.tracking_expires_at := now() + interval '30 days';
  end if;
  return new;
end $$;

drop trigger if exists trg_jobs_tracking_expiry on public.jobs;
create trigger trg_jobs_tracking_expiry
  before insert or update of status on public.jobs
  for each row execute function public.set_job_tracking_expiry();

create unique index if not exists uq_businesses_slug on public.businesses(slug);
