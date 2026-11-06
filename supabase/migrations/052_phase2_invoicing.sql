-- Migration 052: Phase 2 Invoicing, Credit Notes & Deposits
-- Called by Supabase CLI db push. No existing migration file handles Phase 2 invoices, invoice lines, and payments.
-- Data schemas: public.invoices, public.invoice_lines, public.payments referencing businesses, clients, and quotes.
-- User instruction: "utilise superpowers pour planifier, implementer et faire revue de code et skill playright pour tester en direct dans le navigateur pour developper ce ci: Phase 2 : facturation conforme et acompte"

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  quote_id uuid references public.quotes(id) on delete set null,
  type text default 'invoice' check (type in ('invoice', 'credit_note')),
  number text unique not null,
  status text default 'draft' check (status in ('draft', 'issued', 'paid', 'partially_paid', 'cancelled')),
  subtotal numeric default 0 not null,
  tax_amount numeric default 0 not null,
  total_amount numeric default 0 not null,
  deposit_paid numeric default 0 not null,
  balance_due numeric default 0 not null,
  due_date date,
  issued_at timestamptz,
  stripe_payment_link text,
  notes text,
  created_at timestamptz default now() not null
);

create table if not exists public.invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  service_id uuid references public.services(id) on delete set null,
  description text not null,
  quantity numeric default 1 not null,
  unit_price numeric default 0 not null,
  tax_rate numeric default 20 not null,
  total_price numeric default 0 not null
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  business_id uuid references public.businesses(id) on delete cascade not null,
  amount numeric default 0 not null,
  method text default 'stripe' check (method in ('stripe', 'cash', 'card', 'transfer', 'check')),
  stripe_payment_intent_id text,
  status text default 'completed' check (status in ('pending', 'completed', 'refunded')),
  created_at timestamptz default now() not null
);

alter table public.invoices enable row level security;
alter table public.invoice_lines enable row level security;
alter table public.payments enable row level security;

create policy "Users can view invoices of their business"
  on public.invoices for select
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Users can manage invoices of their business"
  on public.invoices for all
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Users can view invoice lines of their business"
  on public.invoice_lines for select
  to authenticated
  using (invoice_id in (select id from public.invoices where business_id in (select id from public.businesses where owner_id = auth.uid())));

create policy "Users can manage invoice lines of their business"
  on public.invoice_lines for all
  to authenticated
  using (invoice_id in (select id from public.invoices where business_id in (select id from public.businesses where owner_id = auth.uid())))
  with check (invoice_id in (select id from public.invoices where business_id in (select id from public.businesses where owner_id = auth.uid())));

create policy "Users can view payments of their business"
  on public.payments for select
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Users can manage payments of their business"
  on public.payments for all
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));
