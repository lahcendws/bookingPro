-- E2E Test Data Seed - local Supabase
-- Uses the existing E2E auth users already present in the local database.
-- Run from PowerShell:
-- Get-Content .\supabase\seed\e2e-test-data.sql -Raw | docker exec -i supabase_db_bookingPro psql -v ON_ERROR_STOP=1 -U postgres -d postgres

BEGIN;

-- ---------------------------------------------------------------------------
-- Fixed E2E IDs for public data
-- ---------------------------------------------------------------------------
-- business      a2e00000-0000-4000-8000-000000000001
-- appointment   a2e00000-1111-4111-8111-111111111111
-- vehicle       a2e00000-2222-4222-8222-222222222222
-- client        a2e00000-3333-4333-8333-333333333333
-- service 1     a2e00000-4444-4444-8444-444444444444
-- service 2     a2e00000-5555-4555-8555-555555555555
-- employee      a2e00000-6666-4666-8666-666666666666
-- job           a2e11111-1111-4111-8111-111111111111
--
-- Existing auth users in the local DB:
-- owner    e4c45cd5-ffe4-4c2f-aa27-91e9ef6788ab
-- employee 7ae3a5d2-5340-48a0-be08-6ca61303f4ca

-- ---------------------------------------------------------------------------
-- Clean up previous E2E public data
-- ---------------------------------------------------------------------------
DELETE FROM public.inspection_checklists
WHERE appointment_id = 'a2e00000-1111-4111-8111-111111111111'::uuid;

DELETE FROM public.job_inspections
WHERE job_id = 'a2e11111-1111-4111-8111-111111111111'::uuid;

DELETE FROM public.jobs
WHERE id = 'a2e11111-1111-4111-8111-111111111111'::uuid;

DELETE FROM public.appointments
WHERE id = 'a2e00000-1111-4111-8111-111111111111'::uuid;

DELETE FROM public.vehicles
WHERE id = 'a2e00000-2222-4222-8222-222222222222'::uuid;

DELETE FROM public.clients
WHERE id = 'a2e00000-3333-4333-8333-333333333333'::uuid;

DELETE FROM public.services
WHERE id IN (
  'a2e00000-4444-4444-8444-444444444444'::uuid,
  'a2e00000-5555-4555-8555-555555555555'::uuid
);

DELETE FROM public.employees
WHERE id = 'a2e00000-6666-4666-8666-666666666666'::uuid;

-- Skip deleting business_members that include the owner to avoid protect_business_owner error
-- DELETE FROM public.business_members WHERE business_id = 'a2e00000-0000-4000-8000-000000000001'::uuid;

DELETE FROM public.business_hours
WHERE business_id = 'a2e00000-0000-4000-8000-000000000001'::uuid;

DELETE FROM public.businesses
WHERE id = 'a2e00000-0000-4000-8000-000000000001'::uuid;

-- Do NOT delete auth.users.
-- The local database already contains the E2E users and their UUIDs are reused below.

-- ---------------------------------------------------------------------------
-- Verify the existing auth users
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = 'e4c45cd5-ffe4-4c2f-aa27-91e9ef6788ab'::uuid
      AND email = 'e2e-owner@test.invalid'
  ) THEN
    RAISE EXCEPTION 'Missing E2E owner auth user: e2e-owner@test.invalid';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = '7ae3a5d2-5340-48a0-be08-6ca61303f4ca'::uuid
      AND email = 'e2e-employee@test.invalid'
  ) THEN
    RAISE EXCEPTION 'Missing E2E employee auth user: e2e-employee@test.invalid';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Initialize reference data: vehicle body types (Qlyo standard)
-- ---------------------------------------------------------------------------
INSERT INTO public.vehicle_body_types (code, label, label_en, label_es, icon, display_order) VALUES
  ('berline', 'Berline', 'Sedan', 'Berlina', '🚗', 1),
  ('break', 'Break', 'Wagon', 'Familiar', '🚙', 2),
  ('suv', 'SUV / 4x4', 'SUV / 4x4', 'SUV / 4x4', '🚙', 3),
  ('citadine', 'Citadine', 'City Car', 'Urbano', '🚗', 4),
  ('utilitaire', 'Utilitaire', 'Van / Utility', 'Furgoneta', '🚐', 5),
  ('moto', 'Moto / Scooter', 'Motorcycle / Scooter', 'Moto / Scooter', '🏍️', 6),
  ('camion', 'Camion', 'Truck', 'Camión', '🚛', 7),
  ('autre', 'Autre', 'Other', 'Otro', '❓', 8)
ON CONFLICT (code) DO UPDATE SET
  label = EXCLUDED.label,
  label_en = EXCLUDED.label_en,
  label_es = EXCLUDED.label_es,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order;

-- ---------------------------------------------------------------------------
-- Business
-- ---------------------------------------------------------------------------
INSERT INTO public.businesses (
  id,
  owner_id,
  name,
  slug,
  timezone,
  currency,
  plan,
  plan_id,
  subscription_status
)
VALUES (
  'a2e00000-0000-4000-8000-000000000001'::uuid,
  'e4c45cd5-ffe4-4c2f-aa27-91e9ef6788ab'::uuid,
  'Salon Alpha E2E',
  'salon-alpha-e2e',
  'Europe/Paris',
  'EUR',
  'pro',
  (SELECT id FROM public.plans WHERE slug = 'pro'),
  'active'
)
ON CONFLICT (id) DO UPDATE SET
  owner_id = EXCLUDED.owner_id,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  timezone = EXCLUDED.timezone,
  currency = EXCLUDED.currency,
  plan = EXCLUDED.plan,
  plan_id = EXCLUDED.plan_id,
  subscription_status = EXCLUDED.subscription_status;

-- ---------------------------------------------------------------------------
-- Business members
-- ---------------------------------------------------------------------------
INSERT INTO public.business_members (business_id, user_id, role)
VALUES
  (
    'a2e00000-0000-4000-8000-000000000001'::uuid,
    'e4c45cd5-ffe4-4c2f-aa27-91e9ef6788ab'::uuid,
    'admin'
  ),
  (
    'a2e00000-0000-4000-8000-000000000001'::uuid,
    '7ae3a5d2-5340-48a0-be08-6ca61303f4ca'::uuid,
    'employee'
  )
ON CONFLICT (business_id, user_id) DO UPDATE SET
  role = EXCLUDED.role;

-- ---------------------------------------------------------------------------
-- Employee (owner as employee in their business)
-- ---------------------------------------------------------------------------
INSERT INTO public.employees (
  id, business_id, user_id, name, role, is_active
)
VALUES (
  'a2e00000-6666-4666-8666-666666666666'::uuid,
  'a2e00000-0000-4000-8000-000000000001'::uuid,
  'e4c45cd5-ffe4-4c2f-aa27-91e9ef6788ab'::uuid,
  'Alice E2E',
  'employee',
  true
)
ON CONFLICT (id) DO UPDATE SET
  business_id = EXCLUDED.business_id,
  user_id = EXCLUDED.user_id,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- ---------------------------------------------------------------------------
-- E2E Employee (authenticated user who is NOT the business owner)
-- ---------------------------------------------------------------------------
INSERT INTO public.employees (
  id, business_id, user_id, name, role, is_active
)
VALUES (
  'e4c45cd5-ffe4-4c2f-aa27-91e9ef6788ac'::uuid,
  'a2e00000-0000-4000-8000-000000000001'::uuid,
  '7ae3a5d2-5340-48a0-be08-6ca61303f4ca'::uuid,
  'E2E Employee',
  'employee',
  true
)
ON CONFLICT (id) DO UPDATE SET
  business_id = EXCLUDED.business_id,
  user_id = EXCLUDED.user_id,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- ---------------------------------------------------------------------------
-- Client
-- ---------------------------------------------------------------------------
INSERT INTO public.clients (
  id, business_id, name, phone, email
)
VALUES (
  'a2e00000-3333-4333-8333-333333333333'::uuid,
  'a2e00000-0000-4000-8000-000000000001'::uuid,
  'Client E2E',
  '+33612345678',
  'e2e-client@test.invalid'
)
ON CONFLICT (id) DO UPDATE SET
  business_id = EXCLUDED.business_id,
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email;

-- ---------------------------------------------------------------------------
-- Services
-- ---------------------------------------------------------------------------
INSERT INTO public.services (
  id, business_id, name, duration_min, price, capacity, is_active
)
VALUES
  (
    'a2e00000-4444-4444-8444-444444444444'::uuid,
    'a2e00000-0000-4000-8000-000000000001'::uuid,
    'Coupe homme',
    45,
    3500,
    1,
    true
  ),
  (
    'a2e00000-5555-4555-8555-555555555555'::uuid,
    'a2e00000-0000-4000-8000-000000000001'::uuid,
    'Coupe femmes',
    60,
    4500,
    1,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  business_id = EXCLUDED.business_id,
  name = EXCLUDED.name,
  duration_min = EXCLUDED.duration_min,
  price = EXCLUDED.price,
  capacity = EXCLUDED.capacity,
  is_active = EXCLUDED.is_active;

-- ---------------------------------------------------------------------------
-- Vehicle
-- ---------------------------------------------------------------------------
INSERT INTO public.vehicles (
  id, business_id, client_id, plate_number, brand, model
)
VALUES (
  'a2e00000-2222-4222-8222-222222222222'::uuid,
  'a2e00000-0000-4000-8000-000000000001'::uuid,
  'a2e00000-3333-4333-8333-333333333333'::uuid,
  'E2E-123-AA',
  'Peugeot',
  '308'
)
ON CONFLICT (id) DO UPDATE SET
  business_id = EXCLUDED.business_id,
  client_id = EXCLUDED.client_id,
  plate_number = EXCLUDED.plate_number,
  brand = EXCLUDED.brand,
  model = EXCLUDED.model;

-- ---------------------------------------------------------------------------
-- Business hours
-- open_time / close_time are NOT NULL, even for closed days.
-- ---------------------------------------------------------------------------
INSERT INTO public.business_hours (
  business_id,
  day_of_week,
  is_open,
  open_time,
  close_time,
  break_start,
  break_end
)
VALUES
  ('a2e00000-0000-4000-8000-000000000001'::uuid, 1, true,  '09:00', '18:00', null, null),
  ('a2e00000-0000-4000-8000-000000000001'::uuid, 2, true,  '09:00', '18:00', null, null),
  ('a2e00000-0000-4000-8000-000000000001'::uuid, 3, true,  '09:00', '18:00', null, null),
  ('a2e00000-0000-4000-8000-000000000001'::uuid, 4, true,  '09:00', '18:00', null, null),
  ('a2e00000-0000-4000-8000-000000000001'::uuid, 5, true,  '09:00', '14:00', null, null),
  ('a2e00000-0000-4000-8000-000000000001'::uuid, 6, false, '00:00', '00:00', null, null),
  ('a2e00000-0000-4000-8000-000000000001'::uuid, 0, false, '00:00', '00:00', null, null)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- Appointment
-- source must be one of: manual, online, telegram, viber.
-- ---------------------------------------------------------------------------
INSERT INTO public.appointments (
  id,
  business_id,
  client_id,
  employee_id,
  service_id,
  starts_at,
  ends_at,
  status,
  source
)
VALUES (
  'a2e00000-1111-4111-8111-111111111111'::uuid,
  'a2e00000-0000-4000-8000-000000000001'::uuid,
  'a2e00000-3333-4333-8333-333333333333'::uuid,
  'a2e00000-6666-4666-8666-666666666666'::uuid,
  'a2e00000-4444-4444-8444-444444444444'::uuid,
  '2026-12-20 10:00:00+01',
  '2026-12-20 11:00:00+01',
  'confirmed',
  'manual'
)
ON CONFLICT (id) DO UPDATE SET
  business_id = EXCLUDED.business_id,
  client_id = EXCLUDED.client_id,
  employee_id = EXCLUDED.employee_id,
  service_id = EXCLUDED.service_id,
  starts_at = EXCLUDED.starts_at,
  ends_at = EXCLUDED.ends_at,
  status = EXCLUDED.status,
  source = EXCLUDED.source;

-- ---------------------------------------------------------------------------
-- Job with tracking token (no tracking_expires_at in current schema)
-- ---------------------------------------------------------------------------
INSERT INTO public.jobs (
  id,
  business_id,
  client_id,
  vehicle_id,
  appointment_id,
  status,
  tracking_token,
  notes
)
VALUES (
  'a2e11111-1111-4111-8111-111111111111'::uuid,
  'a2e00000-0000-4000-8000-000000000001'::uuid,
  'a2e00000-3333-4333-8333-333333333333'::uuid,
  'a2e00000-2222-4222-8222-222222222222'::uuid,
  'a2e00000-1111-4111-8111-111111111111'::uuid,
  'reception',
  '550e8400-e29b-41d4-a716-446655440000',
  'Job E2E test'
)
ON CONFLICT (id) DO UPDATE SET
  business_id = EXCLUDED.business_id,
  client_id = EXCLUDED.client_id,
  vehicle_id = EXCLUDED.vehicle_id,
  appointment_id = EXCLUDED.appointment_id,
  status = EXCLUDED.status,
  tracking_token = EXCLUDED.tracking_token,
  notes = EXCLUDED.notes;

-- ---------------------------------------------------------------------------
-- Job inspection
-- ---------------------------------------------------------------------------
INSERT INTO public.job_inspections (
  job_id,
  type,
  zones,
  signature_data,
  client_consent_gallery
)
VALUES (
  'a2e11111-1111-4111-8111-111111111111'::uuid,
  'reception',
  '[{"name":"Face avant","comments":"","photos":[]}]',
  '{"signature":"test-base64"}',
  false
);

-- ---------------------------------------------------------------------------
-- Inspection checklist (adapted to current schema)
-- ---------------------------------------------------------------------------
INSERT INTO public.inspection_checklists (
  appointment_id,
  vehicle_id,
  photos_before,
  photos_after,
  client_signature_url
)
VALUES (
  'a2e00000-1111-4111-8111-111111111111'::uuid,
  'a2e00000-2222-4222-8222-222222222222'::uuid,
  '[]',
  '[]',
  null
);

-- ---------------------------------------------------------------------------
-- Additional test data: Quotes, Invoices, Workstations
-- ---------------------------------------------------------------------------

-- Workstation
INSERT INTO public.workstations (id, business_id, name, description)
VALUES (
  'a2e00000-7777-4777-8777-777777777777'::uuid,
  'a2e00000-0000-4000-8000-000000000001'::uuid,
  'Poste PPF 1',
  'Équipé découpe laser & éclairage LED'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Quote
INSERT INTO public.quotes (
  id,
  business_id,
  client_id,
  vehicle_id,
  status,
  valid_until,
  total_amount,
  notes
)
VALUES (
  'a2e00000-8888-4888-8888-888888888888'::uuid,
  'a2e00000-0000-4000-8000-000000000001'::uuid,
  'a2e00000-3333-4333-8333-333333333333'::uuid,
  'a2e00000-2222-4222-8222-222222222222'::uuid,
  'brouillon',
  now() + interval '30 days',
  42000,
  'Devis test pour E2E'
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  valid_until = EXCLUDED.valid_until,
  total_amount = EXCLUDED.total_amount,
  notes = EXCLUDED.notes;

-- Quote lines (no body_type_id in current schema)
INSERT INTO public.quote_lines (
  id,
  quote_id,
  service_id,
  description,
  quantity,
  unit_price,
  total_price,
  material_estimated_m
)
VALUES
  (
    gen_random_uuid(),
    'a2e00000-8888-4888-8888-888888888888'::uuid,
    'a2e00000-4444-4444-8444-444444444444'::uuid,
    'Coupe homme',
    1,
    3500,
    3500,
    0
  ),
  (
    gen_random_uuid(),
    'a2e00000-8888-4888-8888-888888888888'::uuid,
    'a2e00000-5555-4555-8555-555555555555'::uuid,
    'Coupe femmes',
    1,
    4500,
    4500,
    0
  )
ON CONFLICT DO NOTHING;

-- Invoice
INSERT INTO public.invoices (
  id,
  business_id,
  client_id,
  quote_id,
  number,
  status,
  total_amount,
  issued_at,
  due_date
)
VALUES (
  'a2e00000-9999-4999-8999-999999999999'::uuid,
  'a2e00000-0000-4000-8000-000000000001'::uuid,
  'a2e00000-3333-4333-8333-333333333333'::uuid,
  'a2e00000-8888-4888-8888-888888888888'::uuid,
  'FAC-2026-001',
  'paid',
  84000,
  now(),
  now() + interval '30 days'
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  total_amount = EXCLUDED.total_amount;

-- Invoice lines
INSERT INTO public.invoice_lines (
  id,
  invoice_id,
  description,
  quantity,
  unit_price,
  total_price
)
VALUES
  (
    gen_random_uuid(),
    'a2e00000-9999-4999-8999-999999999999'::uuid,
    'Coupe homme',
    1,
    3500,
    3500
  ),
  (
    gen_random_uuid(),
    'a2e00000-9999-4999-8999-999999999999'::uuid,
    'Coupe femmes',
    1,
    4500,
    4500
  )
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- Service body type prices (for pricing grid test)
-- ---------------------------------------------------------------------------
INSERT INTO public.service_body_type_prices (service_id, body_type_id, price_ht, duration_min)
SELECT
  s.id,
  bt.id,
  CASE
    WHEN s.name = 'Coupe homme' AND bt.code = 'berline' THEN 3500
    WHEN s.name = 'Coupe homme' AND bt.code = 'suv' THEN 4000
    WHEN s.name = 'Coupe femmes' AND bt.code = 'berline' THEN 4500
    WHEN s.name = 'Coupe femmes' AND bt.code = 'suv' THEN 5000
    ELSE s.price
  END,
  s.duration_min
FROM public.services s
CROSS JOIN public.vehicle_body_types bt
WHERE s.business_id = 'a2e00000-0000-4000-8000-000000000001'::uuid
  AND bt.code IN ('berline', 'suv', 'citadine', 'break', 'utilitaire', 'moto')
ON CONFLICT (service_id, body_type_id) DO UPDATE SET
  price_ht = EXCLUDED.price_ht,
  duration_min = EXCLUDED.duration_min;

-- ---------------------------------------------------------------------------
-- Verification
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_business_count integer;
  v_job_count integer;
  v_quote_count integer;
  v_invoice_count integer;
BEGIN
  SELECT count(*)
  INTO v_business_count
  FROM public.businesses
  WHERE id = 'a2e00000-0000-4000-8000-000000000001'::uuid
    AND slug = 'salon-alpha-e2e';

  SELECT count(*)
  INTO v_job_count
  FROM public.jobs
  WHERE id = 'a2e11111-1111-4111-8111-111111111111'::uuid
    AND tracking_token = '550e8400-e29b-41d4-a716-446655440000';

  SELECT count(*)
  INTO v_quote_count
  FROM public.quotes
  WHERE id = 'a2e00000-8888-4888-8888-888888888888'::uuid;

  SELECT count(*)
  INTO v_invoice_count
  FROM public.invoices
  WHERE id = 'a2e00000-9999-4999-8999-999999999999'::uuid;

  IF v_business_count <> 1 OR v_job_count <> 1 OR v_quote_count <> 1 OR v_invoice_count <> 1 THEN
    RAISE EXCEPTION 'E2E seed verification failed: business=%, job=%, quote=%, invoice=%',
      v_business_count, v_job_count, v_quote_count, v_invoice_count;
  END IF;
END $$;

COMMIT;

SELECT 'E2E Test Data seeded successfully' AS status;
SELECT slug, name
FROM public.businesses
WHERE slug = 'salon-alpha-e2e';

SELECT tracking_token, status
FROM public.jobs
WHERE tracking_token = '550e8400-e29b-41d4-a716-446655440000';