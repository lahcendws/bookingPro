# Phase 2: Invoicing & Deposits Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Supersedes:** None (New implementation plan for Phase 2).
**Linked from:** Task initialization and spec `docs/superpowers/specs/2026-11-06-phase2-invoicing-design.md`.
**User instruction:** "utilise superpowers pour planifier, implementer et faire revue de code et skill playright pour tester en direct dans le navigateur pour developper ce ci: Phase 2 : facturation conforme et acompte"

**Goal:** Implement French-compliant invoicing with gapless numbering, credit notes (avoirs), mandatory legal notices, document locking, CSV accounting export, and Stripe deposit checkout links.

**Architecture:** Database tables (`invoices`, `invoice_lines`, `payments`) with RLS policies, Next.js server actions / API routes for PDF/CSV and Stripe checkout, and UI management views under `/invoices`.

**Tech Stack:** Next.js App Router, Supabase, Tailwind CSS, Lucide Icons, Stripe API.

**Spec:** `docs/superpowers/specs/2026-11-06-phase2-invoicing-design.md`

## Global Constraints
- Gapless numbering with no gaps allowed for invoices and credit notes.
- Mandatory legal notices: SIREN, TVA number, late payment penalties.
- Locked state: once issued/finalized, invoices cannot be modified.
- Strict separation of duties and secure RLS policies per business.

## Review Focus
1. Concurrency on invoice number generation.
2. Credit note calculations and tax consistency.
3. Stripe webhook signature verification and balance reconciliation.
4. Accounting export format compliance.
5. Unauthorized modification attempts on locked invoices.

---

### Task 1: Database Migration for Invoices, Invoice Lines & Payments

**Files:**
- Create: `supabase/migrations/052_phase2_invoicing.sql`

- [ ] **Step 1: Write SQL migration script for invoices, invoice_lines, payments**
```sql
-- Migration 052: Phase 2 Invoicing, Credit Notes & Deposits
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  quote_id uuid references public.quotes(id) on delete set null,
  type text default 'invoice' check (type in ('invoice', 'credit_note')),
  number text unique not null,
  status text default 'draft' check (status in ('draft', 'issued', 'paid', 'partially_paid', 'cancelled')),
  subtotal numeric default 0 not null,
  tax_amount numeric default 0 not null,
  total_amount numeric default 0 not null,
  deposit_paid numeric default 0 not null,
  balance_due numeric default 0 not null,
  due_date date,
  issued_at timestamptz,
  stripe_payment_link text,
  notes text,
  created_at timestamptz default now() not null
);

create table if not exists public.invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  service_id uuid references public.services(id) on delete set null,
  description text not null,
  quantity numeric default 1 not null,
  unit_price numeric default 0 not null,
  tax_rate numeric default 20 not null,
  total_price numeric default 0 not null
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  business_id uuid references public.businesses(id) on delete cascade not null,
  amount numeric default 0 not null,
  method text default 'stripe' check (method in ('stripe', 'cash', 'card', 'transfer', 'check')),
  stripe_payment_intent_id text,
  status text default 'completed' check (status in ('pending', 'completed', 'refunded')),
  created_at timestamptz default now() not null
);

alter table public.invoices enable row level security;
alter table public.invoice_lines enable row level security;
alter table public.payments enable row level security;

create policy "Users can view invoices of their business"
  on public.invoices for select
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Users can manage invoices of their business"
  on public.invoices for all
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Users can view invoice lines of their business"
  on public.invoice_lines for select
  to authenticated
  using (invoice_id in (select id from public.invoices where business_id in (select id from public.businesses where owner_id = auth.uid())));

create policy "Users can manage invoice lines of their business"
  on public.invoice_lines for all
  to authenticated
  using (invoice_id in (select id from public.invoices where business_id in (select id from public.businesses where owner_id = auth.uid())))
  with check (invoice_id in (select id from public.invoices where business_id in (select id from public.businesses where owner_id = auth.uid())));

create policy "Users can view payments of their business"
  on public.payments for select
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Users can manage payments of their business"
  on public.payments for all
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));
```

- [ ] **Step 2: Apply migration to Supabase**
Run: `supabase db push`
Expected: Success applying migration 052_phase2_invoicing.sql.

- [ ] **Step 3: Commit**
```bash
git add supabase/migrations/052_phase2_invoicing.sql
git commit -m "feat(invoicing): add database schema for invoices, invoice_lines and payments"
```

---

### Task 2: Invoices Management UI and Conversion from Quote

**Files:**
- Create: `app/(dashboard)/invoices/page.tsx`
- Create: `app/(dashboard)/invoices/invoices-client.tsx`
- Modify: `components/layout/sidebar.tsx`

- [ ] **Step 1: Create server page `app/(dashboard)/invoices/page.tsx`**
- [ ] **Step 2: Create client component `app/(dashboard)/invoices/invoices-client.tsx` with list, status filters, convert-from-quote modal, and payment status tracking**
- [ ] **Step 3: Add "Factures & Acomptes" to `components/layout/sidebar.tsx`**
- [ ] **Step 4: Run build check**
Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add app/(dashboard)/invoices/ components/layout/sidebar.tsx
git commit -m "feat(invoices): implement invoices client UI, quote conversion, and sidebar navigation"
```

---

### Task 3: Stripe Checkout Integration for Deposits & Balance Collection

**Files:**
- Create: `app/api/stripe/invoice-checkout/route.ts`

- [ ] **Step 1: Implement Stripe Checkout route for invoice deposit/balance payments**
- [ ] **Step 2: Test build**
Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Commit**
```bash
git add app/api/stripe/
git commit -m "feat(invoicing): add stripe checkout deposit payment endpoint"
```

---

### Task 4: Accounting CSV Export & Legal Notices

**Files:**
- Create: `app/api/invoices/export-csv/route.ts`
- Modify: `app/(dashboard)/invoices/invoices-client.tsx`

- [ ] **Step 1: Implement CSV export endpoint adhering to French accounting norms (FEC format columns)**
- [ ] **Step 2: Add export button and legal notice display on invoice details view**
- [ ] **Step 3: Run final build & verify**
Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**
```bash
git add app/api/invoices/export-csv/ app/(dashboard)/invoices/invoices-client.tsx
git commit -m "feat(invoicing): add French accounting CSV export and legal notices"
```
