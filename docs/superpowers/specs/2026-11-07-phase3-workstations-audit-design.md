# Phase 3 Design Specification: Workstations, Multi-Day Planning, Public Booking & Audit Trail

> **Goal:** Implement workstation management, multi-day appointment scheduling (e.g. PPF wrapping taking 3 days), workstation conflict prevention, public booking with 30% Stripe deposit, and comprehensive user activity audit logging.

---

## 1. Database Schema (`supabase/migrations/053_phase3_workstations_audit.sql`)

### Tables
1. **`workstations`**
   - `id` uuid primary key default gen_random_uuid()
   - `business_id` uuid references public.businesses(id) on delete cascade not null
   - `name` text not null
   - `description` text
   - `is_active` boolean default true not null
   - `created_at` timestamptz default now() not null

2. **`activity_logs`**
   - `id` uuid primary key default gen_random_uuid()
   - `business_id` uuid references public.businesses(id) on delete cascade not null
   - `user_id` uuid references auth.users(id) on delete set null
   - `action` text not null (e.g., 'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'PAYMENT')
   - `entity_type` text not null (e.g., 'appointment', 'workstation', 'quote', 'invoice', 'client', 'vehicle')
   - `entity_id` uuid
   - `details` jsonb default '{}'::jsonb
   - `created_at` timestamptz default now() not null

### Alterations to existing tables
- **`appointments`**:
  - `workstation_id` uuid references public.workstations(id) on delete set null
  - `duration_days` integer default 1 not null
  - `deposit_amount` numeric default 0 not null
  - `deposit_status` text default 'none' check (deposit_status in ('none', 'pending', 'paid', 'refunded'))

### RLS Policies
- `workstations`: Enabled. Authenticated owners/employees can view and manage workstations of their business.
- `activity_logs`: Enabled. Authenticated owners can view activity logs of their business. System inserts logs via service role or user context.

---

## 2. Server-side Audit Logger (`lib/audit.ts`)
- Helper function `logActivity({ businessId, userId, action, entityType, entityId, details })` to record actions across API routes and server actions.

---

## 3. UI & Frontend Modules
1. **Workstations Management (`/dashboard/workstations`)**: CRUD interface for workstations.
2. **Planning by Workstation (`/dashboard/planning`)**: Visual grid displaying appointments assigned to each workstation across multi-day spans.
3. **Public Booking & Deposit (`/book/[slug]`)**:
   - Step 1: Select service & vehicle size.
   - Step 2: Choose workstation and date range (handling multi-day duration).
   - Step 3: Enter client details.
   - Step 4: Stripe Checkout for 30% deposit to confirm appointment.
4. **Activity Log Viewer (`/dashboard/settings/audit`)**: Audit trail viewer for business owners.
