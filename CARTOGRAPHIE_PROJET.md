# 🗺️ Cartographie — BookingPro (fork de `SGrappelli/pronto`)

> **Rôle de ce document** : référence partagée unique pour les 7 sous-agents.
> **À faire** : reprendre le **BLOC DE RAPPEL** ci-dessous en tête de chaque session au lieu de refaire l'onboarding.
> Dernière mise à jour : 2026-09-12 — branche `cartography-of-project`.

---

## 📌 BLOC DE RAPPEL (à recopier/résumer en tête de chaque session)

```
PROJET : BookingPro — POS/CRM/Booking/Inventory pour SMB de services & retail.
FORK   : upstream OSS = SGrappelli/pronto (rebranding "Pronto" → "BookingPro").
ORIGINE: lahcendws/bookingPro (une seule remote 'origin' ; AUCUN upstream configuré).
STACK  : Next.js 16.3.2 (App Router, Turbopack dev / webpack build) + React 19.2 + TypeScript 5
         + Tailwind 3.4 + shadcn/ui (Radix) + Supabase (PostgreSQL, Auth, Storage, RLS)
         + next-intl (EN/ES/IT/PT) + @serwist/next (PWA offline POS) + date-fns + zod + xlsx.
RUN    : dev = "next dev --turbopack" | build = "next build --webpack" | dépendances = YARN (yarn.lock).
DB     : 8 tables cœur + 35 migrations SQL auto-appliquées (scripts/migrate.js + docker-compose migrate).
MODE   : docker-compose force NEXT_PUBLIC_DEPLOYMENT_MODE=selfhosted (garde-fou anti-SaaS, volontaire).
BRANCH: main (prod) + dev ; CI GitHub Actions = lint (Node 22) → build (Node 22).
⚠️ RISQUES MAJEURS À CONNAÎTRE AVANT TOUCHER QUOI QUE CE SOIT :
  R1 P0 Dockerfile casse : utilise `npm ci`/`npm run build` MAIS package-lock.json SUPPRIMÉ
     (commit 5c4143b) et le projet est sous YARN → le build Docker est BROUILLÉ.
  R2 P1 Rebranding incomplet : 117 références "pronto"/trypronto left (légal + landing es/ + export filenames
     "pronto-*.xlsx" + msgs bot Viber "on Pronto" + scripts/package.json "pronto-migrate" + URL clone README).
  R3 P1 Dérive vs upstream : pas de remote `upstream` (SGrappelli/pronto) → synchro manuelle OK mais plus de merges auto,
     CI badge README pointe vers SGrappelli/pronto, README parle de SaaS trypronto.app & features cloud-only.
  R4 P2 Drift stack : Dockerfile = node:20-alpine MAIS CI/readme = node 22 (supabase-js) → mismatch runtime.
  R5 P2 Migrations : trou 021, 022 (saute 020 → 023). Volontaire (retrait SaaS/financier ?) à documenter.
```

---

## 1. Synthèse express

Application web **self-hosted** de gestion pour commerces de services (salons, barbiers, cliniques,
auto, cafés, boutiques). Clone d'un SaaS "Pronto" rebrandé localement en **BookingPro**. Bilingue par
défaut + ES/IT/PT. Fonctionnalités : réservation avec calendrier drag-&-drop, CRM clients, caisse POS
**utilisable hors-ligne** (PWA + queue de sync), inventaire retail avec barcode, notifications
multi-canal (Email/Telegram/WhatsApp/Viber/…). Auth 100% Supabase. Déploiement Docker Compose 1 commande.

**Lisible à ~111 fichiers TS/TSX + ~1315 lignes SQL + i18n (~1058 strings EN).** Base de code de taille moyenne, modulaire.

---

## 2. État des lieux technique

### 2.1 Stack & outillage

| Couche | Choix | Notes / pièges |
|---|---|---|
| Framework | **Next.js 16.3.2** (App Router) | `next dev --turbopack`, `next build --webpack`. Migration 14→15→16 déjà faite. |
| UI | Tailwind 3.4 + shadcn/ui (Radix) | composants dans `components/ui/*`. |
| Langage | TypeScript 5, `strict: true`, paths `@/*` | tsconfig standard Next. |
| DB / Auth / Storage | **Supabase** (PostgreSQL + RLS + Auth + Storage) | bucket `inventory` requis pour photos produits. |
| i18n | next-intl (plugin). Locales **EN/ES/IT/PT** | `i18n/request.ts` ; fichiers `messages/*.json`. |
| PWA | **@serwist/next** (ex next-pwa, lib morte) | SW = `app/sw.ts` → `public/sw.js`. Offline: `/offline`. `reloadOnOnline:false`. |
| Emails | nodemailer + resend (per-business configurable) | `lib/email.ts`, `lib/mailer.ts`, migration 015. |
| Bot | Telegram / Viber / WhatsApp (Meta Cloud API) | `lib/{telegram,viber,whatsapp}.ts` + webhooks `/api/{telegram,viber}/...`. |
| Exports/Imports | `xlsx` (CSV/Excel), import Fresha/Vagaro/Booksy/Mindbody/Square | `lib/`, `app/api/clients/import`, `app/api/inventory/import|export`. |
| Paket manager | **Yarn** (`yarn.lock`) | ⚠️ Dockerfile utilise npm (voir R1). |
| Lint | ESLint 9 flat config | 4 règles react-hooks passées en `warn` (pas en erreur) pour rester green. |
| Deploiement | Docker Compose (multi-stage) + `output: standalone` | `migrate` (one-shot) → `app`. Option `secret` Nginx/SSL dans compose. |

### 2.2 Arborescence applicative (`app/`)

- `(auth)/` — login, register, forgot/reset password (Server Actions Supabase).
- `(dashboard)/` — **pos** (caisse, `pos-terminal.tsx` offline+syncQueue), **crm/[id]**, **booking** (calendrier drag&drop), **inventory/[id]** (fichier/stock), **settings** (modules/notifications), **dashboard** (analytics), layout+sidebar/header.
- `book/[slug]/` — **page de réservation publique** (slug = business, pas de compte client).
- `api/` (~27 routes) — authentification, bookings, inventory, notifications, cron, webhooks, santé, business/modules, check-slug, user/locale, email/confirm & low-stock.
- Pages legacy : `/privacy`, `/terms`, `/refund` (⚠️ contiennent encore "Pronto"/trypronto), `/offline`, marketings `/es`, `/es/para` (⚠️ trypronto.app partout).
- `proxy.ts` + `middleware` — auth / refresh session, et réécriture SaaS `{slug}.trypronto.app/book → /book/{slug}` (⚠️ domaine SaaS codé en dur).

### 2.3 Backend applicatif (`lib/`)

Helpers : `supabase/{client,server,service}`, `auth-user` (session), `create-business`, `booking-availability`,
`modules.ts` (gating features sidebar), `plan-limits.ts` (**tout illimité en self-hosted**), `email|telegram|viber|whatsapp`,
`gcal`, `offline-db` (IndexedDB POS), `rate-limit`, `utils`.

### 2.4 Base de données (Supabase)

- 8 tables cœur (migration 001) : `businesses, employees, services, clients, appointments, transactions, inventory_items, inventory_movements`.
- **35 migrations** `supabase/migrations/001..035`, auto-appliquées par `scripts/migrate.js` (table `schema_migrations`, idempotentes, `SET search_path`). **Trou 021/022** volontaire (R5).
- Sécurité renforcée côté SQL : 005 (search_path), 016 (révocation lecture anon des tokens), 030 (fix SECURITY DEFINER / fuite cross-tenant), 017+019+031+032 (anti-double-réservation), RLS partout. Porte aussi un fix XSS réel.
- `007_cron_jobs.sql` = pg_cron optionnel (envsubst de `NEXT_PUBLIC_APP_URL`+`CRON_SECRET`).

### 2.5 CI / Déploiement

- **CI GitHub Actions** (`.github/workflows/ci.yml`) : lint → build (Node 22, env placeholder, `DEPLOYMENT_MODE=selfhosted`).
- Docker : multi-stage `node:20-alpine` ; compose force `NEXT_PUBLIC_DEPLOYMENT_MODE=selfhosted`.

### 2.6 Config / Secrets

- `.env.example` = 17 clés (sync avec `.env.local`). `.env.local` présent sur disque mais **gitignoré** ✅.
- `next.config.js` : `output: standalone`, allowOrigins ServerActions (`*.trypronto.app` + `NEXT_PUBLIC_APP_URL`), images `*.supabase.co` + `.r2.cloudflarestorage.com`, redirect www→non-www via `APP_DOMAIN`.

---

## 3. 🔥 Zone à risques (spécifiques au fait que c'est un fork)

### 🔴 R1 — Build Docker cassé (P0)
Le Dockerfile exécute `npm ci` + `npm run build`, mais `package-lock.json` a été **supprimé** (commit `5c4143b`)
et le dépôt tourne sous **Yarn** (`yarn.lock`). `npm ci` échoue sans lock → **`docker-compose build`/`up` est rompu en l'état**.
→ Décision nécessaire : (a) régénérer un `package-lock.json` synchro de `yarn.lock`, ou (b) basculer le Dockerfile sur `yarn`.

### 🔴 R2 — Rebranding "Pronto" ↔ "BookingPro" incomplet (P1)
117 occurrences "pronto"/trypronto restantes dans le source (hors node_modules/.next) :
- Pages légales `app/(public)/privacy|terms|refund` : texte "Pronto", emails `privacy@/support@trypronto.app`, url trypronto.app.
- Markting `app/es/page.tsx` & `app/es/para/page.tsx` : canonical/JSON-LD/sameAs → `trypronto.app` et `github.com/SGrappelli/pronto`.
- `app/layout.tsx` : openGraph/twitter images → `https://trypronto.app/og-image.png`.
- Exports XLSX : nom de fichier `pronto-products-*.xlsx`, `pronto-sales-*.xlsx`.
- `lib/viber.ts`/webhooks : messages "connected to … on Pronto".
- `scripts/package.json` : nom `pronto-migrate` ; commentaires de code "Pronto".
- **README** : URL de clone `github.com/SGrappelli/BookingPro.git` (n'existe pas → le vrai est `lahcendws/bookingPro`), badges CI `SGrappelli/pronto`, mentions trypronto.app & features "cloud-only".
→ d'autant plus risqué si la marque doit devenir 100% autonome ; sinon documenter le choix de garder des liens upstream.

### 🔴 R3 — Dérive vis-à-vis d'upstream, pas de synchro auto (P1)
- Une seule remote `origin` (`lahcendws/bookingPro`). **Pas de remote `upstream`** vers `SGrappelli/pronto` →
  pas de rebase/merge simple, backport sécurités en copier-coller manuel (comme le fix XSS déjà porté).
- Le fork contient du **code SaaS conditionné** (`NEXT_PUBLIC_DEPLOYMENT_MODE`, `proxy.ts {slug}.trypronto.app`,
  `booking-calendar` construit une URL SaaS) hérité du repo privé "Pronto-saas". Le self-hosted le neutralise via compose, mais le code dormant reste.
- La branche legacy `Remplacer-Pronto-→-BookingPro` a été mergée (PR #1) ; les autres branches (`dev`, `test/verify-protection`, `update-ci`) existent encore.

### 🟠 R4 — Mismatch versions Node (P2)
Dockerfile = `node:20-alpine`, mais CI & README visent **Node 22** (nécessaire à supabase-js récent).
→ Écart potentiel de comportement/OOM en runtime Docker vs CI.

### 🟠 R5 — Gap de numérotation des migrations (P2)
Séquence `020_appointment_paid_status → 023_performance_indexes` (021, 022 absents). Probablement des migrations
SaaS/financières retirées. `scripts/migrate.js` trie par nom de fichier → ce n'est pas bloquant, mais à **documenter** pour éviter qu'un agent recrée un `021_*` entrant en collision conceptuelle.

### 🟡 R6 — Points de vigilance transverses
- **Sécurité** à ne pas régresser : RLS + search_path + révocation anon (016) + rate-limit (`lib/rate-limit.ts`) + `INTERNAL_API_SECRET`/`CRON_SECRET` pour l'API cron. Ne pas remettre de routes anon exposant `smtp_pass`, tokens bot.
- `eslint` : 4 règles react-hooks en `warn` par choix assumé (problèmes pré-existants) — ne pas les passer en `error` sans corriger les effets.
- SEO/SEO-consistency : `sitemap.ts`, metadata, redirects `APP_DOMAIN`. Le multi-domaine `trypronto.app` codé en dur contredit un fork autonome.
- secrets locaux `.env.local`, `certs/supabase-ca.crt`, `supabase/.temp/linked-project.json` (ref projet) présents sur disque — **ne jamais committer**.

---

## 4. Contexte pour les 7 sous-agents — domaines

Répartition proposée des travaux & points d'entrée :

| # | Domaine | Points d'entrée principaux | ⚠️ touche |
|---|---|---|---|
| A1 | **Booking / Réservation** | `app/(dashboard)/booking/*`, `app/book/[slug]/*`, `lib/booking-availability.ts`, `lib/gcal.ts`, API `appointments`, `book` | RLS anti-double-book |
| A2 | **CRM / Clients** | `app/(dashboard)/crm/*`, `components/clients/*`, API `clients/import`, triggers stats (008) | R2 légal (data clients) |
| A3 | **POS / Offline / PWA** | `app/(dashboard)/pos/*`, `pos-terminal.tsx`, `lib/offline-db.ts`, `app/sw.ts`, `next.config.js` (Serwist) | régression PWA |
| A4 | **Inventaire / Retail** | `app/(dashboard)/inventory/*`, `components/inventory/*`, APIs inventory, `xlsx`, `useBarcodeScanner` | R2 (filenames) |
| A5 | **Notifications Messagers** | `lib/{email,mailer,telegram,viber,whatsapp}.ts`, webhooks `api/{telegram,viber}`, `api/email/*`, `api/cron/notify` | crédentials per-business, R2 (txt bot) |
| A6 | **Auth / Settings / Modules / Onboarding** | `app/(auth)/*`, `app/(dashboard)/settings/*`, `app/onboarding/*`, `lib/{modules,create-business,auth-user}.ts`, `app/api/business/modules` | R4, RLS |
| A7 | **Build / CI / Docker / Docs** | `Dockerfile`, `docker-compose.yml`, `.github/workflows/ci.yml`, `package.json`, `scripts/migrate.js`, README/CONTRIBUTING | 🎯 **R1 (Docker npm)**, R2 (README), R4 (node:20) |

**Règles d'or pour tous les agents** :
1. Lire le fichier avant de le modifier (jamais de changement à l'aveugle).
2. Ne pas régresser la sécurité SQL (RLS/search_path/anon) ni la PWA offline.
3. `yarn` pour installer/lint, jamais `npm` (cohérence avec CI).
4. Ne pas committer de secrets / `.env.local` / `certs/` / `supabase/.temp/`.
5. Documenter tout changement dans ce fichier (section "Bilan des travaux") si pertinent.

---

## 5. Bilan des travaux (changelog de session — à compléter)

| Date | Agent | Fait | Statut |
|---|---|---|---|
| 2026-09-12 | cartographie | Création du document de référence | ✅ |