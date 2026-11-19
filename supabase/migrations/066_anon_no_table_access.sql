-- Migration 066: Revoke all privileges from anon on all public tables
-- Apply only after STEP 2 (server routes using service role) works.
-- Idempotent, rerunnable.

-- =============================================================================
-- 1. Revoke all privileges from anon on all public base tables
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
    execute format('revoke all on public.%I from anon', r.table_name);
  end loop;
end $$;

-- =============================================================================
-- 2. Default privileges: no table access for anon
-- =============================================================================
alter default privileges in schema public revoke all on tables from anon;

-- =============================================================================
-- 3. Drop public-read policies (these were the only anon access paths)
--    These tables are now served server-side via service role.
-- =============================================================================
drop policy if exists "public_read_business_hours" on public.business_hours;
drop policy if exists "public_read_employees_for_booking" on public.employees;
drop policy if exists "public_read_services_for_booking" on public.services;
drop policy if exists "Public can view active employee services" on public.employee_services;

-- vehicle_body_types: keep select for authenticated only, revoke from anon
drop policy if exists "tenant_read_vehicle_body_types" on public.vehicle_body_types;
create policy "authenticated_read_vehicle_body_types" on public.vehicle_body_types
  for select using (true);
-- Note: this policy is to authenticated only; anon has no grants on this table

-- plans: keep select for authenticated only
drop policy if exists "Anyone can view active plans" on public.plans;
create policy "authenticated_read_active_plans" on public.plans
  for select using (is_active = true);

-- jobs + job_inspections: drop any remaining public tracking-token policies
drop policy if exists "Public can view jobs via tracking token" on public.jobs;
drop policy if exists "Public can view inspections via tracking token" on public.job_inspections;

-- =============================================================================
-- 4. Ensure RLS is enabled on all tables that have policies
-- =============================================================================
alter table public.inspection_checklists enable row level security;

-- =============================================================================
-- 5. Revoke execute on all public functions from anon
-- =============================================================================
-- droits d'exécution : fin de migration, après toute création ou remplacement de fonction
do $$
declare r record;
begin
  for r in
    select p.oid::regprocedure as fn
    from pg_proc p
    where p.pronamespace = 'public'::regnamespace
      and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
  loop
    execute format('revoke execute on function %s from public, anon', r.fn);
  end loop;
end $$;

alter default privileges in schema public revoke execute on functions from public, anon;

grant execute on function public.is_member(uuid), public.is_admin(uuid), public.my_business_ids()
  to authenticated, service_role;
grant execute on function public.anonymize_client(uuid, text), public.get_plan_features(uuid),
  public.business_has_feature(uuid, text), public.get_booked_slots(uuid, date, uuid)
  to authenticated, service_role;

-- =============================================================================
-- 6. Final catalog: tables without RLS; anon privileges zero; function ACLs per role
-- =============================================================================
-- Function privilege block (DO loop revoke from public, anon on non-extension
-- functions in public; alter default privileges revoke execute on functions from
-- public, anon; explicit grants to authenticated and service_role)
do $$
declare r record;
begin
  for r in
    select p.oid::regprocedure as fn
    from pg_proc p
    where p.pronamespace = 'public'::regnamespace
      and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
  loop
    execute format('revoke execute on function %s from public, anon', r.fn);
  end loop;
end $$;

alter default privileges in schema public revoke execute on functions from public, anon;

grant execute on function public.is_member(uuid) to authenticated;
grant execute on function public.is_admin(uuid) to authenticated;
grant execute on function public.my_business_ids() to authenticated;
grant execute on function public.anonymize_client(uuid, text) to authenticated;
grant execute on function public.get_plan_features(uuid) to authenticated;
grant execute on function public.business_has_feature(uuid, text) to authenticated;
grant execute on function public.get_booked_slots(uuid, date, uuid) to authenticated;
grant execute on function public.is_member(uuid) to service_role;
grant execute on function public.is_admin(uuid) to service_role;
grant execute on function public.my_business_ids() to service_role;
grant execute on function public.anonymize_client(uuid, text) to service_role;
grant execute on function public.get_plan_features(uuid) to service_role;
grant execute on function public.business_has_feature(uuid, text) to service_role;
grant execute on function public.get_booked_slots(uuid, date, uuid) to service_role;