-- Migration 062: Vehicles, Body Types (Gabarits), and Pricing Matrix
-- Implements Qlyo Phase 1 MVP: Véhicules & Gabarits + Tarifs par gabarit

-- ========================
-- VEHICLE BODY TYPES (Gabarits de référence)
-- ========================
create table if not exists public.vehicle_body_types (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  label         text not null,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

-- Insertion des 10 gabarits standards Qlyo
insert into public.vehicle_body_types (code, label, display_order) values
  ('moto', 'Moto', 1),
  ('citadine', 'Citadine', 2),
  ('berline', 'Berline', 3),
  ('break', 'Break', 4),
  ('suv', 'SUV / 4x4', 5),
  ('monospace', 'Monospace', 6),
  ('utilitaire', 'Utilitaire', 7),
  ('camping_car', 'Camping-car', 8),
  ('poids_lourd', 'Poids lourd', 9),
  ('autre', 'Autre', 10)
on conflict (code) do update set label = excluded.label, display_order = excluded.display_order;

alter table public.vehicle_body_types enable row level security;

create policy "tenant_access_vehicle_body_types" on public.vehicle_body_types
  for all using (true);

-- ========================
-- VEHICLES - Extension de la table existante
-- ========================
alter table public.vehicles
  add column if not exists body_type_id uuid references public.vehicle_body_types(id) on delete set null,
  add column if not exists size_class text,
  add column if not exists license_plate text,
  add column if not exists notes text;

-- Contrainte d'unicité : une immatriculation par business
create unique index if not exists uq_vehicles_business_license_plate
  on public.vehicles (business_id, license_plate)
  where license_plate is not null;

create index if not exists idx_vehicles_body_type on public.vehicles (body_type_id);
create index if not exists idx_vehicles_client on public.vehicles (client_id);

-- ========================
-- SERVICE BODY TYPE PRICES (Tarifs par gabarit par prestation)
-- ========================
create table if not exists public.service_body_type_prices (
  id                uuid primary key default gen_random_uuid(),
  service_id        uuid not null references public.services(id) on delete cascade,
  body_type_id      uuid not null references public.vehicle_body_types(id) on delete cascade,
  price_ht          numeric(10,2) not null default 0,
  duration_min      integer,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (service_id, body_type_id)
);

create index if not exists idx_service_body_type_prices_service on public.service_body_type_prices (service_id);
create index if not exists idx_service_body_type_prices_body_type on public.service_body_type_prices (body_type_id);

alter table public.service_body_type_prices enable row level security;

create policy "tenant_access_service_body_type_prices" on public.service_body_type_prices
  for all using (
    service_id in (
      select id from public.services where business_id in (select public.my_business_ids())
    )
  );

create trigger trg_service_body_type_prices_updated_at before update on public.service_body_type_prices
  for each row execute procedure public.set_updated_at();

-- ========================
-- CLIENT NEGOTIATED PRICES (Tarifs négociés par client - Offre Pro)
-- ========================
create table if not exists public.client_negotiated_prices (
  id                uuid primary key default gen_random_uuid(),
  business_id       uuid not null references public.businesses(id) on delete cascade,
  client_id         uuid not null references public.clients(id) on delete cascade,
  service_id        uuid not null references public.services(id) on delete cascade,
  body_type_id      uuid references public.vehicle_body_types(id) on delete set null,
  price_ht          numeric(10,2) not null,
  valid_from        date not null default current_date,
  valid_to          date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (client_id, service_id, body_type_id, valid_from)
);

create index if not exists idx_client_negotiated_prices_client on public.client_negotiated_prices (client_id);
create index if not exists idx_client_negotiated_prices_service on public.client_negotiated_prices (service_id);
create index if not exists idx_client_negotiated_prices_validity on public.client_negotiated_prices (valid_from, valid_to);

alter table public.client_negotiated_prices enable row level security;

create policy "tenant_access_client_negotiated_prices" on public.client_negotiated_prices
  for all using (business_id in (select public.my_business_ids()));

create trigger trg_client_negotiated_prices_updated_at before update on public.client_negotiated_prices
  for each row execute procedure public.set_updated_at();

-- ========================
-- EXPENSES (Charges pour rentabilité - Phase 2)
-- ========================
create table if not exists public.expenses (
  id                uuid primary key default gen_random_uuid(),
  business_id       uuid not null references public.businesses(id) on delete cascade,
  category          text not null check (category in ('fixed', 'variable', 'consumable')),
  description       text not null,
  amount_ht         numeric(10,2) not null,
  tax_rate          numeric(5,2) not null default 20,
  tax_amount        numeric(10,2) generated always as (amount_ht * tax_rate / 100) stored,
  total_ttc         numeric(10,2) generated always as (amount_ht + amount_ht * tax_rate / 100) stored,
  expense_date      date not null default current_date,
  is_recurring      boolean not null default false,
  recurrence_rule   text,
  receipt_url       text,
  receipt_file_name text,
  receipt_size_bytes integer,
  notes             text,
  created_by        uuid references auth.users(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_expenses_business on public.expenses (business_id);
create index if not exists idx_expenses_date on public.expenses (expense_date);
create index if not exists idx_expenses_category on public.expenses (category);

alter table public.expenses enable row level security;

create policy "tenant_access_expenses" on public.expenses
  for all using (business_id in (select public.my_business_ids()));

create trigger trg_expenses_updated_at before update on public.expenses
  for each row execute procedure public.set_updated_at();

-- ========================
-- EXPENSE RECEIPTS (Photos justificatifs charges)
-- ========================
create table if not exists public.expense_receipts (
  id                uuid primary key default gen_random_uuid(),
  expense_id        uuid not null references public.expenses(id) on delete cascade,
  url               text not null,
  file_name         text not null,
  file_size_bytes   integer not null,
  mime_type         text not null,
  width             integer,
  height            integer,
  exif_purged       boolean not null default true,
  uploaded_at       timestamptz not null default now()
);

create index if not exists idx_expense_receipts_expense on public.expense_receipts (expense_id);

alter table public.expense_receipts enable row level security;

create policy "tenant_access_expense_receipts" on public.expense_receipts
  for all using (
    expense_id in (
      select id from public.expenses where business_id in (select public.my_business_ids())
    )
  );

-- ========================
-- SERVICE COST PRICE (Coût consommable par prestation pour marge)
-- ========================
alter table public.services
  add column if not exists cost_price_ht numeric(10,2) default 0,
  add column if not exists cost_notes text;

-- ========================
-- DATA EXPORTS LOG (Export & Portabilité - Phase 8)
-- ========================
create table if not exists public.data_exports (
  id                uuid primary key default gen_random_uuid(),
  business_id       uuid not null references public.businesses(id) on delete cascade,
  entity            text not null,
  format            text not null check (format in ('csv', 'json', 'xlsx')),
  file_url          text,
  file_size_bytes   integer,
  status            text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  requested_by      uuid not null references auth.users(id) on delete cascade,
  error_message     text,
  created_at        timestamptz not null default now(),
  completed_at      timestamptz
);

create index if not exists idx_data_exports_business on public.data_exports (business_id);
create index if not exists idx_data_exports_status on public.data_exports (status);

alter table public.data_exports enable row level security;

create policy "tenant_access_data_exports" on public.data_exports
  for all using (business_id in (select public.my_business_ids()));

-- ========================
-- WHATSAPP TEMPLATES (Phase 6)
-- ========================
create table if not exists public.whatsapp_templates (
  id                uuid primary key default gen_random_uuid(),
  business_id       uuid not null references public.businesses(id) on delete cascade,
  key               text not null,
  label             text not null,
  content_template  text not null,
  variables_json    jsonb not null default '[]'::jsonb,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (business_id, key)
);

create index if not exists idx_whatsapp_templates_business on public.whatsapp_templates (business_id);

alter table public.whatsapp_templates enable row level security;

create policy "tenant_access_whatsapp_templates" on public.whatsapp_templates
  for all using (business_id in (select public.my_business_ids()));

create trigger trg_whatsapp_templates_updated_at before update on public.whatsapp_templates
  for each row execute procedure public.set_updated_at();

-- ========================
-- INTERVENTION CHECKLISTS EXTENSION (Phase 3)
-- ========================
alter table public.inspection_checklists
  add column if not exists photos_before jsonb default '[]'::jsonb,
  add column if not exists photos_after jsonb default '[]'::jsonb,
  add column if not exists client_signature_data_url text,
  add column if not exists client_signed_at timestamptz,
  add column if not exists intervention_pdf_url text,
  add column if not exists share_token text unique,
  add column if not exists share_expires_at timestamptz;

-- ========================
-- GRANT PERMISSIONS (Pour PostgREST)
-- ========================
GRANT ALL ON TABLE public.vehicle_body_types TO anon, authenticated;
GRANT ALL ON TABLE public.service_body_type_prices TO anon, authenticated;
GRANT ALL ON TABLE public.client_negotiated_prices TO anon, authenticated;
GRANT ALL ON TABLE public.expenses TO anon, authenticated;
GRANT ALL ON TABLE public.expense_receipts TO anon, authenticated;
GRANT ALL ON TABLE public.data_exports TO anon, authenticated;
GRANT ALL ON TABLE public.whatsapp_templates TO anon, authenticated;
GRANT ALL ON TABLE public.inspection_checklists TO anon, authenticated;