# French Seed Data Design for Local Testing

## Overview

This document describes the design for a deterministic, realistic seed data system for local development testing of BookingPro. The seed data will help test plans, roles, and multi-tenancy isolation.

## Safety Guards

1. **Local-only execution**: Seed scripts check `SUPABASE_URL` is `localhost` or `127.0.0.1`
2. **No remote override**: `SEED_ALLOW_REMOTE` removed - local only
3. **Email domain**: All seed users use `@seed.invalid` 
4. **Reset protection**: Reset deletes only businesses with UUIDv5 namespacing, and seed auth users via Supabase Admin API (email_confirm is auto-true for seed.invalid domain)

---

## Real Schema: Plans & Limits

### Plans Table (updated by migration 063)

| slug | name | price_monthly | price_yearly | appointments_limit | employees_limit | locations_limit | workstations_limit | storage_limit_mb | sms_enabled | inventory_enabled | analytics_enabled | api_enabled | expenses_enabled | negotiated_prices_enabled | inventory_rolls_enabled | data_export_enabled |
|------|------|---------------|--------------|-------------------|-----------------|-----------------|-------------------|------------------|-------------|-------------------|-------------------|-------------|------------------|--------------------------|------------------------|---------------------|
| `basic` | Basic | 19.00 | 190.00 | 50 | 1 | 1 | 1 | 50 | false | false | false | false | false | false | false | true |
| `pro` | Pro | 29.00 | 290.00 | 500 | 5 | 1 | 3 | 500 | true | true | true | false | true | true | true | true |
| `business` | Business | 79.00 | 790.00 | null (unlimited) | 15 | 3 | 10 | 2000 | true | true | true | true | true | true | true | true |

Old plans (`free`, `enterprise`) removed by migration 063. Legacy `businesses.plan` text column constrained to `('basic','pro','business')`.

New columns added to plans table: `workstations_limit`, `expenses_enabled`, `negotiated_prices_enabled`, `inventory_rolls_enabled`, `data_export_enabled`.

### Business Column Relationship

- `businesses.plan` (text) - kept for backward compatibility, CHECK constraint: `in ('basic','pro','business')`
- `businesses.plan_id` (uuid) → `plans.id`
- `businesses.subscription_status` (active/trialing/past_due/canceled)

### Seed Business Plan Allocation (migration 063 compatible)

| Business | Plan | Purpose |
|----------|------|---------|
| `detailing-pro` | pro | Solo tech, pro features (1 emp, 1 loc) |
| `ppf-studio` | business | 4 employees, 3 workstations |
| `downgraded` | **pro→basic** | Exception: created as pro, switched to basic (tests downgrade, exceeds 1-employee limit) |
| `fresh-signup` | basic | New user onboarding (basic is entry plan) |
| `ppf-studio-2` | pro | Twin business for tenant isolation |

**Note**: `seed:check` will detect `downgraded` as anomaly and verify it's explicitly whitelisted.

---

## Tables & Constraints

### Core Tables

| Table | Key Columns | Constraints/Triggers |
|-------|-------------|---------------------|
| `businesses` | id, owner_id, name, plan, plan_id | RLS; trigger sets business_members |
| `business_members` | (business_id, user_id) pk, role | Owner protected (cannot be deleted/demoted) |
| `profiles` | id (pk→auth.users), first_name, last_name | Trigger on auth.users insert |
| `employees` | id, business_id, user_id, name, role, is_active | Overlap check (migration 031) |
| `appointments` | id, business_id, employee_id, service_id, starts_at, ends_at, status, workstation_id, deposit_status | |

### Appointment Overlap Rules

**Employee-level** (migration 031):
- Capacity-aware interval overlap check
- Works when employee_id is NOT NULL
- NULL employee_id allows multiple bookings (walk-ins)

**Workstation-level** (migration 054):
- GiST EXCLUDE constraint: `workstation_id && tstzrange(starts_at, ends_at, '[)')`
- HARD exclusion - no two appointments can occupy same workstation
- Requires `btree_gist` extension

### Overlap Validation

Seed generator must:
1. Pack appointments per workstation (sequential, no gaps that would cause overlaps)
2. Respect employee capacity (default 1)
3. Track status distribution: `completed`(70%), `confirmed`(15%), `pending`(5%), `cancelled`(8%), `no_show`(4%)

---

## Audit Log Strategy

### Trigger-based (migration 056) - PREFERRED

Use existing trigger `fn_log_audit_event()` which provides:

| Field | Description |
|-------|-------------|
| `action` | created, updated, moved, status_changed, cancelled, employee_changed, public_booking_received, deposit_paid, deposit_expired |
| `entity_type` | appointment, client, job |
| `actor_type` | user, client, system |
| `actor_label` | user name/email, 'Client (réservation en ligne)', 'Système' |
| `old_values/new_values` | Field-level JSON diffs (excludes timestamps) |

### Seed Implementation

1. Create audit rows using `supabase.from('audit_logs').insert()` 
2. Set `app.actor_type` and `app.actor_label` via `SET LOCAL app.actor_type = 'client'` before insert
3. No `session_replication_role` needed - triggers are ON
4. **CRITICAL**: Triggers also fire on `business_members` updates, `transactions`, etc. Seed order matters: insert entities BEFORE audit rows to trigger appropriate events, OR insert audit rows directly with triggers bypassed (app.actor_type context).

### Actor Types for Seed

| actor_type | actor_label | Example Actions |
|------------|-------------|-----------------|
| user | Owner/Employee name | APPOINTMENT_CREATED, CLIENT_UPDATED |
| client | Client (réservation en ligne) | public_booking_received |
| system | Système | deposit_expired (on status change) |

---

## Invoice Receipt Numbers

### Current Implementation (transaction receipts)

```sql
create sequence public.receipt_seq start 1000;
new.receipt_number = 'REC-' || lpad(nextval('public.receipt_seq')::text, 6, '0');
```

**Trigger behavior**: 
- Number assigned on INSERT
- Uses `nextval()` which is monotonic
- Cannot backdate without manual override

### Seed Strategy for Invoices

1. Insert invoices directly with `number` field (skip auto-generation)
2. Use format: `INV-2024-000100` (year-prefix + 6-digit sequential per business)
3. Order by `issued_at` to ensure number order == date order
4. `invoice_lines` inserted after `invoices` to maintain foreign key integrity

---

## Deposit Statuses

From migration 053:
```sql
check (deposit_status in ('none', 'pending', 'paid', 'refunded'))
```

| Status | Meaning | Seed Requirement |
|--------|---------|-----------------|
| none | No deposit | Most appointments |
| pending | Deposit requested | Seed some future appointments |
| paid | Deposit received + matched transaction | 30% of future appointments |
| refunded | Deposit refunded | Rare edge case |

Transactions must be created for `paid` deposits:
```sql
INSERT INTO payments (invoice_id, business_id, amount, method, status)
```

---

## Vehicle & Body Types

### Vehicle Body Types (10 standards from migration 062)

| code | label |
|------|-------|
| moto | Moto |
| citadine | Citadine |
| berline | Berline |
| break | Break |
| suv | SUV / 4x4 |
| monospace | Monospace |
| utilitaire | Utilitaire |
| camping_car | Camping-car |
| poids_lourd | Poids lourd |
| autre | Autre |

### Vehicles per Client

- ~1.2 vehicles per client average
- Pareto distribution: 20% of clients have 80% of vehicles
- License plates: SIV format `AB-123-CD` (no I, O, U)
- Models: Peugeot 208, Citroën C5, BMW X3, etc.

### Jobs per Vehicle

- 1-3 jobs per vehicle
- Multi-day PPF jobs span weekends
- Jobs linked to vehicles via `job.vehicle_id`

---

## Inventory Rolls (PPF/Film)

**Schema** (migration 050):
```sql
inventory_rolls(
  name, total_length_m, remaining_length_m, cost_per_m, min_threshold_m
)
```

**Note**: No consumption tracking table exists. Consumption calculated as:
```
consumed_m = total_length_m - remaining_length_m
```

**Seed Data**:
- `PPF Standard`: 10 rolls, 2 below threshold (tests low stock alert)
- `Film Crystal`: 5 rolls, 1 warranty expiring next 7 days

---

## Invoice Numbering

The `invoices.number` column is `text unique not null` with NO auto-generation trigger.

**Seed Strategy**:
1. Generate numbers in `INV-2024-000100` format
2. Ensure per-business sequence
3. Create in chronological order to maintain number==date invariant

---

## Plan Limit Enforcement

`seed:check` assertions:

1. **Basic plan** (slug='basic'): ≤1 employee (count includes admin), ≤1 workstation, ≤50 appts/month (Paris timezone)
2. **Downgraded exception**: Business `downgraded` explicitly whitelisted (has 4 employees on basic plan)
3. **Pro plan**: ≤5 employees, ≤3 workstations, ≤500 appts/month
4. **Business plan**: ≤15 employees, ≤10 workstations, unlimited appointments
5. **Insert attempts exceeding limits should fail** (verify via try/catch in seed)
6. **Reactivation test**: Inactive employee → active on Basic should fail if limit reached
7. **Race condition test**: Concurrent employee inserts should respect limit (advisory lock)
8. **Appointment move test**: UPDATE appointment to different month should enforce limit
9. **Plan immutability test**: Owner cannot UPDATE plan/plan_id/subscription_status directly
10. **Feature gate tests**: Basic cannot insert inventory_items, expenses, whatsapp_templates, client_negotiated_prices, inventory_rolls
11. **Data export**: All plans can export (GDPR), data_export_enabled=true for all
12. **Admin-only tables**: expenses, client_negotiated_prices, data_exports, inventory_rolls, inspection_checklists - only admins can read/write (is_admin check)
13. **Cross-tenant guard**: client_negotiated_prices rejects client_id/service_id from other businesses

---

## DB Connections for Different Operations

| Operation | Connection Type | Notes |
|-----------|-----------------|-------|
| Entity creation (businesses, clients, etc.) | Supabase JS client (authenticated as user) | Normal RLS |
| Audit log insertion | Supabase JS client with `SET LOCAL app.actor_type` | Triggers fire |
| Bulk date backfill | NOT SUPPORTED - triggers will add audit rows | Seed must respect trigger behavior |
| Invoice number assignment | Direct INSERT with explicit `number` | Bypass auto-generation |

---

## Deterministic Data Generation

- **UUIDs**: UUIDv5 using namespace `seed.invalid` + entity name + business name
- **Dates**: Relative to `SEED_NOW` env var (defaults to "today" at seed time)
- **Faker**: `faker.seed(42)` for reproducible names/prices

---

## Expected File Structure

```
scripts/seed/
├── seed.ts              # Main export, runs all seeds in order
├── seed-reset.ts        # Deletes seed-created businesses + auth users
├── seed-check.ts        # Validates invariants (15+ checks)
├── profiles.ts          # Creates auth users with createUser API
├── businesses.ts        # Creates businesses with plan assignment
├── employees.ts         # Creates 4 employees for PPF Studio
├── services.ts          # 15 services with body-type pricing
├── clients.ts           # 25 clients per business
├── vehicles.ts          # Vehicles with SIV plates
├── appointments.ts      # 150 appointments over 30 days
├── transactions.ts      # POS transactions
├── inventory.ts         # Stock, rolls
├── warranties.ts        # Warranty records
└── utils.ts            # Date helpers, faker setup
```

---

## seed:check Invariants (15+ validations)

1. No overlapping appointments per employee (interval check)
2. No overlapping appointments per workstation (GiST exclusion)
3. Business foreign key integrity
4. Admin member exists per business
5. Free plan: employee count ≤ 1 (except downgraded exception)
6. Pro plan: employee count ≤ 5
7. Business plan: employee count ≤ 15, workstations ≤ 3
8. Invoice number sequence contiguous (per business)
9. Invoice date order == number order
10. Roll remaining_m <= total_m
11. Warranties: start_date <= expiry_date
12. Audit: every appointment has ≥1 audit log
13. Audit: no entity date precedes audit date
14. Tenant isolation: Studio JWT cannot read twin-business data
15. Tenant write isolation: Studio employee cannot write to twin
16. Plan limit enforcement: insert exceeding limit fails
17. Client cannot change plan
18. Duplicate plates across businesses allowed (unique per business)
19. Deposit payments match paid status
20. Status distribution matches expected ratios

---

## Execution Order

1. `profiles.ts` - Create auth users via `supabase.auth.admin.createUser()` (email_confirm=true for @seed.invalid)
2. `businesses.ts` - Create businesses, assign plans
3. `employees.ts` - Create 4 employees, link to auth users
4. `services.ts` - 15 services with cost_price_ht
5. `inventory.ts` - Stock levels, rolls
6. `vehicles.ts` - Vehicles with SIV plates
7. `clients.ts` - 25 clients per business
8. `appointments.ts` - Spread 150 appointments over 30 days (respecting overlaps)
9. `transactions.ts` - Generate POS transactions
10. `warranties.ts` - Create warranty records
11. `seed-check.ts` - Validate all invariants

---

## Migration 060 Backfill Fix

The backfill query in migration 060 has an error:
```sql
e.name = (select trim(concat_ws(' ', first_name, last_name)) from auth.users u where u.id = b.owner_id)
```
**Issue**: `auth.users` has NO `first_name`/`last_name` columns - they're in `public.profiles`.

**Correct query** should use `public.profiles`:
```sql
e.name = (select trim(concat_ws(' ', first_name, last_name)) from public.profiles p where p.id = b.owner_id)
```

This should be fixed before applying migration 060 or handled in seed scripts.

---

## Next Steps (Implementation)

After your approval:
1. Create `scripts/seed/` directory
2. Implement `utils.ts` with faker and date helpers
3. Implement each seed module in order
4. Create `SEED.md` with credential documentation