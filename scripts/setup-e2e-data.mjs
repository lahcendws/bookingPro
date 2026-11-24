/**
 * Complete E2E setup script:
 * 1. Creates or updates E2E test users via Supabase Admin API
 * 2. Runs the SQL seed file to populate public data
 *
 * Usage:
 *   node scripts/setup-e2e-data.mjs
 *
 * Requires:
 *   - Supabase local stack running
 *   - NEXT_PUBLIC_SUPABASE_URL in .env.local
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   - Docker container supabase_db_bookingPro running
 */

import { createClient } from '@supabase/supabase-js'
import { execSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseEnv } from 'node:util'

const ENV_FILE = process.env.ENV_FILE ?? '.env.local'

if (existsSync(ENV_FILE)) {
  Object.assign(
    process.env,
    parseEnv(readFileSync(ENV_FILE, 'utf8').replace(/^\uFEFF/, ''))
  )
  console.log(`Variables lues depuis ${ENV_FILE}`)
} else {
  console.warn(
    `${ENV_FILE} introuvable (dossier courant : ${process.cwd()}) : variables de la session utilisÃ©es.`
  )
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    'NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis (vÃ©rifie .env.local et le dossier courant).'
  )
  process.exit(1)
}

// Garde-fou : ces comptes de test ne doivent jamais Ãªtre prÃ©parÃ©s sur un projet distant.
let parsedUrl
try {
  parsedUrl = new URL(supabaseUrl)
} catch {
  console.error(`Abandon : URL Supabase invalide : ${supabaseUrl}`)
  process.exit(1)
}

if (!['127.0.0.1', 'localhost'].includes(parsedUrl.hostname)) {
  console.error(
    `Abandon : l'URL Supabase n'est pas locale (hÃ´te : ${parsedUrl.host}).`
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

// UUID historiques utilisÃ©s dans le fichier SQL seed.
// Si les comptes existent dÃ©jÃ  avec d'autres UUID, le script adapte le SQL
// avec les UUID rÃ©ellement retournÃ©s par Supabase Auth.
const OWNER_UUID = 'e4c45cd5-ffe4-4c2f-aa27-91e9ef6788ab'
const EMPLOYEE_UUID = '7ae3a5d2-5340-48a0-be08-6ca61303f4ca'

// -----------------------------------------------------------------------------
// CrÃ©er OU mettre Ã  jour un utilisateur E2E (nom de fonction conservÃ©)
// -----------------------------------------------------------------------------

async function createUserIfNotExists(email, password, fullName, id) {
  try {
    const { data: existingUsers, error: listError } =
      await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })

    if (listError) {
      console.error('âŒ Error checking existing users:', listError.message)
      return { created: false, error: listError.message }
    }

    const normalizedEmail = email.trim().toLowerCase()
    const userById = existingUsers.users.find(user => user.id === id)
    const userByEmail = existingUsers.users.find(
      user => user.email?.trim().toLowerCase() === normalizedEmail
    )

    // Deux comptes diffÃ©rents ne doivent pas Ãªtre confondus.
    if (userById && userByEmail && userById.id !== userByEmail.id) {
      const message =
        `Conflit : l'UUID ${id} et l'email ${email} appartiennent Ã  deux comptes diffÃ©rents.`
      console.error(`âŒ ${message}`)
      return { created: false, error: message }
    }

    const existingUser = userById ?? userByEmail

    if (existingUser) {
      if (existingUser.id !== id) {
        console.warn(
          `âš ï¸ ${email} existe dÃ©jÃ  avec l'UUID ${existingUser.id} (UUID seed historique : ${id}).`
        )
      } else {
        console.log(`â„¹ï¸ User already exists: ${email} (${existingUser.id})`)
      }

      // RÃ©initialise le compte dans un Ã©tat prÃ©visible pour les tests E2E.
      const { data, error } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          email,
          password,
          email_confirm: true,
          user_metadata: {
            ...existingUser.user_metadata,
            full_name: fullName
          }
        }
      )

      if (error) {
        console.error(`âŒ Error updating user ${email}:`, error.message)
        return { created: false, error: error.message }
      }

      console.log(`âœ… User ready: ${email} (${data.user.id})`)
      return { created: false, user: data.user }
    }

    // Aucun compte correspondant : crÃ©ation avec l'UUID historique attendu.
    const { data, error } = await supabase.auth.admin.createUser({
      id,
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    })

    if (error) {
      // Une crÃ©ation concurrente peut avoir crÃ©Ã© le mÃªme email entre-temps.
      if (
        error.message.toLowerCase().includes('already registered') ||
        error.message.toLowerCase().includes('already exists')
      ) {
        const { data: refreshedUsers, error: refreshError } =
          await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })

        if (refreshError) {
          console.error('âŒ Could not reload users:', refreshError.message)
          return { created: false, error: refreshError.message }
        }

        const duplicate = refreshedUsers.users.find(
          user =>
            user.id === id ||
            user.email?.trim().toLowerCase() === normalizedEmail
        )

        if (duplicate) {
          const { data: updated, error: updateError } =
            await supabase.auth.admin.updateUserById(duplicate.id, {
              email,
              password,
              email_confirm: true,
              user_metadata: {
                ...duplicate.user_metadata,
                full_name: fullName
              }
            })

          if (updateError) {
            console.error(
              `âŒ Error updating existing user ${email}:`,
              updateError.message
            )
            return { created: false, error: updateError.message }
          }

          console.log(`âœ… Existing user recovered: ${email} (${updated.user.id})`)
          return { created: false, user: updated.user }
        }
      }

      console.error(`âŒ Error creating user ${email}:`, error.message)
      return { created: false, error: error.message }
    }

    console.log(`âœ… Created user: ${email} (${data.user.id})`)
    return { created: true, user: data.user }
  } catch (err) {
    console.error(`âŒ Exception creating user ${email}:`, err.message)
    return { created: false, error: err.message }
  }
}

// -----------------------------------------------------------------------------
// ExÃ©cuter le seed SQL avec les UUID rÃ©els des comptes Auth
// -----------------------------------------------------------------------------

async function runSeedSQL(ownerId, employeeId) {
  console.log('\nðŸ“¦ Running SQL seed file...')

  const seedFile = resolve('supabase/seed/e2e-test-data.sql')

  if (!existsSync(seedFile)) {
    console.error(`âŒ Seed file not found: ${seedFile}`)
    return false
  }

  try {
    let sql = readFileSync(seedFile, 'utf8')

    // Le SQL seed utilise les UUID historiques. On les remplace par les UUID
    // rÃ©ellement associÃ©s aux emails E2E dans auth.users.
    if (!sql.includes(OWNER_UUID)) {
      console.warn(`âš ï¸ UUID owner historique ${OWNER_UUID} absent du fichier seed.`)
    }
    if (!sql.includes(EMPLOYEE_UUID)) {
      console.warn(`âš ï¸ UUID employee historique ${EMPLOYEE_UUID} absent du fichier seed.`)
    }

    sql = sql
      .replaceAll(OWNER_UUID, ownerId)
      .replaceAll(EMPLOYEE_UUID, employeeId)

    console.log(`ðŸ“„ Seed file: ${seedFile}`)
    console.log(`ðŸ‘¤ Owner UUID utilisÃ© dans le seed: ${ownerId}`)
    console.log(`ðŸ‘¤ Employee UUID utilisÃ© dans le seed: ${employeeId}`)
    console.log('ðŸ”„ ExÃ©cution du SQL dans la base Supabase locale...')

    execSync(
      'docker exec -i supabase_db_bookingPro psql -v ON_ERROR_STOP=1 -U postgres -d postgres',
      {
        input: sql,
        stdio: ['pipe', 'inherit', 'inherit'],
        timeout: 60000
      }
    )

    console.log('âœ… SQL seed executed successfully')
    return true
  } catch (error) {
    console.error('âŒ Error running SQL seed:', error.message)
    return false
  }
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

async function main() {
  console.log('ðŸš€ Setting up E2E test data...\n')
  console.log('ðŸ“ Supabase URL:', supabaseUrl)
  console.log('ðŸ”‘ Using service role key:', serviceRoleKey ? '*** (set)' : 'NOT SET')
  console.log('')

  console.log('ðŸ‘¤ Step 1: Creating/checking E2E users...')

  const ownerResult = await createUserIfNotExists(
    'e2e-owner@test.invalid',
    'password123',
    'E2E Owner',
    OWNER_UUID
  )

  const employeeResult = await createUserIfNotExists(
    'e2e-employee@test.invalid',
    'password123',
    'E2E Employee',
    EMPLOYEE_UUID
  )

  if (ownerResult.error || employeeResult.error) {
    console.error('\nâŒ Failed to prepare E2E users')
    process.exitCode = 1
    return
  }

  if (!ownerResult.user?.id || !employeeResult.user?.id) {
    console.error('\nâŒ Impossible de rÃ©cupÃ©rer les UUID des utilisateurs E2E.')
    process.exitCode = 1
    return
  }

  console.log('\nâœ… E2E users ready')

  console.log('\nðŸ—„ï¸  Step 2: Running seed SQL...')
  const seedSuccess = await runSeedSQL(
    ownerResult.user.id,
    employeeResult.user.id
  )

  if (!seedSuccess) {
    console.error('\nâŒ Failed to run seed SQL')
    console.log('\nðŸ’¡ VÃ©rifie que le conteneur supabase_db_bookingPro est dÃ©marrÃ©.')
    console.log('   Tu peux aussi exÃ©cuter manuellement le fichier :')
    console.log('   supabase/seed/e2e-test-data.sql')
    process.exitCode = 1
    return
  }

  console.log('\nâœ¨ E2E setup complete!')
  console.log('   Owner:    e2e-owner@test.invalid / password123')
  console.log('   Employee: e2e-employee@test.invalid / password123')
  console.log('   Business: Salon Alpha E2E (slug: salon-alpha-e2e)')
  console.log('   Tracking token: 550e8400-e29b-41d4-a716-446655440000')
}

main().catch(error => {
  console.error('\nâŒ Unexpected error:', error)
  process.exitCode = 1
})