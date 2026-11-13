-- 061_fix_existing_owner_link.sql
-- Backfill: link existing owner employees to business_members

-- Pour chaque business, trouver l'employé qui correspond au owner (par email ou nom)
update public.business_members bm
set employee_id = e.id
from public.employees e
where e.user_id = bm.user_id
  and e.business_id = bm.business_id
  and bm.employee_id is null;

-- S'assurer que les propriétaires ont le role admin
update public.business_members bm
set role = 'admin'
from public.businesses b
where bm.business_id = b.id
  and bm.user_id = b.owner_id
  and bm.role <> 'admin';

-- Si un business a un owner mais pas d'entrée dans business_members, la créer
insert into public.business_members (business_id, user_id, role)
select id, owner_id, 'admin'
from public.businesses
where owner_id is not null
on conflict (business_id, user_id) do update set role = 'admin';

-- Lier l'employee_id pour les propriétaires si pas déjà fait
update public.business_members bm
set employee_id = e.id
from public.employees e
where e.user_id = bm.user_id
  and e.business_id = bm.business_id
  and bm.employee_id is null
  and bm.role = 'admin';
