/**
 * Crée (ou répare) les utilisateurs de test E2E via l'API d'administration Supabase.
 * LOCAL UNIQUEMENT : refuse de s'exécuter si l'URL n'est pas 127.0.0.1 / localhost.
 *
 * Usage (depuis la racine du projet, Node 20.12+) :
 *   node scripts/create-test-users.mjs
 *
 * .env.local est lu par le script lui-même (node ne le charge pas tout seul) et ses valeurs
 * PRIMENT sur celles déjà définies dans la session PowerShell : plus de variable périmée.
 */
import { existsSync, readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { createClient } from '@supabase/supabase-js'

const ENV_FILE = process.env.ENV_FILE ?? '.env.local'
if (existsSync(ENV_FILE)) {
  // readFileSync(..., 'utf8') + parseEnv : gère le BOM éventuel et ignore commentaires et guillemets
  Object.assign(process.env, parseEnv(readFileSync(ENV_FILE, 'utf8').replace(/^\uFEFF/, '')))
  console.log(`Variables lues depuis ${ENV_FILE}`)
} else {
  console.warn(`${ENV_FILE} introuvable (dossier courant : ${process.cwd()}) : variables de la session utilisées.`)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis (vérifie .env.local et le dossier courant).')
  process.exit(1)
}

// Garde-fou : ces comptes ont un mot de passe connu, ils ne doivent jamais exister sur un projet distant.
if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?(\/|$)/.test(url)) {
  console.error(`Abandon : l'URL Supabase n'est pas locale (hôte : ${new URL(url).host}).`)
  process.exit(1)
}

const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })

// Mêmes identifiants que dans les fichiers de données E2E (e2e-test-data.sql).
const USERS = [
  { id: '38d54b31-2904-497f-bbac-17656e6ab6a3', email: 'e2e-owner@test.invalid',    first: 'E2E', last: 'Owner' },
  { id: '61636a96-5716-4d72-8000-fa5eddd8ae31', email: 'e2e-employee@test.invalid', first: 'E2E', last: 'Employee' },
]
const PASSWORD = process.env.E2E_PASSWORD ?? 'password123'

function explain(err) {
  // supabase-js masque la cause réseau : on affiche au moins le type d'erreur et le statut.
  return [err?.name, err?.status !== undefined ? `statut ${err.status}` : null, err?.message].filter(Boolean).join(' · ')
}

// Contrôle préalable avec un fetch natif : lui conserve la vraie cause (connexion refusée, DNS...).
async function assertReachable() {
  try {
    const res = await fetch(`${url}/auth/v1/health`, { headers: { apikey: serviceRoleKey } })
    console.log(`Supabase joignable sur ${url} (HTTP ${res.status})`)
  } catch (err) {
    const cause = err?.cause?.code ?? err?.cause?.message ?? err.message
    console.error(`Impossible de joindre ${url} : ${cause}`)
    console.error('→ ECONNREFUSED : la pile locale est arrêtée (supabase status / supabase start).')
    console.error('→ ENOTFOUND : l\'adresse est fausse (NEXT_PUBLIC_SUPABASE_URL).')
    process.exit(1)
  }
}

async function ensureUser({ id, email, first, last }) {
  const attrs = {
    email,
    password: PASSWORD,
    email_confirm: true, // et non « email_confirmed » : ce paramètre-là est ignoré
    user_metadata: { first_name: first, last_name: last, full_name: `${first} ${last}` },
  }

  const { data, error } = await admin.auth.admin.createUser({ id, ...attrs })
  if (!error) {
    if (data.user.id !== id) throw new Error(`${email} créé avec l'id ${data.user.id} au lieu de ${id}`)
    return 'créé'
  }

  // Déjà présent : on le met en conformité (mot de passe, confirmation) au lieu d'échouer.
  if (/already|exists|registered/i.test(error.message)) {
    const { error: upErr } = await admin.auth.admin.updateUserById(id, { password: PASSWORD, email_confirm: true })
    if (upErr) throw upErr
    return 'déjà présent, mis à jour'
  }
  throw error
}

await assertReachable()

let failed = 0
for (const user of USERS) {
  try {
    console.log(`${user.email} : ${await ensureUser(user)}`)
  } catch (err) {
    failed++
    console.error(`${user.email} : ÉCHEC — ${explain(err)}`)
  }
}

if (failed) {
  console.error(`\n${failed} utilisateur(s) non créé(s). Vérifie : supabase status, puis l'URL ${url}`)
  process.exit(1)
}
console.log('\nUtilisateurs de test prêts.')