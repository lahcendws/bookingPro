-- Migration 056: Advanced Appointment & Entity Audit Logs with Trigger-based Actor Tracking

-- 1. Ensure audit_logs table supports entity_type, actor tracking, and JSON diffs
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid,
  action text not null, -- created, updated, moved, status_changed, cancelled, employee_changed, public_booking_received, deposit_paid, deposit_expired
  entity_type text not null, -- appointment, client, job, quote, etc.
  entity_id uuid,
  actor_type text not null default 'user', -- user, client, system
  actor_label text not null default 'Utilisateur',
  old_values jsonb default null,
  new_values jsonb default null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_business_id on public.audit_logs(business_id);
create index if not exists idx_audit_logs_entity on public.audit_logs(entity_type, entity_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);

alter table public.audit_logs enable row level security;

drop policy if exists "Users can view audit logs of their business" on public.audit_logs;
create policy "Users can view audit logs of their business"
  on public.audit_logs for select
  to authenticated
  using (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  );

drop policy if exists "Users can insert audit logs for their business" on public.audit_logs;
create policy "Users can insert audit logs for their business"
  on public.audit_logs for insert
  to authenticated
  with check (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  );

-- 2. Enhanced Audit Trigger Function supporting field-level diffs and actor context
create or replace function public.fn_log_audit_event()
returns trigger
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
  v_entity_type text;
  v_entity_id uuid;
  v_action text;
  v_actor_type text := 'user';
  v_actor_label text := 'Utilisateur';
  v_old_json jsonb := null;
  v_new_json jsonb := null;
  v_old_clean jsonb := null;
  v_new_clean jsonb := null;
  v_key text;
  v_user_email text;
  v_user_name text;
begin
  -- Resolve entity type and business id
  if TG_TABLE_NAME = 'appointments' then
    v_entity_type := 'appointment';
    v_business_id := coalesce(NEW.business_id, OLD.business_id);
    v_entity_id := coalesce(NEW.id, OLD.id);
  elsif TG_TABLE_NAME = 'clients' then
    v_entity_type := 'client';
    v_business_id := coalesce(NEW.business_id, OLD.business_id);
    v_entity_id := coalesce(NEW.id, OLD.id);
  elsif TG_TABLE_NAME = 'jobs' then
    v_entity_type := 'job';
    v_business_id := coalesce(NEW.business_id, OLD.business_id);
    v_entity_id := coalesce(NEW.id, OLD.id);
  else
    return coalesce(NEW, OLD);
  end if;

  -- Read actor type from session settings if set
  begin
    v_actor_type := coalesce(current_setting('app.actor_type', true), 'user');
  exception when others then
    v_actor_type := 'user';
  end;

  -- Determine actor label & user_id
  if v_actor_type = 'client' then
    v_actor_label := 'Client (réservation en ligne)';
  elsif v_actor_type = 'system' then
    v_actor_label := 'Système';
  else
    if auth.uid() is not null then
      select email, coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email)
      into v_user_email, v_user_name
      from auth.users
      where id = auth.uid();

      v_actor_label := coalesce(v_user_name, v_user_email, 'Utilisateur');
    else
      v_actor_type := 'system';
      v_actor_label := 'Système';
    end if;
  end if;

  -- Handle Operation
  if TG_OP = 'INSERT' then
    v_action := 'created';
    v_new_json := to_jsonb(NEW);
    v_new_clean := v_new_json - 'updated_at' - 'created_at';

    if v_entity_type = 'appointment' and v_actor_type = 'client' then
      v_action := 'public_booking_received';
    end if;

  elsif TG_OP = 'UPDATE' then
    v_old_json := to_jsonb(OLD);
    v_new_json := to_jsonb(NEW);

    if v_entity_type = 'appointment' then
      if (v_old_json->>'status' is distinct from v_new_json->>'status') and (v_new_json->>'status' = 'cancelled') then
        v_action := 'cancelled';
      elsif (v_old_json->>'starts_at' is distinct from v_new_json->>'starts_at') or (v_old_json->>'workstation_id' is distinct from v_new_json->>'workstation_id') then
        v_action := 'moved';
      elsif v_old_json->>'employee_id' is distinct from v_new_json->>'employee_id' then
        v_action := 'employee_changed';
      elsif v_old_json->>'status' is distinct from v_new_json->>'status' then
        v_action := 'status_changed';
      elsif (v_old_json->>'deposit_status' is distinct from v_new_json->>'deposit_status') then
        if v_new_json->>'deposit_status' = 'paid' then
          v_action := 'deposit_paid';
        elsif v_new_json->>'deposit_status' = 'expired' then
          v_action := 'deposit_expired';
        else
          v_action := 'updated';
        end if;
      else
        v_action := 'updated';
      end if;
    else
      v_action := 'updated';
    end if;

    v_old_clean := '{}'::jsonb;
    v_new_clean := '{}'::jsonb;

    for v_key in select jsonb_object_keys(v_new_json)
    loop
      if v_key not in ('updated_at', 'created_at') then
        if v_old_json->v_key is distinct from v_new_json->v_key then
          v_old_clean := jsonb_set(v_old_clean, array[v_key], coalesce(v_old_json->v_key, 'null'::jsonb));
          v_new_clean := jsonb_set(v_new_clean, array[v_key], coalesce(v_new_json->v_key, 'null'::jsonb));
        end if;
      end if;
    end loop;

  elsif TG_OP = 'DELETE' then
    v_action := 'cancelled';
    v_old_clean := to_jsonb(OLD) - 'updated_at' - 'created_at';
  end if;

  if v_business_id is not null then
    insert into public.audit_logs (
      business_id,
      user_id,
      action,
      entity_type,
      entity_id,
      actor_type,
      actor_label,
      old_values,
      new_values
    )
    values (
      v_business_id,
      case when v_actor_type = 'user' then auth.uid() else null end,
      v_action,
      v_entity_type,
      v_entity_id,
      v_actor_type,
      v_actor_label,
      v_old_clean,
      v_new_clean
    );
  end if;

  return coalesce(NEW, OLD);
end;
$$ language plpgsql;

drop trigger if exists tr_audit_appointments on public.appointments;
create trigger tr_audit_appointments
  after insert or update or delete on public.appointments
  for each row execute function public.fn_log_audit_event();

drop trigger if exists tr_audit_clients on public.clients;
create trigger tr_audit_clients
  after insert or update on public.clients
  for each row execute function public.fn_log_audit_event();

drop trigger if exists tr_audit_jobs on public.jobs;
create trigger tr_audit_jobs
  after insert or update on public.jobs
  for each row execute function public.fn_log_audit_event();
