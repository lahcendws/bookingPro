-- 060_link_owner_employee.sql
-- Trigger to auto-link owner employee to business_members with admin role

-- Fonction pour lier l'employé propriétaire à business_members
create or replace function public.link_owner_employee() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_owner uuid;
begin
  -- Seulement pour les insert/update d'employés avec user_id
  if new.user_id is null then
    return new;
  end if;

  select owner_id into v_owner from public.businesses where id = new.business_id;
  if v_owner is null then
    return new;
  end if;

  -- Si c'est l'employé du propriétaire
  if new.user_id = v_owner then
    -- Assurer l'entrée dans business_members avec role admin
    insert into public.business_members (business_id, user_id, role, employee_id)
    values (new.business_id, new.user_id, 'admin', new.id)
    on conflict (business_id, user_id) do update set role = 'admin', employee_id = new.id;
  else
    -- Pour les autres employés, créer/maj avec role employee
    insert into public.business_members (business_id, user_id, role, employee_id)
    values (new.business_id, new.user_id, 'employee', new.id)
    on conflict (business_id, user_id) do update set employee_id = new.id;
  end if;

  return new;
end $$;

-- Trigger sur employees
drop trigger if exists tr_link_owner_employee on public.employees;
create trigger tr_link_owner_employee
  after insert or update of user_id on public.employees
  for each row execute function public.link_owner_employee();

-- Backfill pour les employés propriétaires existants
update public.employees e
set user_id = b.owner_id
from public.businesses b
where e.business_id = b.id
  and e.user_id is null
  and b.owner_id is not null
  and e.name = (select trim(concat_ws(' ', first_name, last_name)) from auth.users u where u.id = b.owner_id);
