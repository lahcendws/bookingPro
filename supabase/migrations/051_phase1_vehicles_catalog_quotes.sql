-- Migration for Phase 1: Vehicles size class, Catalog matrix by size class, and Quotes & Quote Lines
alter table public.vehicles add column if not exists size_class text default 'berline' check (size_class in ('citadine', 'berline', 'suv', 'utilitaire'));

-- Add size class pricing & duration matrix to services table
alter table public.services add column if not exists pricing_by_size jsonb default '{}'::jsonb;

-- Create quotes table
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  vehicle_id uuid references public.vehicles(id) on delete cascade,
  status text default 'brouillon' check (status in ('brouillon', 'envoye', 'accepte', 'refuse', 'expire')),
  valid_until date,
  total_amount numeric default 0 not null,
  notes text,
  accepted_at timestamptz,
  created_at timestamptz default now() not null
);

alter table public.quotes enable row level security;

create policy "Users can view quotes of their business"
  on public.quotes for select
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Users can manage quotes of their business"
  on public.quotes for all
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- Create quote lines table
create table if not exists public.quote_lines (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid references public.quotes(id) on delete cascade not null,
  service_id uuid references public.services(id) on delete set null,
  description text not null,
  quantity numeric default 1 not null,
  unit_price numeric default 0 not null,
  total_price numeric default 0 not null,
  material_estimated_m numeric default 0
);

alter table public.quote_lines enable row level security;

create policy "Users can view quote lines of their business"
  on public.quote_lines for select
  to authenticated
  using (quote_id in (select id from public.quotes where business_id in (select id from public.businesses where owner_id = auth.uid())));

create policy "Users can manage quote lines of their business"
  on public.quote_lines for all
  to authenticated
  using (quote_id in (select id from public.quotes where business_id in (select id from public.businesses where owner_id = auth.uid())))
  with check (quote_id in (select id from public.quotes where business_id in (select id from public.businesses where owner_id = auth.uid())));
