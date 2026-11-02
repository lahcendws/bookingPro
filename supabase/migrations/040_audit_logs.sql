-- Migration 040: Audit Logs for Professional Activity Tracking

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid, -- nullable if system action
  action text not null, -- e.g. CLIENT_CREATED, APPOINTMENT_CREATED, SETTINGS_UPDATED, etc.
  entity_type text not null, -- e.g. client, appointment, product, employee, settings, subscription
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_business_id on public.audit_logs(business_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);

-- Enable RLS on audit_logs
alter table public.audit_logs enable row level security;

create policy "Users can view audit logs of their business"
  on public.audit_logs for select
  to authenticated
  using (
    business_id in (
      select business_id from public.business_users where user_id = auth.uid()
    )
  );

create policy "Users can insert audit logs for their business"
  on public.audit_logs for insert
  to authenticated
  with check (
    business_id in (
      select business_id from public.business_users where user_id = auth.uid()
    )
  );
