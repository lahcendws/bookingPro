-- Security Tests for Migration 065/066
-- Run with: supabase test db (requires pgTAP) or psql -f security_tests.sql

-- Include fixtures that set up Business A and Business B with employees
\i security_fixtures.inc

-- pgTAP test plan: 8 test assertions
SELECT plan(8);

-- =============================================================================
-- 1. Tables without RLS enabled
-- =============================================================================
SELECT ok(
  (SELECT count(*) = 0
   FROM pg_class c
   JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public'
     AND c.relkind = 'r'
     AND c.relrowsecurity = false),
  'No tables without RLS enabled'
);

-- =============================================================================
-- 2. Policies with true predicates (Overly Permissive)
-- Note: vehicle_body_types has "authenticated_read_vehicle_body_types" with qual='true'
-- This is allowed per migration 066 - it's authenticated-only access.
-- =============================================================================
SELECT ok(
  (SELECT count(*) = 0
   FROM pg_policies
   WHERE schemaname = 'public'
     AND (qual = 'true' OR with_check = 'true')
     AND tablename != 'vehicle_body_types'),
  'No policies with true predicates except vehicle_body_types'
);

-- =============================================================================
-- 3. Anon privileges on tables and columns (should be zero after migration 066)
-- =============================================================================
SELECT ok(
  (SELECT count(*) = 0
   FROM information_schema.table_privileges
   WHERE table_schema = 'public'
     AND grantee = 'anon'),
  'Anon has no table privileges'
);

-- =============================================================================
-- 4. Anon privileges on routines (functions/procedures) (should be zero after 066)
-- =============================================================================
SELECT ok(
  (SELECT count(*) = 0
   FROM information_schema.routine_privileges
   WHERE routine_schema = 'public'
     AND grantee = 'anon'),
  'Anon has no routine privileges'
);

-- =============================================================================
-- 5. RLS enabled on inspection_checklists (added in 065)
-- =============================================================================
SELECT ok(
  (SELECT count(*) = 1
   FROM pg_class c
   JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public'
     AND c.relname = 'inspection_checklists'
     AND c.relrowsecurity = true),
  'RLS enabled on inspection_checklists'
);

-- =============================================================================
-- 6. RLS enabled on all business tables
-- =============================================================================
SELECT ok(
  (SELECT count(*) = 0
   FROM pg_class c
   JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public'
     AND c.relkind = 'r'
     AND c.relname IN ('businesses', 'employees', 'clients', 'services', 'vehicles', 'appointments', 'jobs', 'job_inspections', 'inspection_checklists')
     AND c.relrowsecurity = false),
  'RLS enabled on all business tables'
);

-- =============================================================================
-- 7. Function execute privileges: anon should not execute trigger functions
-- Check via information_schema
-- =============================================================================
SELECT ok(
  (SELECT count(*) = 0
   FROM information_schema.routine_privileges
   WHERE routine_schema = 'public'
     AND grantee = 'anon'
     AND routine_name IN ('check_slot_availability', 'enforce_plan_immutability')),
  'Anon cannot execute check_slot_availability or enforce_plan_immutability'
);

-- =============================================================================
-- 8. Authenticated can execute is_member
-- =============================================================================
SELECT ok(
  (SELECT count(*) > 0
   FROM information_schema.routine_privileges
   WHERE routine_schema = 'public'
     AND grantee = 'authenticated'
     AND routine_name = 'is_member'),
  'Authenticated can execute is_member'
);

SELECT * FROM finish();