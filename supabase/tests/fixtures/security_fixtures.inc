-- Security Test Fixtures for pgTAP / supabase test db
-- Creates TWO businesses (A, B) with owners, employees, clients, appointments, jobs, inspections, checklists
-- This file should ONLY be included via \ir from security_tests.sql, not run standalone
-- NOTE: plan() calls are handled by the including test file, not here

-- =============================================================================
-- Step 1: Clean up existing test data
-- =============================================================================
-- Disable triggers to allow test data insertion without validation errors
alter table public.business_members disable trigger tr_protect_business_owner;
alter table public.appointments disable trigger prevent_double_booking;

-- Remove all test data from previous runs
delete from public.inspection_checklists;
delete from public.job_inspections;
delete from public.jobs;
delete from public.appointments;
delete from public.vehicles;
delete from public.clients;
delete from public.employees;
delete from public.business_members;
delete from public.businesses;
delete from auth.users;

-- Re-enable triggers
alter table public.business_members enable trigger tr_protect_business_owner;
alter table public.appointments enable trigger prevent_double_booking;

-- =============================================================================
-- Step 2: Setup Business A (tenant ID = 1, plan = pro)
-- =============================================================================

-- Auth users for tenant A
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'owner-a@test.invalid', 'pw', now(), now(), now(), '{}', '{}', 'authenticated', 'authenticated'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'owner-b@test.invalid', 'pw', now(), now(), now(), '{}', '{}', 'authenticated', 'authenticated'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'employee-a@test.invalid', 'pw', now(), now(), now(), '{}', '{}', 'authenticated', 'authenticated'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, 'admin-a@test.invalid', 'pw', now(), now(), now(), '{}', '{}', 'authenticated', 'authenticated')
on conflict (id) do update set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  aud = excluded.aud,
  role = excluded.role;

insert into public.businesses (id, owner_id, name, slug, timezone, currency, plan, plan_id, subscription_status)
values
  ('11111111-1111-1111-1111-111111111111'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Business A', 'business-a', 'Europe/Paris', 'EUR', 'pro', (select id from plans where slug='pro'), 'active')
on conflict (id) do update set
  owner_id = excluded.owner_id,
  name = excluded.name,
  slug = excluded.slug,
  timezone = excluded.timezone,
  currency = excluded.currency,
  plan = excluded.plan,
  plan_id = excluded.plan_id,
  subscription_status = excluded.subscription_status;

insert into public.business_members (business_id, user_id, role)
values
  ('11111111-1111-1111-1111-111111111111'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'admin'),
  ('11111111-1111-1111-1111-111111111111'::uuid, 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'employee'),
  ('11111111-1111-1111-1111-111111111111'::uuid, 'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, 'admin')
on conflict (business_id, user_id) do update set
  role = excluded.role;

insert into public.employees (id, business_id, user_id, name, role, is_active)
values
  ('e1111111-1111-1111-1111-111111111111'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'Employee A', 'employee', true)
on conflict (id) do update set
  business_id = excluded.business_id,
  user_id = excluded.user_id,
  name = excluded.name,
  role = excluded.role,
  is_active = excluded.is_active;

insert into public.clients (id, business_id, name, phone, email)
values
  ('c1111111-1111-1111-1111-111111111111'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'Client A1', '+33123456789', 'client-a1@test.invalid')
on conflict (id) do update set
  business_id = excluded.business_id,
  name = excluded.name,
  phone = excluded.phone,
  email = excluded.email;

insert into public.vehicles (id, business_id, client_id, plate_number, brand, model)
values
  ('d1111111-1111-1111-1111-111111111111'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'c1111111-1111-1111-1111-111111111111'::uuid, 'AA-123-AA', 'Peugeot', '308')
on conflict (id) do update set
  business_id = excluded.business_id,
  client_id = excluded.client_id,
  plate_number = excluded.plate_number,
  brand = excluded.brand,
  model = excluded.model;

insert into public.appointments (id, business_id, client_id, employee_id, service_id, starts_at, ends_at, status, source)
values
  ('f1111111-1111-1111-1111-111111111111'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'c1111111-1111-1111-1111-111111111111'::uuid, 'e1111111-1111-1111-1111-111111111111'::uuid, null, '2026-11-20 10:00:00+01', '2026-11-20 11:00:00+01', 'confirmed', 'manual')
on conflict (id) do update set
  business_id = excluded.business_id,
  client_id = excluded.client_id,
  employee_id = excluded.employee_id,
  service_id = excluded.service_id,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  status = excluded.status,
  source = excluded.source;

insert into public.jobs (id, business_id, client_id, vehicle_id, appointment_id, status, tracking_token)
values
  ('e1111111-1111-1111-1111-111111111111'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'c1111111-1111-1111-1111-111111111111'::uuid, 'd1111111-1111-1111-1111-111111111111'::uuid, 'f1111111-1111-1111-1111-111111111111'::uuid, 'reception', 'a1111111-1111-1111-1111-111111111111')
on conflict (id) do update set
  business_id = excluded.business_id,
  client_id = excluded.client_id,
  vehicle_id = excluded.vehicle_id,
  appointment_id = excluded.appointment_id,
  status = excluded.status,
  tracking_token = excluded.tracking_token;

insert into public.job_inspections (job_id, type, zones, signature_data, client_consent_gallery)
values
  ('e1111111-1111-1111-1111-111111111111'::uuid, 'reception', '[{"name":"Face avant","comments":"","photos":[]}]', null, false);

insert into public.inspection_checklists (appointment_id, vehicle_id, photos_before, photos_after, share_token, share_expires_at)
values
  ('f1111111-1111-1111-1111-111111111111'::uuid, 'd1111111-1111-1111-1111-111111111111'::uuid, '[]', '[]', 'share-token-a', now() + interval '7 days')
on conflict (share_token) do update set
  photos_before = excluded.photos_before,
  photos_after = excluded.photos_after,
  share_token = excluded.share_token,
  share_expires_at = excluded.share_expires_at;

-- =============================================================================
-- Step 3: Setup Business B (tenant ID = 2, plan = basic)
-- =============================================================================

insert into public.businesses (id, owner_id, name, slug, timezone, currency, plan, plan_id, subscription_status)
values
  ('b1111111-1111-1111-1111-111111111111'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Business B', 'business-b', 'Europe/Paris', 'EUR', 'basic', (select id from plans where slug='basic'), 'active')
on conflict (id) do update set
  owner_id = excluded.owner_id,
  name = excluded.name,
  slug = excluded.slug,
  timezone = excluded.timezone,
  currency = excluded.currency,
  plan = excluded.plan,
  plan_id = excluded.plan_id,
  subscription_status = excluded.subscription_status;

insert into public.business_members (business_id, user_id, role)
values
  ('b1111111-1111-1111-1111-111111111111'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'admin')
on conflict (business_id, user_id) do update set
  role = excluded.role;

insert into public.employees (id, business_id, user_id, name, role, is_active)
values
  ('f1111111-1111-1111-1111-111111111111'::uuid, 'b1111111-1111-1111-1111-111111111111'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'Owner B', 'admin', true)
on conflict (id) do update set
  business_id = excluded.business_id,
  user_id = excluded.user_id,
  name = excluded.name,
  role = excluded.role,
  is_active = excluded.is_active;

insert into public.clients (id, business_id, name, phone, email)
values
  ('c2222222-2222-2222-2222-222222222222'::uuid, 'b1111111-1111-1111-1111-111111111111'::uuid, 'Client B1', '+33987654321', 'client-b1@test.invalid')
on conflict (id) do update set
  business_id = excluded.business_id,
  name = excluded.name,
  phone = excluded.phone,
  email = excluded.email;

insert into public.vehicles (id, business_id, client_id, plate_number, brand, model)
values
  ('d2222222-2222-2222-2222-222222222222'::uuid, 'b1111111-1111-1111-1111-111111111111'::uuid, 'c2222222-2222-2222-2222-222222222222'::uuid, 'BB-456-BB', 'Renault', 'Clio')
on conflict (id) do update set
  business_id = excluded.business_id,
  client_id = excluded.client_id,
  plate_number = excluded.plate_number,
  brand = excluded.brand,
  model = excluded.model;

-- Business B: add a service first
insert into public.services (id, business_id, name, duration_min, price, capacity)
values
  ('s2222222-2222-2222-2222-222222222222'::uuid, 'b1111111-1111-1111-1111-111111111111'::uuid, 'Service B', 60, 5000, 1)
on conflict (id) do update set
  business_id = excluded.business_id,
  name = excluded.name,
  duration_min = excluded.duration_min,
  price = excluded.price,
  capacity = excluded.capacity;

insert into public.appointments (id, business_id, client_id, employee_id, service_id, starts_at, ends_at, status, source)
values
  ('f2222222-2222-2222-2222-222222222222'::uuid, 'b1111111-1111-1111-1111-111111111111'::uuid, 'c2222222-2222-2222-2222-222222222222'::uuid, 'f1111111-1111-1111-1111-111111111111'::uuid, 's2222222-2222-2222-2222-222222222222'::uuid, '2026-11-20 14:00:00+01', '2026-11-20 15:00:00+01', 'confirmed', 'manual')
on conflict (id) do update set
  business_id = excluded.business_id,
  client_id = excluded.client_id,
  employee_id = excluded.employee_id,
  service_id = excluded.service_id,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  status = excluded.status,
  source = excluded.source;

insert into public.jobs (id, business_id, client_id, vehicle_id, appointment_id, status, tracking_token)
values
  ('e2222222-2222-2222-2222-222222222222'::uuid, 'b1111111-1111-1111-1111-111111111111'::uuid, 'c2222222-2222-2222-2222-222222222222'::uuid, 'd2222222-2222-2222-2222-222222222222'::uuid, 'f2222222-2222-2222-2222-222222222222'::uuid, 'en_cours', 'e1111111-1111-1111-1111-111111111111')
on conflict (id) do update set
  business_id = excluded.business_id,
  client_id = excluded.client_id,
  vehicle_id = excluded.vehicle_id,
  appointment_id = excluded.appointment_id,
  status = excluded.status,
  tracking_token = excluded.tracking_token;

insert into public.job_inspections (job_id, type, zones, signature_data, client_consent_gallery)
values
  ('e2222222-2222-2222-2222-222222222222'::uuid, 'reception', '[{"name":"Face avant","comments":"","photos":[]}]', null, false);

insert into public.inspection_checklists (appointment_id, vehicle_id, photos_before, photos_after, share_token, share_expires_at)
values
  (null, 'd2222222-2222-2222-2222-222222222222'::uuid, '[]', '[]', 'share-token-b', now() + interval '7 days')
on conflict (share_token) do update set
  photos_before = excluded.photos_before,
  photos_after = excluded.photos_after,
  share_token = excluded.share_token,
  share_expires_at = excluded.share_expires_at;

rollback;