-- 067_hardening_followup.sql

-- 1. extension GiST hors du schéma exposé par l'API
create schema if not exists extensions;
alter extension btree_gist set schema extensions;

-- 2. fonctions de déclencheur : aucun accès pour les utilisateurs connectés
do $$
declare r record;
begin
  for r in
    select p.oid::regprocedure as fn
    from pg_proc p
    where p.pronamespace = 'public'::regnamespace
      and pg_get_function_result(p.oid) = 'trigger'
      and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', r.fn);
  end loop;
end $$;

-- 3. séquences : plus d'accès anonyme
revoke all on all sequences in schema public from anon;
alter default privileges for role postgres in schema public revoke all on sequences from anon;