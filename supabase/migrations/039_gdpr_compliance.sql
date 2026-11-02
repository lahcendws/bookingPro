-- Migration 039: GDPR Compliance (Consents, Soft Delete / Retention, Anonymization)

-- 6.4 Consent table
create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  consent_type text not null, -- e.g. 'terms_privacy', 'marketing', 'data_processing'
  version text not null default '1.0',
  accepted_at timestamptz not null default now(),
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_consents_user_id on public.consents(user_id);

-- Enable RLS on consents
alter table public.consents enable row level security;

create policy "Users can view their own consents"
  on public.consents for select
  using (auth.uid() = user_id);

create policy "Users can insert their own consents"
  on public.consents for insert
  with check (auth.uid() = user_id);

-- 6.2 Soft delete and retention columns on businesses
alter table public.businesses
  add column if not exists deleted_at timestamptz default null,
  add column if not exists retention_expires_at timestamptz default null;

create index if not exists idx_businesses_deleted_at on public.businesses(deleted_at);

-- 6.3 Anonymization function for historical transactions / clients
-- Replaces personal info with anonymized placeholders (e.g. "Customer #92817")
create or replace function public.anonymize_client(p_client_id uuid, p_anonymous_name text)
returns void
language plpgsql
security definer
as $$
begin
  update public.clients
  set
    name = p_anonymous_name,
    phone = null,
    email = null,
    notes = '[Anonymized for GDPR compliance]',
    telegram_id = null,
    viber_user_id = null,
    whatsapp_number = null,
    birthday = null
  where id = p_client_id;
end;
$$;
