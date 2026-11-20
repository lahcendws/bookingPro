/**
 * Script to create E2E test users via Supabase Admin API
 * This should be run before running E2E tests
 *
 * Usage: node scripts/create-test-users.js
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function createUser(email, password, fullName, id) {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      id,
      email,
      password,
      email_confirmed: true,
      user_metadata: { full_name: fullName }
    })

    if (error) {
      console.error(`Error creating user ${email}:`, error.message)
      return null
    }

    console.log(`Created user: ${email}`)
    return data
  } catch (err) {
    console.error(`Exception creating user ${email}:`, err.message)
    return null
  }
}

async function main() {
  console.log('Creating E2E test users...')

  const owner = await createUser(
    'e2e-owner@test.invalid',
    'password123',
    'E2E Owner',
    '22eb5777-dbc9-478d-9dfa-66675be49343'
  )

  const employee = await createUser(
    'e2e-employee@test.invalid',
    'password123',
    'E2E Employee',
    '9e979818-47c2-4404-8dd7-1f09a275f246'
  )

  console.log('\nTest users created successfully!')
  console.log('Owner:', owner?.email)
  console.log('Employee:', employee?.email)
}

main().catch(console.error)