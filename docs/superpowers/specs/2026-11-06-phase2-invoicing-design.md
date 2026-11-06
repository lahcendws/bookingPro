# Phase 2: Facturation Conforme et Acompte - Design Spec

> **Goal:** Implement French legal compliant invoicing, credit notes (avoirs) with gapless sequential numbering, legal mentions (SIREN, TVA, late payment penalties), document locking, CSV accounting export, and deposit collection via payment links (Stripe Checkout) with manual balance marking.

**Supersedes:** None (New architectural phase following Phase 1).
**Linked from:** Project roadmap and Phase 2 implementation plan.
**User instruction:** "utilise superpowers pour planifier, implementer et faire revue de code et skill playright pour tester en direct dans le navigateur pour developper ce ci: Phase 2 : facturation conforme et acompte"

**Architecture:** 
- New database tables: `invoices`, `invoice_lines`, `payments`
- Strict gapless numbering sequence per business (e.g. `FAC-2026-00001`, `AV-2026-00001`)
- Server actions / API routes for invoice generation from quotes/appointments, Stripe Checkout session creation, and CSV export.
- UI views under `/invoices` for managing invoices, issuing credit notes, recording payments, and downloading PDF/CSV.
