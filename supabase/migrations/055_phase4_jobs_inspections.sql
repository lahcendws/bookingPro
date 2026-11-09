-- Migration 055: Phase 4 Jobs & Inspections
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  quote_id uuid references public.quotes(id) on delete set null,
  appointment_id uuid references public.appointments(id) on delete set null,
  client_id uuid references public.clients(id) on delete cascade not null,
  vehicle_id uuid references public.vehicles(id) on delete cascade not null,
  status text not null default 'reception' check (status in ('reception', 'en_cours', 'controle', 'livre')),
  tracking_token uuid default gen_random_uuid() unique not null,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.job_inspections (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id) on delete cascade not null,
  type text not null check (type in ('reception', 'delivery')),
  zones jsonb default '[]'::jsonb not null,
  signature_data text,
  client_consent_gallery boolean default false not null,
  created_at timestamptz default now() not null
);

alter table public.jobs enable row level security;
alter table public.job_inspections enable row level security;

create policy "Users can manage jobs of their business"
  on public.jobs for all
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Public can view jobs via tracking token"
  on public.jobs for select
  to anon, authenticated
  using (true);

create policy "Users can manage inspections of their business jobs"
  on public.job_inspections for all
  to authenticated
  using (job_id in (select id from public.jobs where business_id in (select id from public.businesses where owner_id = auth.uid())))
  with check (job_id in (select id from public.jobs where business_id in (select id from public.businesses where owner_id = auth.uid())));

create policy "Public can view inspections via tracking token"
  on public.job_inspections for select
  to anon, authenticated
  using (true);

GRANT ALL ON TABLE public.jobs TO anon, authenticated;
GRANT ALL ON TABLE public.job_inspections TO anon, authenticated;
