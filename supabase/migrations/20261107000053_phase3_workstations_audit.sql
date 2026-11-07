-- Migration 053: Phase 3 Workstations, Multi-day appointments & Activity Audit Trail

create table if not exists public.workstations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  name text not null,
  description text,
  is_active boolean default true not null,
  created_at timestamptz default now() not null
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);

alter table public.appointments
  add column if not exists workstation_id uuid references public.workstations(id) on delete set null,
  add column if not exists duration_days integer default 1 not null,
  add column if not exists deposit_amount numeric default 0 not null,
  add column if not exists deposit_status text default 'none' check (deposit_status in ('none', 'pending', 'paid', 'refunded'));

alter table public.workstations enable row level security;
alter table public.activity_logs enable row level security;

create policy "Users can manage workstations of their business"
  on public.workstations for all
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Users can view activity logs of their business"
  on public.activity_logs for select
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));
