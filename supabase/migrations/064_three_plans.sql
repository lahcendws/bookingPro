-- Migration 063: Three Plans (basic, pro, business) — idempotent, rerunnable
-- Replaces free/pro/business/enterprise with basic(19)/pro(29)/business(79)
-- Migration 037 created the plans table; this migration repurposes it.

-- =============================================================================
-- STEP 0: Add missing columns to plans table for dedicated feature flags
-- =============================================================================
alter table public.plans
  add column if not exists workstations_limit integer,
  add column if not exists expenses_enabled boolean not null default false,
  add column if not exists negotiated_prices_enabled boolean not null default false,
  add column if not exists inventory_rolls_enabled boolean not null default false,
  add column if not exists data_export_enabled boolean not null default true;  -- GDPR: always enabled

-- =============================================================================
-- STEP 1: Update existing plans to new matrix (idempotent via ON CONFLICT)
-- basic: 1 emp / 1 loc / 1 ws / 50MB / 50 appts, no features
-- pro: 5 emp / 1 loc / 3 ws / 500MB / 500 appts, sms/inventory/analytics/expenses/negotiated/rolls
-- business: 15 emp / 3 loc / 10 ws / 2000MB / unlimited, everything + api
-- =============================================================================
insert into public.plans (name, slug, price_monthly, price_yearly,
  appointments_limit, employees_limit, locations_limit, workstations_limit, storage_limit_mb,
  sms_enabled, inventory_enabled, analytics_enabled, api_enabled,
  expenses_enabled, negotiated_prices_enabled, inventory_rolls_enabled, data_export_enabled,
  sort_order)
values
  ('Basic', 'basic', 19.00, 190.00, 50, 1, 1, 1, 50,
   false, false, false, false,
   false, false, false, true, 1),
  ('Pro', 'pro', 29.00, 290.00, 500, 5, 1, 3, 500,
   true, true, true, false,
   true, true, true, true, 2),
  ('Business', 'business', 79.00, 790.00, null, 15, 3, 10, 2000,
   true, true, true, true,
   true, true, true, true, 3)
on conflict (slug) do update set
  name = excluded.name,
  price_monthly = excluded.price_monthly,
  price_yearly = excluded.price_yearly,
  appointments_limit = excluded.appointments_limit,
  employees_limit = excluded.employees_limit,
  locations_limit = excluded.locations_limit,
  workstations_limit = excluded.workstations_limit,
  storage_limit_mb = excluded.storage_limit_mb,
  sms_enabled = excluded.sms_enabled,
  inventory_enabled = excluded.inventory_enabled,
  analytics_enabled = excluded.analytics_enabled,
  api_enabled = excluded.api_enabled,
  expenses_enabled = excluded.expenses_enabled,
  negotiated_prices_enabled = excluded.negotiated_prices_enabled,
  inventory_rolls_enabled = excluded.inventory_rolls_enabled,
  data_export_enabled = excluded.data_export_enabled;

-- =============================================================================
-- STEP 2: Migrate existing businesses BEFORE removing old plans
--    - free -> basic
--    - enterprise -> business
--    - pro, business unchanged
-- =============================================================================
update public.businesses b
set plan_id = p.id,
    plan = p.slug
from public.plans p
where b.plan_id = p.id
  and b.plan != p.slug;

-- Also update legacy 'plan' text column for free/enterprise businesses
update public.businesses
set plan = 'basic'
where plan = 'free';

update public.businesses
set plan = 'business'
where plan = 'enterprise';

-- For businesses with NULL plan_id (edge case), assign basic
update public.businesses b
set plan_id = (select id from public.plans where slug = 'basic' limit 1),
    plan = 'basic'
where b.plan_id is null;

-- =============================================================================
-- STEP 3: Drop OLD CHECK constraint, then add NEW one
-- Old: check (plan in ('free','starter','pro','agency'))
-- New: check (plan in ('basic', 'pro', 'business'))
-- =============================================================================
alter table public.businesses
  drop constraint if exists businesses_plan_check;

alter table public.businesses
  add constraint businesses_plan_check
  check (plan in ('basic', 'pro', 'business'));

-- =============================================================================
-- STEP 4: Remove old plans (free, enterprise) AFTER migration
-- =============================================================================
delete from public.plans where slug in ('free', 'enterprise');

-- =============================================================================
-- STEP 5: Security - Prevent clients from changing plan/plan_id/subscription_status
-- Replace the permissive "owner_access_businesses" policy with restricted version
-- =============================================================================
drop policy if exists "owner_access_businesses" on public.businesses;

-- Owner can SELECT their businesses
create policy "owner_access_businesses_select" on public.businesses
  for select using (owner_id = auth.uid());

-- Owner can INSERT their own business (onboarding)
create policy "owner_insert_business" on public.businesses
  for insert with check (owner_id = auth.uid());

-- Owner can UPDATE business settings EXCEPT plan/plan_id/subscription_status
-- The trigger below enforces this at DB level
create policy "owner_update_business_settings" on public.businesses
  for update using (owner_id = auth.uid())
  with check (
    owner_id = auth.uid()
    and plan is not distinct from plan
    and plan_id is not distinct from plan_id
    and subscription_status is not distinct from subscription_status
  );

-- Owner can DELETE their business (cascade will clean up)
create policy "owner_delete_business" on public.businesses
  for delete using (owner_id = auth.uid());

-- =============================================================================
-- STEP 6: DB-level trigger to enforce plan immutability by client
-- This runs BEFORE INSERT OR UPDATE and rejects changes to plan fields
-- =============================================================================
create or replace function public.enforce_plan_immutability()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- On INSERT: force plan to basic for new businesses
  if TG_OP = 'INSERT' then
    NEW.plan_id := (select id from public.plans where slug = 'basic' limit 1);
    NEW.plan := 'basic';
    NEW.subscription_status := 'active';
    return NEW;
  end if;

  -- On UPDATE: reject changes to plan fields if not service role
  if TG_OP = 'UPDATE' then
    if NEW.plan_id is distinct from OLD.plan_id
       or NEW.plan is distinct from OLD.plan
       or NEW.subscription_status is distinct from OLD.subscription_status then
      -- Allow only if current_user is postgres (service role bypasses RLS)
      if current_user = 'postgres' then
        return NEW;
      end if;
      raise exception 'PLAN_IMMUTABLE: Cannot change plan, plan_id, or subscription_status directly';
    end if;
  end if;

  return NEW;
end $$;

drop trigger if exists trg_enforce_plan_immutability on public.businesses;
create trigger trg_enforce_plan_immutability
  before insert or update on public.businesses
  for each row execute function public.enforce_plan_immutability();

-- =============================================================================
-- STEP 7: Enforce employees_limit per plan at INSERT/UPDATE on employees
-- Handles reactivation (is_active true) and race conditions with advisory lock
-- =============================================================================
create or replace function public.enforce_employees_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit integer;
  v_count integer;
  v_lock_id bigint;
begin
  -- Only enforce on insert, reactivation, or business_id change
  if TG_OP = 'INSERT'
     or (TG_OP = 'UPDATE' and (NEW.business_id != OLD.business_id or (OLD.is_active = false and NEW.is_active = true))) then

    -- Advisory lock to prevent race conditions (lock per business)
    v_lock_id := ('x' || substr(md5(NEW.business_id::text), 1, 15))::bit(64)::bigint;
    perform pg_advisory_xact_lock(v_lock_id);

    -- Get the plan's employee limit
    select p.employees_limit
    into v_limit
    from public.businesses b
    join public.plans p on b.plan_id = p.id
    where b.id = NEW.business_id;

    -- Count current active employees (excluding the row being inserted/updated)
    select count(*)
    into v_count
    from public.employees e
    where e.business_id = NEW.business_id
      and e.is_active = true
      and e.id != NEW.id;

    if v_limit is not null and v_count >= v_limit then
      raise exception 'PLAN_LIMIT_EMPLOYEES: Employee limit reached for this plan. Current: %, Limit: %', v_count, v_limit;
    end if;
  end if;
  return NEW;
end $$;

drop trigger if exists trg_enforce_employees_limit on public.employees;
create trigger trg_enforce_employees_limit
  before insert or update on public.employees
  for each row execute function public.enforce_employees_limit();

-- =============================================================================
-- STEP 8: Enforce workstations limit (dedicated workstations_limit column)
-- =============================================================================
create or replace function public.enforce_workstations_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit integer;
  v_count integer;
  v_lock_id bigint;
begin
  if TG_OP = 'INSERT' then
    -- Advisory lock
    v_lock_id := ('x' || substr(md5(NEW.business_id::text || 'ws'), 1, 15))::bit(64)::bigint;
    perform pg_advisory_xact_lock(v_lock_id);

    select p.workstations_limit
    into v_limit
    from public.businesses b
    join public.plans p on b.plan_id = p.id
    where b.id = NEW.business_id;

    select count(*)
    into v_count
    from public.workstations w
    where w.business_id = NEW.business_id
      and w.is_active = true;

    if v_limit is not null and v_count >= v_limit then
      raise exception 'PLAN_LIMIT_WORKSTATIONS: Workstation limit reached for this plan. Current: %, Limit: %', v_count, v_limit;
    end if;
  end if;
  return NEW;
end $$;

drop trigger if exists trg_enforce_workstations_limit on public.workstations;
create trigger trg_enforce_workstations_limit
  before insert on public.workstations
  for each row execute function public.enforce_workstations_limit();

-- =============================================================================
-- STEP 9: Enforce appointments_limit per month (Paris timezone, handles UPDATE)
-- =============================================================================
create or replace function public.enforce_appointments_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit integer;
  v_count integer;
  v_month_start timestamptz;
  v_lock_id bigint;
begin
  if TG_OP = 'INSERT' or (TG_OP = 'UPDATE' and (NEW.starts_at != OLD.starts_at or NEW.business_id != OLD.business_id)) then
    -- Advisory lock
    v_lock_id := ('x' || substr(md5(NEW.business_id::text || 'appt'), 1, 15))::bit(64)::bigint;
    perform pg_advisory_xact_lock(v_lock_id);

    select p.appointments_limit
    into v_limit
    from public.businesses b
    join public.plans p on b.plan_id = p.id
    where b.id = NEW.business_id;

    if v_limit is not null then
      -- Use Europe/Paris timezone for month boundaries
      v_month_start := date_trunc('month', NEW.starts_at at time zone 'Europe/Paris') at time zone 'Europe/Paris';

      select count(*)
      into v_count
      from public.appointments a
      where a.business_id = NEW.business_id
        and a.starts_at >= v_month_start
        and a.starts_at < v_month_start + interval '1 month'
        and a.status != 'cancelled'
        and a.id != NEW.id;  -- exclude current row

      if v_count >= v_limit then
        raise exception 'PLAN_LIMIT_APPOINTMENTS: Monthly appointment limit reached for this plan. Limit: %', v_limit;
      end if;
    end if;
  end if;
  return NEW;
end $$;

drop trigger if exists trg_enforce_appointments_limit on public.appointments;
create trigger trg_enforce_appointments_limit
  before insert or update on public.appointments
  for each row execute function public.enforce_appointments_limit();

-- =============================================================================
-- STEP 10: Feature gates — keep original SELECT/UPDATE/DELETE policies (admin-only)
-- Add RESTRICTIVE INSERT policies that test plan features
-- Note: 062b already restricts expenses, client_negotiated_prices, data_exports,
-- inventory_rolls to admins via is_admin(business_id)
-- =============================================================================

-- inventory_items: only if inventory_enabled = true (admin inserts)
drop policy if exists "tenant_insert_inventory_items" on public.inventory_items;
create policy "tenant_insert_inventory_items" on public.inventory_items
  for insert with check (
    business_id in (select public.my_business_ids())
    and public.is_admin(business_id)
    and exists (
      select 1 from public.plans p
      join public.businesses b on b.plan_id = p.id
      where b.id = inventory_items.business_id
        and p.inventory_enabled = true
    )
  );

-- inventory_rolls: only if inventory_rolls_enabled = true (admin inserts)
drop policy if exists "tenant_insert_inventory_rolls" on public.inventory_rolls;
create policy "tenant_insert_inventory_rolls" on public.inventory_rolls
  for insert with check (
    business_id in (select public.my_business_ids())
    and public.is_admin(business_id)
    and exists (
      select 1 from public.plans p
      join public.businesses b on b.plan_id = p.id
      where b.id = inventory_rolls.business_id
        and p.inventory_rolls_enabled = true
    )
  );

-- whatsapp_templates: only if sms_enabled = true (admin inserts)
drop policy if exists "tenant_insert_whatsapp_templates" on public.whatsapp_templates;
create policy "tenant_insert_whatsapp_templates" on public.whatsapp_templates
  for insert with check (
    business_id in (select public.my_business_ids())
    and public.is_admin(business_id)
    and exists (
      select 1 from public.plans p
      join public.businesses b on b.plan_id = p.id
      where b.id = whatsapp_templates.business_id
        and p.sms_enabled = true
    )
  );

-- client_negotiated_prices: only if negotiated_prices_enabled = true (admin inserts)
-- 062b already restricts to admin + cross-tenant guard
drop policy if exists "tenant_insert_client_negotiated_prices" on public.client_negotiated_prices;
create policy "tenant_insert_client_negotiated_prices" on public.client_negotiated_prices
  for insert with check (
    business_id in (select public.my_business_ids())
    and public.is_admin(business_id)
    and exists (
      select 1 from public.plans p
      join public.businesses b on b.plan_id = p.id
      where b.id = client_negotiated_prices.business_id
        and p.negotiated_prices_enabled = true
    )
  );

-- expenses: only if expenses_enabled = true (admin inserts - already admin-only in 062b)
drop policy if exists "tenant_insert_expenses" on public.expenses;
create policy "tenant_insert_expenses" on public.expenses
  for insert with check (
    business_id in (select public.my_business_ids())
    and public.is_admin(business_id)
    and exists (
      select 1 from public.plans p
      join public.businesses b on b.plan_id = p.id
      where b.id = expenses.business_id
        and p.expenses_enabled = true
    )
  );

-- expense_receipts: follows expenses policy (admin only)
-- data_exports: only if data_export_enabled = true (GDPR: always true in our matrix) - admin inserts
drop policy if exists "tenant_insert_data_exports" on public.data_exports;
create policy "tenant_insert_data_exports" on public.data_exports
  for insert with check (
    business_id in (select public.my_business_ids())
    and public.is_admin(business_id)
    and exists (
      select 1 from public.plans p
      join public.businesses b on b.plan_id = p.id
      where b.id = data_exports.business_id
        and p.data_export_enabled = true
    )
  );

-- =============================================================================
-- STEP 11: Remove redundant logic from migration 063 (moved to 062b)
-- =============================================================================
-- All STEP 11 items are now handled by migration 062b_fix_062_security.sql
-- to ensure the baseline is clean and security is addressed early.

-- =============================================================================
-- STEP 12: Plans table - ensure read-only for authenticated/anon
-- =============================================================================
revoke all on public.plans from anon, authenticated;
grant select on public.plans to anon, authenticated;

-- =============================================================================
-- STEP 13: Plan helper functions with restricted access (SECURITY DEFINER)
-- =============================================================================
create or replace function public.get_plan_features(p_business_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'appointments_limit', p.appointments_limit,
    'employees_limit', p.employees_limit,
    'locations_limit', p.locations_limit,
    'workstations_limit', p.workstations_limit,
    'storage_limit_mb', p.storage_limit_mb,
    'sms_enabled', p.sms_enabled,
    'inventory_enabled', p.inventory_enabled,
    'analytics_enabled', p.analytics_enabled,
    'api_enabled', p.api_enabled,
    'expenses_enabled', p.expenses_enabled,
    'negotiated_prices_enabled', p.negotiated_prices_enabled,
    'inventory_rolls_enabled', p.inventory_rolls_enabled,
    'data_export_enabled', p.data_export_enabled
  )
  from public.businesses b
  join public.plans p on b.plan_id = p.id
  where b.id = p_business_id
    and b.id in (select public.my_business_ids());  -- Only accessible by members
$$;

create or replace function public.business_has_feature(p_business_id uuid, p_feature text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    case p_feature
      when 'sms' then p.sms_enabled
      when 'inventory' then p.inventory_enabled
      when 'analytics' then p.analytics_enabled
      when 'api' then p.api_enabled
      when 'expenses' then p.expenses_enabled
      when 'negotiated_prices' then p.negotiated_prices_enabled
      when 'inventory_rolls' then p.inventory_rolls_enabled
      when 'data_export' then p.data_export_enabled
      else false
    end
  from public.businesses b
  join public.plans p on b.plan_id = p.id
  where b.id = p_business_id
    and b.id in (select public.my_business_ids());  -- Only accessible by members
$$;

-- =============================================================================
-- STEP 14: Revoke execute on helper functions from public/anon
-- =============================================================================
revoke execute on function public.get_plan_features(uuid) from anon, authenticated;
grant execute on function public.get_plan_features(uuid) to authenticated;  -- via RLS check inside

revoke execute on function public.business_has_feature(uuid, text) from anon, authenticated;
grant execute on function public.business_has_feature(uuid, text) to authenticated;  -- via RLS check inside

-- =============================================================================
-- COMMENT: Migration is idempotent - re-running changes nothing
-- ON CONFLICT handles plan updates, DELETE is idempotent, UPDATE is safe
-- =============================================================================