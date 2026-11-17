-- Security Audit Queries for BookingPro
-- Run with: psql -f security_audit.sql -o docs/security-audit-output.txt

\echo '=== 1. Tables without RLS enabled ==='
SELECT
    n.nspname AS schemaname,
    c.relname AS tablename
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity = false
ORDER BY tablename;

\echo '\n=== 2. Policies with true predicates (Overly Permissive) ==='
SELECT
    schemaname,
    tablename,
    policyname,
    coalesce(qual, 'NULL') as qual,
    coalesce(with_check, 'NULL') as with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND (qual = 'true' OR with_check = 'true')
ORDER BY tablename;

\echo '\n=== 3. Function ACLs per role (including proacl) ==='
SELECT
    proname as function_name,
    proargtypes::regtype[] as args,
    proacl as access_control_list
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
ORDER BY proname;

\echo '\n=== 4. Anon privileges on tables and columns ==='
SELECT
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND grantee = 'anon'
ORDER BY table_name, privilege_type;

SELECT
    table_name,
    column_name,
    privilege_type
FROM information_schema.column_privileges
WHERE table_schema = 'public'
  AND grantee = 'anon'
ORDER BY table_name, column_name;

\echo '=== 5. Anon privileges on routines (functions/procedures) ==='
SELECT
    routine_name,
    specific_name,
    privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
  AND grantee = 'anon'
ORDER BY routine_name;

\echo '\n=== 6. Views and their ownership/RLS status ==='
SELECT
    schemaname,
    viewname,
    viewowner
FROM pg_views
WHERE schemaname = 'public'
ORDER BY viewname;

\echo '\n=== 7. Default Privileges for anon ==='
SELECT
    defaclnamespace::regnamespace as schema,
    defaclrole::regrole as owner,
    defaclobjtype as object_type,
    array_to_string(defaclacl, ', ') as privileges
FROM pg_default_acl
WHERE defaclnamespace::regnamespace::text = 'public';

\echo '\n=== 8. Policies without identity functions ==='
SELECT
    schemaname,
    tablename,
    policyname,
    coalesce(qual, '') || ' ' || coalesce(with_check, '') as combined_predicate
FROM pg_policies
WHERE schemaname = 'public'
  AND (qual IS NOT DISTINCT FROM 'true' OR with_check IS NOT DISTINCT FROM 'true')
ORDER BY tablename;

\echo '\n=== 9. Function privileges per role ==='
SELECT
    p.proname as function_name,
    p.pronamespace::regnamespace as func_schema,
    -- anon privileges
    has_function_privilege('anon', p.oid, 'execute') as anon_can_execute,
    has_function_privilege('authenticated', p.oid, 'execute') as authenticated_can_execute
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
ORDER BY proname;

\echo '\n=== 10. Sequence privileges for anon ==='
SELECT
    sequence_name,
    start_value,
    has_sequence_privilege('anon', sequence_name, 'usage') as anon_usage_privilege,
    has_sequence_privilege('anon', sequence_name, 'usage') as anon_nextval_privilege,
    has_sequence_privilege('anon', sequence_name, 'usage') as anon_setval_privilege,
    has_sequence_privilege('authenticated', sequence_name, 'usage') as authenticated_nextval_privilege,
    has_sequence_privilege('authenticated', sequence_name, 'usage') as authenticated_setval_privilege
FROM information_schema.sequences
WHERE sequence_schema = 'public'
ORDER BY sequence_name;