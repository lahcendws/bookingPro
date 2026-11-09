# Workstations & Business Rules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement robust database overlap prevention on workstations, opening hours duration calculations, status transitions, and 15-minute temporary holds for public bookings.

**Architecture:** Database constraints via PostgreSQL GiST indexes + server action / API validations + business rule enforcement in appointment creation.

**Tech Stack:** Next.js App Router, Supabase PostgreSQL, TypeScript, Tailwind CSS.

**Spec:** `docs/superpowers/specs/2026-11-09-workstations-business-rules-design.md`

## Global Constraints
- Workstation overlap is hard-prevented by database constraints.
- Staff conflicts are non-blocking warnings.
- Public bookings with Stripe deposit hold slots for 15 minutes.

## Review Focus
1. Overlapping workstation bookings on multi-day appointments.
2. Expired 15-minute hold cleanup / validation.
3. Working hours duration span across closing times.
4. Staff double-booking warning emission.
5. Status validation on appointment creation and updates.

---

### Task 1: Database Migration for Workstation Overlap and Statuses

**Files:**
- Create: `supabase/migrations/20261109000054_workstations_rules.sql`

**Interfaces:**
- Consumes: Existing `appointments` and `workstations` tables.
- Produces: PostgreSQL exclusion constraint `prevent_workstation_overlap` and status checks.

- [ ] **Step 1: Write migration SQL in `supabase/migrations/20261109000054_workstations_rules.sql`**
- [ ] **Step 2: Apply migration to Supabase local/remote database**
- [ ] **Step 3: Commit**
```bash
git add supabase/migrations/20261109000054_workstations_rules.sql
git commit -m "feat(workstations): add strict overlap exclusion constraint and status rules"
```

---

### Task 2: API & Validation Logic for Appointment Creation & Holds

**Files:**
- Modify: `app/api/book/route.ts`
- Modify: `app/api/appointments/[id]/route.ts`

**Interfaces:**
- Consumes: Workstations, business opening hours, client details.
- Produces: 15-minute hold `expires_at` and non-blocking staff conflict warning.

- [ ] **Step 1: Update booking API to handle 15-min hold (`expires_at`) and workstation conflict check**
- [ ] **Step 2: Verify build and test appointment creation**
- [ ] **Step 3: Commit**
```bash
git add app/api/book/route.ts app/api/appointments/
git commit -m "feat(booking): implement 15-min hold and strict workstation overlap validation"
```
