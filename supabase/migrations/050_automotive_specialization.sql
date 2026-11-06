-- Create vehicles table
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  plate_number text not null,
  brand text not null,
  model text not null,
  year int,
  color text,
  vin text,
  notes text,
  created_at timestamptz default now() not null
);

alter table public.vehicles enable row level security;

create policy "Users can view vehicles of their business"
  on public.vehicles for select
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Users can manage vehicles of their business"
  on public.vehicles for all
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- Create inventory rolls table for PPF / Films
create table if not exists public.inventory_rolls (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  name text not null,
  total_length_m numeric not null,
  remaining_length_m numeric not null,
  cost_per_m numeric not null,
  min_threshold_m numeric default 5 not null,
  created_at timestamptz default now() not null
);

alter table public.inventory_rolls enable row level security;

create policy "Users can view inventory rolls of their business"
  on public.inventory_rolls for select
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Users can manage inventory rolls of their business"
  on public.inventory_rolls for all
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- Create inspection checklists table
create table if not exists public.inspection_checklists (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete cascade not null,
  photos_before jsonb default '[]'::jsonb,
  photos_after jsonb default '[]'::jsonb,
  client_signature_url text,
  created_at timestamptz default now() not null
);

-- Create warranties table
create table if not exists public.warranties (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  vehicle_id uuid references public.vehicles(id) on delete cascade not null,
  roll_id uuid references public.inventory_rolls(id) on delete set null,
  product_name text not null,
  lot_number text not null,
  duration_months int not null,
  qr_code_token text unique not null,
  pdf_url text,
  created_at timestamptz default now() not null
);

alter table public.warranties enable row level security;

create policy "Users can view warranties of their business"
  on public.warranties for select
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Users can manage warranties of their business"
  on public.warranties for all
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));
