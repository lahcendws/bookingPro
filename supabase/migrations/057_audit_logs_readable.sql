-- Migration 057: Robust Human-Readable Audit Logs & Triggers (Corrected)

-- 0. Ensure missing columns exist on audit_logs if table was created previously
alter table public.audit_logs
  add column if not exists entity_type text,
  add column if not exists entity_id uuid,
  add column if not exists actor_type text not null default 'user',
  add column if not exists actor_label text not null default 'Utilisateur',
  add column if not exists old_values jsonb,
  add column if not exists new_values jsonb,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

-- 1. Append-only: drop user insert policy (writes only via security definer trigger)
drop policy if exists "Users can insert audit logs for their business" on public.audit_logs;

create index if not exists idx_audit_logs_business_created
  on public.audit_logs (business_id, created_at desc);

-- 2. Helper functions for formatting names and labels (secure, robust)
create or replace function public._audit_user_name(p uuid) returns text
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select nullif(trim(coalesce(name,'')), '') from employees where user_id = p limit 1),
    (select coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email)
       from auth.users where id = p),
    'Utilisateur')
$$;

create or replace function public._audit_client_name(p uuid) returns text
language sql stable security definer set search_path = public as $$
  select nullif(trim(coalesce(name,'')), '')
  from clients where id = p
$$;

create or replace function public._audit_workstation_name(p uuid) returns text
language sql stable security definer set search_path = public as $$
  select name from workstations where id = p
$$;

create or replace function public._audit_employee_name(p uuid) returns text
language sql stable security definer set search_path = public as $$
  select nullif(trim(coalesce(name,'')), '')
  from employees where id = p
$$;

-- « PPF complet · Mégane (plate_number) » : prestation + véhicule
create or replace function public._audit_appointment_label(p_row jsonb) returns text
language sql stable security definer set search_path = public as $$
  select concat_ws(' · ',
    (select s.name
       from appointments app
       left join services s on s.id = app.service_id
      where app.id = (p_row->>'id')::uuid),
    (select concat(v.model, ' (', v.plate_number, ')')
       from vehicles v where v.id = (p_row->>'vehicle_id')::uuid))
$$;

-- Revoke execute from public/anon/authenticated on internal helpers
revoke execute on function public._audit_user_name(uuid) from public, anon, authenticated;
revoke execute on function public._audit_client_name(uuid) from public, anon, authenticated;
revoke execute on function public._audit_workstation_name(uuid) from public, anon, authenticated;
revoke execute on function public._audit_employee_name(uuid) from public, anon, authenticated;
revoke execute on function public._audit_appointment_label(jsonb) from public, anon, authenticated;

-- 3. Trigger réécrit (robust, multi-action, cascade delete protection, privacy for clients, resize moved)
create or replace function public.fn_log_audit_event()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_old jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) end;
  v_new jsonb := case when tg_op <> 'DELETE' then to_jsonb(new) end;
  v_row jsonb := coalesce(v_new, v_old);
  v_type text := case tg_table_name when 'appointments' then 'appointment'
                   when 'clients' then 'client' when 'jobs' then 'job' end;
  v_actor_type text := nullif(current_setting('app.actor_type', true), '');
  v_actor_label text;
  v_actions text[] := '{}';
  v_action text;
  v_old_d jsonb := '{}'::jsonb;
  v_new_d jsonb := '{}'::jsonb;
  v_meta jsonb := '{}'::jsonb;
  v_key text;
  v_client_name text;
begin
  if v_type is null or (v_row->>'business_id') is null then
    return coalesce(new, old);
  end if;

  -- Protection contre l'échec de suppression en cascade d'un business
  if tg_op = 'DELETE'
     and not exists (select 1 from public.businesses where id = (v_row->>'business_id')::uuid) then
    return old;
  end if;

  -- Acteur
  if v_actor_type is null then
    v_actor_type := case
      when tg_op = 'INSERT' and v_type = 'appointment' and v_row->>'source' = 'public' then 'client'
      when auth.uid() is not null then 'user'
      else 'system' end;
  end if;

  begin
    if v_actor_type = 'user' then
      v_actor_label := public._audit_user_name(auth.uid());
    elsif v_actor_type = 'client' then
      select nullif(trim(coalesce(name,'')), '') into v_client_name from clients where id = (v_row->>'client_id')::uuid;
      v_actor_label := coalesce('Client : ' || v_client_name, 'Client (réservation en ligne)');
    else
      v_actor_label := 'Système';
    end if;
  exception when others then
    v_actor_label := 'Utilisateur';
  end;

  -- Différences champ par champ (UPDATE) et actions
  if tg_op = 'UPDATE' then
    for v_key in select jsonb_object_keys(v_new) loop
      if v_key not in ('updated_at','created_at')
         and v_old->v_key is distinct from v_new->v_key then
        v_old_d := v_old_d || jsonb_build_object(v_key, v_old->v_key);
        v_new_d := v_new_d || jsonb_build_object(v_key, v_new->v_key);
      end if;
    end loop;

    if v_new_d = '{}'::jsonb then
      return new; -- rien d'utile n'a changé
    end if;

    if v_type = 'appointment' then
      if v_new_d ? 'status' and v_new->>'status' = 'cancelled' then
        v_actions := v_actions || 'cancelled';
      elsif v_new_d ? 'status' then
        v_actions := v_actions || 'status_changed';
      end if;
      if v_new_d ? 'starts_at' or v_new_d ? 'ends_at' or v_new_d ? 'workstation_id' then
        v_actions := v_actions || 'moved';
      end if;
      if v_new_d ? 'employee_id' then
        v_actions := v_actions || 'employee_changed';
      end if;
      if v_new_d ? 'deposit_status' then
        v_actions := v_actions || case v_new->>'deposit_status'
          when 'paid' then 'deposit_paid'
          when 'expired' then 'deposit_expired'
          else 'updated' end;
      end if;
    end if;
    if array_length(v_actions, 1) is null or array_length(v_actions, 1) = 0 then
      v_actions := array['updated'];
    end if;

  elsif tg_op = 'INSERT' then
    v_new_d := v_new - 'updated_at' - 'created_at';
    v_actions := array[case when v_actor_type = 'client' and v_type = 'appointment'
                            then 'public_booking_received' else 'created' end];
  else
    v_old_d := v_old - 'updated_at' - 'created_at';
    v_actions := array['deleted'];
  end if;

  -- Libellés figés (ne doivent jamais bloquer l'opération métier)
  begin
    if v_type = 'appointment' then
      v_meta := jsonb_build_object(
        'label',            public._audit_appointment_label(v_row),
        'client_name',      public._audit_client_name((v_row->>'client_id')::uuid),
        'workstation_from', public._audit_workstation_name((v_old->>'workstation_id')::uuid),
        'workstation_to',   public._audit_workstation_name((v_new->>'workstation_id')::uuid),
        'employee_from',    public._audit_employee_name((v_old->>'employee_id')::uuid),
        'employee_to',      public._audit_employee_name((v_new->>'employee_id')::uuid),
        'deposit_amount',   v_row->'deposit_amount');
    elsif v_type = 'client' then
      if tg_op = 'UPDATE' then
        v_meta := jsonb_build_object('label', public._audit_client_name((v_row->>'id')::uuid), 'fields', (select json_agg(k) from jsonb_object_keys(v_new_d) k));
      else
        v_meta := jsonb_build_object('label', public._audit_client_name((v_row->>'id')::uuid));
      end if;
    elsif v_type = 'job' then
      v_meta := jsonb_build_object('label', 'Chantier #' || left(v_row->>'id', 6));
    end if;
  exception when others then
    v_meta := '{}'::jsonb;
  end;

  -- RGPD: Ne pas stocker les valeurs personnelles de client dans old_values / new_values
  if v_type = 'client' then
    v_old_d := '{}'::jsonb;
    v_new_d := '{}'::jsonb;
  end if;

  foreach v_action in array v_actions loop
    insert into public.audit_logs (business_id, user_id, action, entity_type, entity_id,
                                   actor_type, actor_label, old_values, new_values, metadata)
    values ((v_row->>'business_id')::uuid,
            case when v_actor_type = 'user' then auth.uid() end,
            v_action, v_type, (v_row->>'id')::uuid,
            v_actor_type, v_actor_label,
            nullif(v_old_d,'{}'::jsonb), nullif(v_new_d,'{}'::jsonb), v_meta);
  end loop;

  return coalesce(new, old);
end $$;

-- Triggers linkage
drop trigger if exists tr_audit_appointments on public.appointments;
create trigger tr_audit_appointments
  after insert or update or delete on public.appointments
  for each row execute function public.fn_log_audit_event();

drop trigger if exists tr_audit_clients on public.clients;
create trigger tr_audit_clients
  after insert or update on public.clients
  for each row execute function public.fn_log_audit_event();

drop trigger if exists tr_audit_jobs on public.jobs;
create trigger tr_audit_jobs
  after insert or update on public.jobs
  for each row execute function public.fn_log_audit_event();
