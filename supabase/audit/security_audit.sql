begin;
select * from no_plan();   -- à remplacer par plan(N) une fois la suite stabilisée

-- ===== aide : se placer dans le rôle d'un utilisateur =====
create function pg_temp.act_as(p_uid uuid, p_role text default 'authenticated') returns void
language plpgsql as $$
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', p_uid::text, 'role', p_role)::text, true);
  execute format('set local role %I', p_role);
end $$;

-- ===== fixtures (superutilisateur, annulées par le rollback final) =====
insert into auth.users (id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at)
select u.id, u.email, 'x', now(), '{}', '{}', 'authenticated', 'authenticated', now(), now()
from (values
  ('a1000000-0000-4000-8000-000000000001'::uuid, 'owner-a@test.invalid'),
  ('a1000000-0000-4000-8000-000000000002'::uuid, 'owner-b@test.invalid'),
  ('a1000000-0000-4000-8000-000000000003'::uuid, 'employee-a@test.invalid'),
  ('a1000000-0000-4000-8000-000000000004'::uuid, 'admin2-a@test.invalid'),
  ('a1000000-0000-4000-8000-000000000005'::uuid, 'new-user@test.invalid')
) as u(id, email);

insert into public.businesses (id, owner_id, name, slug, timezone, currency, plan, plan_id, subscription_status)
values
 ('b1000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001','Business A','business-a','Europe/Paris','EUR','pro',   (select id from public.plans where slug='pro'),  'active'),
 ('b1000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000002','Business B','business-b','Europe/Paris','EUR','basic', (select id from public.plans where slug='basic'),'active');
-- le trigger crée déjà la ligne business_members (admin) des deux propriétaires

insert into public.employees (id, business_id, user_id, name, role, is_active) values
 ('e1000000-0000-4000-8000-000000000001','b1000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000003','Employee A','employee',true),
 ('e1000000-0000-4000-8000-000000000002','b1000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000002','Owner B','admin',true);
-- le trigger crée la ligne business_members de Employee A (rôle employee)

insert into public.business_members (business_id, user_id, role)
values ('b1000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000004','admin');

insert into public.clients (id, business_id, name, phone, email) values
 ('c1000000-0000-4000-8000-000000000001','b1000000-0000-4000-8000-000000000001','Client A1','+33123456789','client-a1@test.invalid'),
 ('c1000000-0000-4000-8000-000000000002','b1000000-0000-4000-8000-000000000002','Client B1','+33987654321','client-b1@test.invalid');

insert into public.vehicles (id, business_id, client_id, plate_number, brand, model) values
 ('d1000000-0000-4000-8000-000000000001','b1000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001','AA-123-AA','Peugeot','308'),
 ('d1000000-0000-4000-8000-000000000002','b1000000-0000-4000-8000-000000000002','c1000000-0000-4000-8000-000000000002','BB-456-BB','Renault','Clio');

insert into public.appointments (id, business_id, client_id, employee_id, service_id, starts_at, ends_at, status, source) values
 ('f1000000-0000-4000-8000-000000000001','b1000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000001',null,'2026-11-20 10:00:00+01','2026-11-20 11:00:00+01','confirmed','manual'),
 ('f1000000-0000-4000-8000-000000000002','b1000000-0000-4000-8000-000000000002','c1000000-0000-4000-8000-000000000002','e1000000-0000-4000-8000-000000000002',null,'2026-11-20 14:00:00+01','2026-11-20 15:00:00+01','confirmed','manual');

insert into public.jobs (id, business_id, client_id, vehicle_id, appointment_id, status) values
 ('91000000-0000-4000-8000-000000000001','b1000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001','d1000000-0000-4000-8000-000000000001','f1000000-0000-4000-8000-000000000001','reception'),
 ('91000000-0000-4000-8000-000000000002','b1000000-0000-4000-8000-000000000002','c1000000-0000-4000-8000-000000000002','d1000000-0000-4000-8000-000000000002','f1000000-0000-4000-8000-000000000002','en_cours');

insert into public.inspection_checklists (vehicle_id) values
 ('d1000000-0000-4000-8000-000000000001'),('d1000000-0000-4000-8000-000000000002');

-- ===== triggers de structure =====
select is((select role from public.business_members
           where business_id='b1000000-0000-4000-8000-000000000001' and user_id='a1000000-0000-4000-8000-000000000001'),
          'admin', 'le propriétaire est admin automatiquement');
select is((select role from public.business_members
           where business_id='b1000000-0000-4000-8000-000000000001' and user_id='a1000000-0000-4000-8000-000000000003'),
          'employee', 'un employé relié à un compte reçoit le rôle employee');
select ok((select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
           where n.nspname='public' and c.relkind='r' and not c.relrowsecurity) = 0,
          'toutes les tables publiques ont la RLS');

-- ===== visiteur anonyme =====
reset role; set local role anon;
select throws_ok($$select count(*) from public.businesses$$, '42501', null, 'anon ne lit pas businesses');
select throws_ok($$select count(*) from public.jobs$$,       '42501', null, 'anon ne lit pas jobs');
select throws_ok($$select public.anonymize_client('c1000000-0000-4000-8000-000000000001','x')$$,
                 '42501', null, 'anon ne peut pas anonymiser');

-- ===== propriétaire de A : isolation avec contrôles positifs =====
reset role; select pg_temp.act_as('a1000000-0000-4000-8000-000000000001');
select is((select count(*)::int from public.clients), 1, 'A voit son client et pas celui de B');
select is((select count(*)::int from public.jobs), 1, 'A voit son chantier et pas celui de B');
select is((select count(*)::int from public.inspection_checklists), 1, 'A voit sa fiche d''état des lieux seulement');
select throws_ok($$insert into public.clients (business_id, name) values ('b1000000-0000-4000-8000-000000000002','intrus')$$,
                 '42501', null, 'A ne peut pas écrire chez B');
select is((with u as (update public.clients set name='piraté' where id='c1000000-0000-4000-8000-000000000002' returning 1)
           select count(*)::int from u), 0, 'A ne peut pas modifier le client de B');
select throws_like($$update public.businesses set plan_id=(select id from public.plans where slug='business')
                     where id='b1000000-0000-4000-8000-000000000001'$$,
                   'PLAN_IMMUTABLE%', 'un propriétaire ne peut pas changer son plan');
select throws_ok($$update public.audit_logs set metadata='{}'::jsonb$$, '42501', null, 'journal en ajout seul');

-- ===== anonymisation : trois acteurs =====
reset role; select pg_temp.act_as('a1000000-0000-4000-8000-000000000003');   -- employé de A
select throws_ok($$select public.anonymize_client('c1000000-0000-4000-8000-000000000001','x')$$,
                 'P0001', 'FORBIDDEN', 'un employé ne peut pas anonymiser');
reset role; select pg_temp.act_as('a1000000-0000-4000-8000-000000000002');   -- admin de B
select throws_ok($$select public.anonymize_client('c1000000-0000-4000-8000-000000000001','x')$$,
                 'P0001', 'FORBIDDEN', 'l''admin d''un autre établissement ne peut pas anonymiser');
reset role; select pg_temp.act_as('a1000000-0000-4000-8000-000000000004');   -- admin de A
select lives_ok($$select public.anonymize_client('c1000000-0000-4000-8000-000000000001','Client anonymisé')$$,
                'un admin de l''établissement peut anonymiser');
reset role;
select is((select count(*)::int from public.audit_logs
           where concat_ws(' ', old_values::text, new_values::text, metadata::text, actor_label)
                 ~* '(33123456789|client-a1@test\.invalid|Client A1)'),
          0, 'plus aucune donnée personnelle dans le journal');

-- ===== plan : service_role et insertion cliente =====
select pg_temp.act_as('a1000000-0000-4000-8000-000000000001', 'service_role');
select lives_ok($$update public.businesses set plan_id=(select id from public.plans where slug='business')
                  where id='b1000000-0000-4000-8000-000000000001'$$, 'service_role peut changer le plan');
reset role; select pg_temp.act_as('a1000000-0000-4000-8000-000000000005');
select lives_ok($$insert into public.businesses (owner_id, name, slug, plan, plan_id)
                  values ('a1000000-0000-4000-8000-000000000005','Nouveau','zz-forced','business',
                          (select id from public.plans where slug='business'))$$,
                'un client peut créer son établissement');
reset role;
select is((select plan from public.businesses where slug='zz-forced'), 'basic',
          'l''établissement créé par un client est forcé en basic');

select * from finish();
rollback;