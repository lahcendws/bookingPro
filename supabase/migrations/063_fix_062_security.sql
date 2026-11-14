-- Migration 062b: Fix security holes in migration 062
-- vehicle_body_types was world-writable (GRANT ALL TO anon, authenticated + policy FOR ALL USING true)
-- Multiple tables had GRANT ALL TO anon, authenticated
-- This migration revokes anon access and tightens RLS policies.

-- =============================================================================
-- 1. Fix vehicle_body_types: was world-writable, now read-only for authenticated
-- =============================================================================
drop policy if exists "tenant_access_vehicle_body_types" on public.vehicle_body_types;
create policy "tenant_read_vehicle_body_types" on public.vehicle_body_types
  for select using (true);  -- reference data, readable by all authenticated
-- No write policy for authenticated users (only service role via migration scripts)

-- =============================================================================
-- 2. Revoke anon access from all migration 062 tables
-- =============================================================================
revoke all on public.vehicle_body_types from anon;
revoke all on public.service_body_type_prices from anon;
revoke all on public.client_negotiated_prices from anon;
revoke all on public.expenses from anon;
revoke all on public.expense_receipts from anon;
revoke all on public.data_exports from anon;
revoke all on public.whatsapp_templates from anon;
revoke all on public.inspection_checklists from anon;
revoke all on public.inventory_rolls from anon;

-- =============================================================================
-- 3. Reference tables: vehicle_body_types, plans - REVOKE ALL FROM authenticated then GRANT SELECT
-- =============================================================================
revoke all on public.vehicle_body_types from authenticated;
grant select on public.vehicle_body_types to authenticated;

revoke all on public.plans from authenticated;
grant select on public.plans to authenticated;

-- =============================================================================
-- 4. service_body_type_prices: per-tenant table edited by owners
-- authenticated KEEPS insert/update/delete; RLS enforces tenant isolation
-- =============================================================================
grant insert, update, delete on public.service_body_type_prices to authenticated;

-- =============================================================================
-- 5. expenses: restrict to admins only (not all members)
-- =============================================================================
drop policy if exists "tenant_access_expenses" on public.expenses;
create policy "tenant_access_expenses" on public.expenses
  for all using (
    business_id in (select public.my_business_ids())
    and public.is_admin(business_id)
  );

-- =============================================================================
-- 6. client_negotiated_prices: restrict to admins + cross-tenant guard
-- =============================================================================
drop policy if exists "tenant_access_client_negotiated_prices" on public.client_negotiated_prices;
create policy "tenant_access_client_negotiated_prices" on public.client_negotiated_prices
  for all using (
    business_id in (select public.my_business_ids())
    and public.is_admin(business_id)
  );

-- Cross-tenant guard: ensure client_id and service_id belong to same business
drop trigger if exists trg_client_negotiated_prices_cross_tenant on public.client_negotiated_prices;
create or replace function public.enforce_cnp_cross_tenant()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' or TG_OP = 'UPDATE' then
    -- Verify client belongs to the same business
    if NEW.client_id is not null then
      if not exists (
        select 1 from public.clients c
        where c.id = NEW.client_id
          and c.business_id = NEW.business_id
      ) then
        raise exception 'CROSS_TENANT_CLIENT: client_id does not belong to this business';
      end if;
    end if;
    -- Verify service belongs to the same business
    if NEW.service_id is not null then
      if not exists (
        select 1 from public.services s
        where s.id = NEW.service_id
          and s.business_id = NEW.business_id
      ) then
        raise exception 'CROSS_TENANT_SERVICE: service_id does not belong to this business';
      end if;
    end if;
    -- Verify body_type exists (if set)
    if NEW.body_type_id is not null then
      if not exists (
        select 1 from public.vehicle_body_types vbt
        where vbt.id = NEW.body_type_id
      ) then
        raise exception 'INVALID_BODY_TYPE: body_type_id does not exist';
      end if;
    end if;
  end if;
  return NEW;
end $$;
create trigger trg_client_negotiated_prices_cross_tenant
  before insert or update on public.client_negotiated_prices
  for each row execute function public.enforce_cnp_cross_tenant();

-- =============================================================================
-- 7. data_exports: restrict to admins only
-- =============================================================================
drop policy if exists "tenant_access_data_exports" on public.data_exports;
create policy "tenant_access_data_exports" on public.data_exports
  for all using (
    business_id in (select public.my_business_ids())
    and public.is_admin(business_id)
  );

-- =============================================================================
-- 8. expense_receipts: follow expenses policy (admin only)
-- =============================================================================
drop policy if exists "tenant_access_expense_receipts" on public.expense_receipts;
create policy "tenant_access_expense_receipts" on public.expense_receipts
  for all using (
    expense_id in (
      select id from public.expenses
      where business_id in (select public.my_business_ids())
        and public.is_admin(business_id)
    )
  );

-- =============================================================================
-- 11. service_body_type_prices: keep original access pattern (tenant isolation via RLS)
-- Managers edit price grids in Settings → Prestations
-- =============================================================================
drop policy if exists "tenant_access_service_body_type_prices" on public.service_body_type_prices;
create policy "tenant_access_service_body_type_prices" on public.service_body_type_prices
  for all using (
    service_id in (
      select id from public.services where business_id in (select public.my_business_ids())
    )
  );

-- =============================================================================
-- 12. services.cost_price_ht and cost_notes: move to admin-only table
-- Create service_cost_private table with admin-only RLS
-- =============================================================================
create table if not exists public.service_cost_private (
  service_id uuid primary key references public.services(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  cost_price_ht numeric(10,2) not null default 0,
  cost_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_service_cost_private_business on public.service_cost_private (business_id);

alter table public.service_cost_private enable row level security;

-- Admin-only access
create policy "service_cost_private_admin" on public.service_cost_private
  for all using (
    business_id in (select public.my_business_ids())
    and public.is_admin(business_id)
  );

create trigger trg_service_cost_private_updated_at before update on public.service_cost_private
  for each row execute procedure public.set_updated_at();

-- Migrate existing data from services
insert into public.service_cost_private (service_id, business_id, cost_price_ht, cost_notes)
select s.id, s.business_id, s.cost_price_ht, s.cost_notes
from public.services s
where s.cost_price_ht is not null or s.cost_notes is not null
on conflict (service_id) do update set
  cost_price_ht = excluded.cost_price_ht,
  cost_notes = excluded.cost_notes;

-- cohérence : une fiche de coût doit appartenir au même établissement que sa prestation
create or replace function public.enforce_scp_same_business() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.services s
                 where s.id = new.service_id and s.business_id = new.business_id) then
    raise exception 'CROSS_TENANT_SERVICE: service_id does not belong to this business';
  end if;
  return new;
end $$;

create trigger trg_service_cost_private_same_business
  before insert or update on public.service_cost_private
  for each row execute function public.enforce_scp_same_business();

-- les coûts n'existent plus que dans la table réservée aux admins
alter table public.services
  drop column if exists cost_price_ht,
  drop column if exists cost_notes;

-- =============================================================================
-- 13. Audit queries to verify policy state (run after migration)
-- =============================================================================
-- These are verification queries; they don't modify state.
-- Run them manually after applying the migration:

-- 13a. List all policies on affected tables (check for duplicates/true predicates)
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename IN (
--     'vehicle_body_types', 'service_body_type_prices', 'client_negotiated_prices',
--     'expenses', 'expense_receipts', 'data_exports', 'whatsapp_templates',
--     'inspection_checklists', 'inventory_rolls', 'plans', 'service_cost_private'
--   )
-- ORDER BY tablename, policyname;

-- 13b. Check for policies with qual = true or with_check = true (overly permissive)
-- SELECT schemaname, tablename, policyname, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND (qual = 'true' OR with_check = 'true')
--   AND tablename IN (
--     'vehicle_body_types', 'service_body_type_prices', 'client_negotiated_prices',
--     'expenses', 'expense_receipts', 'data_exports', 'whatsapp_templates',
--     'inspection_checklists', 'inventory_rolls', 'plans', 'service_cost_private'
--   );

-- 13c. Verify grants on reference tables
-- SELECT grantee, privilege_type
-- FROM information_schema.table_privileges
-- WHERE table_schema = 'public'
--   AND table_name IN ('vehicle_body_types', 'plans')
--   AND grantee IN ('anon', 'authenticated')
-- ORDER BY table_name, grantee, privilege_type;

-- 13d. Verify grants on service_body_type_prices (should have INSERT/UPDATE/DELETE for authenticated)
-- SELECT grantee, privilege_type
-- FROM information_schema.table_privileges
-- WHERE table_schema = 'public'
--   AND table_name = 'service_body_type_prices'
--   AND grantee IN ('anon', 'authenticated')
-- ORDER BY grantee, privilege_type;

-- 13e. Attack tests (run as authenticated non-admin member):
-- -- Should FAIL with PLAN_LIMIT_EMPLOYEES on Basic plan
-- -- Should FAIL with CROSS_TENANT_CLIENT/ SERVICE
-- -- Should FAIL on expenses/client_negotiated_prices/data_exports/inventory_rolls (is_admin)
-- -- Should SUCCEED on service_body_type_prices (owner)
-- -- Should FAIL on vehicle_body_types INSERT/UPDATE/DELETE
-- -- Should FAIL on plans INSERT/UPDATE/DELETE