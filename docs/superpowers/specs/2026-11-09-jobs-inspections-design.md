---
supersedes: none
linked_from: user instruction for Phase 4 jobs and inspections
user_instruction: "en utilisant le skill superpowers planifie,developpe implemente, teste et review le code de la phase 5 (Phase 4 : chantier, état des lieux et suivi client)"
---

# Phase 4: Jobs, Inspections, and Client Tracking Design Specification

## Overview
Phase 4 introduces full workshop job tracking (`jobs`), zone-by-zone vehicle condition inspection reports (`job_inspections`), client digital signatures, delivery checklists, secure token-based client progress tracking (`/track/[token]`), and GDPR consent management for photo gallery usage.

## Architecture & Database Schema

### 1. `jobs` Table
Tracks vehicles currently in the workshop or completed:
- `id` (uuid, PK)
- `business_id` (uuid, references businesses)
- `quote_id` (uuid, nullable references quotes)
- `appointment_id` (uuid, nullable references appointments)
- `client_id` (uuid, references clients)
- `vehicle_id` (uuid, references vehicles)
- `status` (text: `reception`, `en_cours`, `controle`, `livre`)
- `tracking_token` (uuid default gen_random_uuid() unique)
- `notes` (text)
- `created_at`, `updated_at` (timestamptz)

### 2. `job_inspections` Table
Stores vehicle condition inspections (reception & delivery):
- `id` (uuid, PK)
- `job_id` (uuid, references jobs on delete cascade)
- `type` (text: `reception` or `delivery`)
- `zones` (jsonb: array of zones with name, photos array, comments, damage tags)
- `signature_data` (text: base64 signature image or vector data)
- `client_consent_gallery` (boolean default false — GDPR photo sharing consent)
- `created_at` (timestamptz)

### 3. Security & RLS
- RLS enabled on `jobs` and `job_inspections`.
- Authenticated business owners/staff can manage jobs and inspections for their business.
- Public read access via secure `tracking_token` for clients (`/track/[token]`).

## UI & Workflows
1. **Jobs Dashboard (`/jobs`):** Kanban or list view of ongoing chantiers grouped by status.
2. **Inspection Wizard (`/jobs/[id]/inspection`):** Zone selection (Face, Arrière, Flanc Droit, Flanc Gauche, Toit, Intérieur), camera/file upload with client signature pad.
3. **Public Tracking Portal (`/track/[token]`):** Clean mobile-responsive page showing current status, vehicle details, inspection photos, and delivery confirmation.
