---
name: settings-tabs-employees-role
description: Revert employee role handling to default 'employee' for new employees; admin role comes from migration/trigger, not auto-assigned on insert.
---

**Why (reverted):** Previously new employees were given role 'admin' when they owned the business, causing "Role pas bon" display on the "Ajouter un employé" form. Restored original behavior where every newly inserted employee gets role 'employee'.

**Current state:** `saveEmployee()` now uses `role: empForm.role ?? 'employee'` — no automatic admin assignment for existing users or new employees. Migration `059_business_members.sql` already sets owners to 'admin' and non-owners to 'employee', plus RLS policies enforce it. Newly created rows will be 'employee' by default; only explicit `empForm.role = 'admin'` overrides.

- [Settings tabs employee role fix](memory/settings-tabs-employees-role.md)
