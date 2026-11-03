-- Migration 040: Audit Logs for Professional Activity Tracking & Triggers

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

drop policy if exists "Users can view audit logs of their business" on public.audit_logs;
create policy "Users can view audit logs of their business"
  on public.audit_logs for select
  to authenticated
  using (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  );

drop policy if exists "Users can insert audit logs for their business" on public.audit_logs;
create policy "Users can insert audit logs for their business"
  on public.audit_logs for insert
  to authenticated
  with check (
    business_id in (
      select id from public.businesses where owner_id = auth.uid()
    )
  );

-- Generic audit trigger function
create or replace function public.fn_log_audit_event()
returns trigger
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
  v_action text;
  v_entity_type text;
  v_entity_id uuid;
  v_metadata jsonb;
  v_user_email text;
  v_actor_name text;
begin
  -- Determine entity type based on table name
  if TG_TABLE_NAME = 'clients' then
    v_entity_type := 'client';
    v_business_id := coalesce(NEW.business_id, OLD.business_id);
    v_entity_id := coalesce(NEW.id, OLD.id);
  elsif TG_TABLE_NAME = 'inventory_items' then
    v_entity_type := 'inventory_item';
    v_business_id := coalesce(NEW.business_id, OLD.business_id);
    v_entity_id := coalesce(NEW.id, OLD.id);
  elsif TG_TABLE_NAME = 'appointments' then
    v_entity_type := 'appointment';
    v_business_id := coalesce(NEW.business_id, OLD.business_id);
    v_entity_id := coalesce(NEW.id, OLD.id);
  elsif TG_TABLE_NAME = 'employees' then
    v_entity_type := 'employee';
    v_business_id := coalesce(NEW.business_id, OLD.business_id);
    v_entity_id := coalesce(NEW.id, OLD.id);
  else
    return coalesce(NEW, OLD);
  end if;

  -- Determine action
  if TG_OP = 'INSERT' then
    v_action := upper(v_entity_type) || '_CREATED';
    v_metadata := to_jsonb(NEW);
  elsif TG_OP = 'UPDATE' then
    v_action := upper(v_entity_type) || '_UPDATED';
    v_metadata := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
  elsif TG_OP = 'DELETE' then
    v_action := upper(v_entity_type) || '_DELETED';
    v_metadata := to_jsonb(OLD);
  end if;

  -- Fetch user email / name from auth.users if available
  if auth.uid() is not null then
    select email, coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email)
    into v_user_email, v_actor_name
    from auth.users
    where id = auth.uid();
  end if;

  if v_actor_name is null then
    v_actor_name := coalesce(v_user_email, 'Utilisateur');
  end if;

  -- Inject actor_name into metadata
  v_metadata := jsonb_set(coalesce(v_metadata, '{}'::jsonb), '{actor_name}', to_jsonb(v_actor_name), true);

  -- Insert into audit_logs
  if v_business_id is not null then
    insert into public.audit_logs (business_id, user_id, action, entity_type, entity_id, metadata)
    values (
      v_business_id,
      auth.uid(),
      v_action,
      v_entity_type,
      v_entity_id,
      v_metadata
    );
  end if;

  return coalesce(NEW, OLD);
end;
$$ language plpgsql;

-- Attach triggers to tables
drop trigger if exists tr_audit_clients on public.clients;
create trigger tr_audit_clients
  after insert or update or delete on public.clients
  for each row execute function public.fn_log_audit_event();

drop trigger if exists tr_audit_inventory on public.inventory_items;
create trigger tr_audit_inventory
  after insert or update or delete on public.inventory_items
  for each row execute function public.fn_log_audit_event();

drop trigger if exists tr_audit_appointments on public.appointments;
create trigger tr_audit_appointments
  after insert or update or delete on public.appointments
  for each row execute function public.fn_log_audit_event();

drop trigger if exists tr_audit_employees on public.employees;
create trigger tr_audit_employees
  after insert or update or delete on public.employees
  for each row execute function public.fn_log_audit_event();
