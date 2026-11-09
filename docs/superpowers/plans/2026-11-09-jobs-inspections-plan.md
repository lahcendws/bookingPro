---
supersedes: none
linked_from: user instruction for Phase 4 implementation plan
user_instruction: "planifie, developpe implemente, teste et review le code de la phase 5 (Phase 4 : chantier, état des lieux et suivi client)"
---

# Phase 4: Jobs, Inspections, and Client Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement workshop job tracking (`jobs`), zone-by-zone vehicle inspection reports with photo compression and digital signature (`job_inspections`), delivery checklists, secure token-based client tracking (`/track/[token]`), and GDPR consent management.

**Architecture:** Database migration adding `jobs` and `job_inspections` tables, API routes for job management and inspection reporting, client-side inspection wizard with canvas signature pad, and a public client tracking portal.

**Tech Stack:** Next.js App Router, Supabase (PostgreSQL & Storage), Tailwind CSS, Lucide React.

**Spec:** `docs/superpowers/specs/2026-11-09-jobs-inspections-design.md`

## Global Constraints
- PostgreSQL with RLS enabled on all new tables.
- Mobile-responsive UI components with Tailwind CSS.
- Secure token-based access for client tracking without requiring login.

## Review Focus
1. **Unauthorized Token Access:** Ensure `/track/[token]` only exposes data for the specific job matching the token.
2. **Signature Storage:** Verify base64 signature storage and retrieval.
3. **GDPR Consent:** Ensure photo sharing consent flag is correctly enforced in public gallery views.

---

### Task 1: Database Migration for Jobs & Inspections

**Files:**
- Create: `supabase/migrations/055_phase4_jobs_inspections.sql`

- [ ] **Step 1: Write migration SQL for `jobs` and `job_inspections` tables** (completed in `supabase/migrations/055_phase4_jobs_inspections.sql`)

- [ ] **Step 2: Commit plan & migration**

```bash
git add docs/superpowers/specs/2026-11-09-jobs-inspections-design.md docs/superpowers/plans/2026-11-09-jobs-inspections-plan.md supabase/migrations/055_phase4_jobs_inspections.sql
git commit -m "feat(jobs): add phase 4 design, plan and database migration for jobs and inspections"
```
