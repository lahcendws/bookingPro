# Phase 3: Workstations, Multi-Day Planning, Public Booking & Audit Trail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement workstation management, multi-day appointment scheduling, workstation conflict prevention, public booking with 30% Stripe deposit, and comprehensive activity audit logging.

**Architecture:** Database migration adding `workstations`, `activity_logs`, and updating `appointments`; server-side audit helper; dashboard UI for workstations and planning; public booking flow with Stripe deposit integration.

**Tech Stack:** Next.js App Router, Supabase PostgreSQL, Tailwind CSS, Stripe.

**Spec:** `docs/superpowers/specs/2026-11-07-phase3-workstations-audit-design.md`

## Global Constraints
- PostgreSQL RLS must be enabled on all new tables.
- 1 appointment = 1 workstation (exclusive occupation during multi-day duration).
- Activity logs must track all significant user actions (create, update, delete, status change, payment).

## Review Focus
1. Double-booking check: overlapping date ranges on the same workstation must be rejected.
2. Multi-day span calculation: ensure appointment end date correctly accounts for `duration_days`.
3. Deposit verification: public booking requires successful 30% Stripe deposit before confirmation.
4. Audit completeness: verify server actions and API routes call `logActivity`.
5. RLS security: users can only manage workstations and view activity logs for their own business.

---

### Task 1: Database Migration (`053_phase3_workstations_audit.sql`)

**Files:**
- Create: `supabase/migrations/053_phase3_workstations_audit.sql`

**Interfaces:**
- Produces: `public.workstations` table, `public.activity_logs` table, columns on `public.appointments` (`workstation_id`, `duration_days`, `deposit_amount`, `deposit_status`), and RLS policies.

- [ ] **Step 1: Write migration SQL file**

```sql
-- Migration 053: Phase 3 Workstations, Multi-day appointments & Activity Audit Trail

create table if not exists public.workstations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  name text not null,
  description text,
  is_active boolean default true not null,
  created_at timestamptz default now() not null
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);

alter table public.appointments
  add column if not exists workstation_id uuid references public.workstations(id) on delete set null,
  add column if not exists duration_days integer default 1 not null,
  add column if not exists deposit_amount numeric default 0 not null,
  add column if not exists deposit_status text default 'none' check (deposit_status in ('none', 'pending', 'paid', 'refunded'));

alter table public.workstations enable row level security;
alter table public.activity_logs enable row level security;

create policy "Users can manage workstations of their business"
  on public.workstations for all
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Users can view activity logs of their business"
  on public.activity_logs for select
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));
```

- [ ] **Step 2: Apply migration to Supabase**

Run: `npx supabase db push` (or execute via Supabase MCP / CLI)
Expected: Migration 053 applied successfully.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/053_phase3_workstations_audit.sql
git commit -m "feat(database): add workstations, multi-day appointments and activity audit logs"
```

---

### Task 2: Server-side Audit Logger (`lib/audit.ts`)

**Files:**
- Create: `lib/audit.ts`

**Interfaces:**
- Produces: `logActivity(opts)` function.

- [ ] **Step 1: Write `lib/audit.ts`**

```typescript
import { createClient } from '@/lib/supabase/server'

export async function logActivity(opts: {
  businessId: string
  userId?: string | null
  action: string
  entityType: string
  entityId?: string | null
  details?: Record<string, any>
}) {
  try {
    const supabase = await createClient()
    await (supabase.from('activity_logs') as any).insert({
      business_id: opts.businessId,
      user_id: opts.userId || null,
      action: opts.action,
      entity_type: opts.entityType,
      entity_id: opts.entityId || null,
      details: opts.details || {},
    })
  } catch (err) {
    console.error('[AuditLog Error]', err)
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/audit.ts
git commit -m "feat(audit): add server-side activity logger helper"
```

---

### Task 3: Workstations Management & Planning Views

**Files:**
- Create: `app/(dashboard)/workstations/page.tsx`
- Create: `app/(dashboard)/workstations/workstations-client.tsx`
- Create: `app/(dashboard)/planning/page.tsx`
- Create: `app/(dashboard)/planning/planning-client.tsx`
- Modify: `components/layout/sidebar.tsx`

**Interfaces:**
- Consumes: `public.workstations`, `public.appointments`, `logActivity`.
- Produces: Workstations CRUD UI and Multi-day Planning grid view.

- [ ] **Step 1: Create Workstation and Planning UI components and sidebar links**
- [ ] **Step 2: Verify build**
- [ ] **Step 3: Commit**

```bash
git add app/(dashboard)/workstations/ app/(dashboard)/planning/ components/layout/sidebar.tsx
git commit -m "feat(dashboard): add workstations management and multi-day planning views"
```

---

### Task 4: Public Booking & 30% Stripe Deposit

**Files:**
- Create: `app/book/[slug]/page.tsx` (or update existing public booking flow)
- Create: `app/api/reserve/route.ts`

**Interfaces:**
- Consumes: `public.services`, `public.vehicles`, `public.workstations`, `public.appointments`.
- Produces: Public booking flow with workstation selection, multi-day duration, and Stripe checkout session for 30% deposit.

- [ ] **Step 1: Implement public booking API and frontend flow**
- [ ] **Step 2: Verify build and test integration**
- [ ] **Step 3: Commit**

```bash
git add app/book/ app/api/reserve/
git commit -m "feat(booking): add public multi-day workstation booking with 30% deposit"
```
