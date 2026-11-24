/**
 * Script to seed E2E test data via Supabase
 * Run after create-test-users.mjs
 *
 * Usage: node scripts/setup-e2e-data.mjs
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

// Fixed E2E IDs
const IDs = {
  business: 'a2e00000-0000-4000-8000-000000000001',
  appointment: 'a2e00000-1111-4111-8111-111111111111',
  vehicle: 'a2e00000-2222-4222-8222-222222222222',
  client: 'a2e00000-3333-4333-8333-333333333333',
  service1: 'a2e00000-4444-4444-8444-444444444444',
  service2: 'a2e00000-5555-4555-8555-555555555555',
  employeeOwner: 'a2e00000-6666-4666-8666-666666666666',
  employeeE2E: 'e4c45cd5-ffe4-4c2f-aa27-91e9ef6788ac',
  job: 'a2e11111-1111-4111-8111-111111111111',
  workstation: 'a2e00000-7777-4777-8777-777777777777',
  quote: 'a2e00000-8888-4888-8888-888888888888',
  invoice: 'a2e00000-9999-4999-8999-999999999999'
}

const OWNER_ID = process.env.E2E_OWNER_ID || 'e4c45cd5-ffe4-4c2f-aa27-91e9ef6788ab'
const EMPLOYEE_ID = process.env.E2E_EMPLOYEE_ID || '7ae3a5d2-5340-48a0-be08-6ca61303f4ca'

async function main() {
  console.log('Seeding E2E test data...')

  // Business
  await supabase.from('businesses').upsert({
    id: IDs.business,
    owner_id: OWNER_ID,
    name: 'Salon Alpha E2E',
    slug: 'salon-alpha-e2e',
    timezone: 'Europe/Paris',
    currency: 'EUR',
    plan: 'pro',
    subscription_status: 'active'
  }, { onConflict: 'id' })
  console.log('✓ Business created')

  // Business members
  await supabase.from('business_members').upsert([
    { business_id: IDs.business, user_id: OWNER_ID, role: 'admin' },
    { business_id: IDs.business, user_id: EMPLOYEE_ID, role: 'employee' }
  ], { onConflict: 'business_id,user_id' })
  console.log('✓ Business members created')

  // Employee (owner as employee in their business - Alice)
  await supabase.from('employees').upsert({
    id: IDs.employeeOwner,
    business_id: IDs.business,
    user_id: OWNER_ID,
    name: 'Alice E2E',
    role: 'employee',
    is_active: true
  }, { onConflict: 'id' })
  console.log('✓ Employee (owner) created')

  // Employee (E2E employee)
  await supabase.from('employees').upsert({
    id: IDs.employeeE2E,
    business_id: IDs.business,
    user_id: EMPLOYEE_ID,
    name: 'E2E Employee',
    role: 'employee',
    is_active: true
  }, { onConflict: 'id' })
  console.log('✓ Employee (E2E) created')

  // Client
  await supabase.from('clients').upsert({
    id: IDs.client,
    business_id: IDs.business,
    name: 'Client E2E',
    phone: '+33612345678',
    email: 'e2e-client@test.invalid'
  }, { onConflict: 'id' })
  console.log('✓ Client created')

  // Services
  await supabase.from('services').upsert([
    {
      id: IDs.service1,
      business_id: IDs.business,
      name: 'Coupe homme',
      duration_min: 45,
      price: 3500,
      capacity: 1,
      is_active: true
    },
    {
      id: IDs.service2,
      business_id: IDs.business,
      name: 'Coupe femmes',
      duration_min: 60,
      price: 4500,
      capacity: 1,
      is_active: true
    }
  ], { onConflict: 'id' })
  console.log('✓ Services created')

  // Vehicle
  await supabase.from('vehicles').upsert({
    id: IDs.vehicle,
    business_id: IDs.business,
    client_id: IDs.client,
    plate_number: 'E2E-123-AA',
    brand: 'Peugeot',
    model: '308'
  }, { onConflict: 'id' })
  console.log('✓ Vehicle created')

  // Business hours
  await supabase.from('business_hours').upsert([
    { business_id: IDs.business, day_of_week: 1, is_open: true, open_time: '09:00', close_time: '18:00', break_start: null, break_end: null },
    { business_id: IDs.business, day_of_week: 2, is_open: true, open_time: '09:00', close_time: '18:00', break_start: null, break_end: null },
    { business_id: IDs.business, day_of_week: 3, is_open: true, open_time: '09:00', close_time: '18:00', break_start: null, break_end: null },
    { business_id: IDs.business, day_of_week: 4, is_open: true, open_time: '09:00', close_time: '18:00', break_start: null, break_end: null },
    { business_id: IDs.business, day_of_week: 5, is_open: true, open_time: '09:00', close_time: '14:00', break_start: null, break_end: null },
    { business_id: IDs.business, day_of_week: 6, is_open: false, open_time: '00:00', close_time: '00:00', break_start: null, break_end: null },
    { business_id: IDs.business, day_of_week: 0, is_open: false, open_time: '00:00', close_time: '00:00', break_start: null, break_end: null }
  ], { onConflict: 'business_id,day_of_week' })
  console.log('✓ Business hours created')

  // Appointment
  await supabase.from('appointments').upsert({
    id: IDs.appointment,
    business_id: IDs.business,
    client_id: IDs.client,
    employee_id: IDs.employeeOwner,
    service_id: IDs.service1,
    starts_at: '2026-12-20T10:00:00+01:00',
    ends_at: '2026-12-20T11:00:00+01:00',
    status: 'confirmed',
    source: 'manual'
  }, { onConflict: 'id' })
  console.log('✓ Appointment created')

  // Workstation
  await supabase.from('workstations').upsert({
    id: IDs.workstation,
    business_id: IDs.business,
    name: 'Poste PPF 1',
    description: 'Équipé découpe laser & éclairage LED'
  }, { onConflict: 'id' })
  console.log('✓ Workstation created')

  // Quote
  await supabase.from('quotes').upsert({
    id: IDs.quote,
    business_id: IDs.business,
    client_id: IDs.client,
    vehicle_id: IDs.vehicle,
    status: 'brouillon',
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    total_amount: 42000,
    notes: 'Devis test pour E2E'
  }, { onConflict: 'id' })
  console.log('✓ Quote created')

  // Quote lines
  await supabase.from('quote_lines').upsert([
    {
      quote_id: IDs.quote,
      service_id: IDs.service1,
      description: 'Coupe homme',
      quantity: 1,
      unit_price: 3500,
      total_price: 3500
    },
    {
      quote_id: IDs.quote,
      service_id: IDs.service2,
      description: 'Coupe femmes',
      quantity: 1,
      unit_price: 4500,
      total_price: 4500
    }
  ], { onConflict: 'quote_id,service_id' })
  console.log('✓ Quote lines created')

  // Invoice
  await supabase.from('invoices').upsert({
    id: IDs.invoice,
    business_id: IDs.business,
    client_id: IDs.client,
    quote_id: IDs.quote,
    number: 'FAC-2026-001',
    status: 'paid',
    total_amount: 84000,
    issued_at: new Date().toISOString(),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }, { onConflict: 'id' })
  console.log('✓ Invoice created')

  // Invoice lines
  await supabase.from('invoice_lines').upsert([
    {
      invoice_id: IDs.invoice,
      description: 'Coupe homme',
      quantity: 1,
      unit_price: 3500,
      total_price: 3500
    },
    {
      invoice_id: IDs.invoice,
      description: 'Coupe femmes',
      quantity: 1,
      unit_price: 4500,
      total_price: 4500
    }
  ], { onConflict: 'invoice_id,description' })
  console.log('✓ Invoice lines created')

  console.log('\n✅ E2E test data seeded successfully!')
}

main().catch(console.error)