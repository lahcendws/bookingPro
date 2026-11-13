-- 059_business_members.sql

-- 1. Table des membres et de leur rôle
create table if not exists public.business_members (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('admin','employee')),
  employee_id uuid references public.employees(id) on delete set null,
  created_at  timestamptz not null default now(),
  primary key (business_id, user_id)
);
create index if not exists idx_business_members_user on public.business_members (user_id);
create unique index if not exists uq_business_members_employee
  on public.business_members (employee_id) where employee_id is not null;
alter table public.business_members enable row level security;

-- 2. Reprise de l'existant : le propriétaire est TOUJOURS admin (répare aussi les cas cassés)
insert into public.business_members (business_id, user_id, role)
select id, owner_id, 'admin' from public.businesses where owner_id is not null
on conflict (business_id, user_id) do update set role = 'admin';

insert into public.business_members (business_id, user_id, role)
select e.business_id, e.user_id, 'employee'
from public.employees e where e.user_id is not null
on conflict (business_id, user_id) do nothing;

-- liaison membre <-> fiche employé (y compris la fiche du propriétaire)
update public.business_members m
set employee_id = e.id
from public.employees e
where e.user_id = m.user_id and e.business_id = m.business_id and m.employee_id is null;

-- 3. Fonctions d'aide (ne renvoient que l'état de l'appelant)
create or replace function public.is_member(p_business uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.business_members
                 where business_id = p_business and user_id = (select auth.uid()))
$$;

create or replace function public.is_admin(p_business uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.business_members
                 where business_id = p_business and user_id = (select auth.uid())
                   and role = 'admin')
$$;

-- 4. Politiques : chacun voit sa ligne, l'admin voit et gère tout
drop policy if exists "members: voir" on public.business_members;
create policy "members: voir" on public.business_members
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin(business_id));

drop policy if exists "members: admin gère" on public.business_members;
create policy "members: admin gère" on public.business_members
  for all to authenticated
  using (public.is_admin(business_id))
  with check (public.is_admin(business_id));

-- 5. Tout nouvel établissement : son créateur devient admin automatiquement
create or replace function public.handle_new_business() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.owner_id is not null then
    insert into public.business_members (business_id, user_id, role)
    values (new.id, new.owner_id, 'admin')
    on conflict (business_id, user_id) do update set role = 'admin';
  end if;
  return new;
end $$;

drop trigger if exists on_business_created on public.businesses;
create trigger on_business_created
  after insert on public.businesses
  for each row execute function public.handle_new_business();

-- 6. Le propriétaire ne peut être ni retiré ni rétrogradé
create or replace function public.protect_business_owner() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_owner uuid;
begin
  select owner_id into v_owner from public.businesses where id = old.business_id;
  if v_owner is null then
    return coalesce(new, old);          -- établissement supprimé (cascade)
  end if;
  if old.user_id = v_owner
     and (tg_op = 'DELETE' or new.role <> 'admin' or new.user_id <> old.user_id) then
    raise exception 'Le propriétaire ne peut être ni retiré ni rétrogradé';
  end if;
  return coalesce(new, old);
end $$;

drop trigger if exists tr_protect_business_owner on public.business_members;
create trigger tr_protect_business_owner
  before update or delete on public.business_members
  for each row execute function public.protect_business_owner();

-- 7. Le journal d'activité devient lisible par les admins uniquement
drop policy if exists "Users can view audit logs of their business" on public.audit_logs;
drop policy if exists "Admins view audit logs" on public.audit_logs;
create policy "Admins view audit logs" on public.audit_logs
  for select to authenticated using (public.is_admin(business_id));
