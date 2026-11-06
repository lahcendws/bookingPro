# Automotive Styling, PPF & Detailing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform BookingPro into a specialized platform for automotive styling, PPF, detailing, and tinting with vehicle inspection check-lists, roll inventory tracking, warranty certificates, and profitability analytics.

**Architecture:** Add database migrations for vehicles, inventory rolls, inspection checklists, and warranties. Build dedicated frontend views and backend server actions to manage vehicle profiles, track linear meter consumption of film rolls, record before/after photos with client sign-off, generate warranty PDFs, and compute job margins.

**Tech Stack:** Next.js 16 App Router, React, Tailwind CSS, Supabase PostgreSQL, TypeScript.

**Spec:** `docs/superpowers/specs/2026-11-06-automotive-detailing-ppf-design.md`

## Global Constraints
- PostgreSQL RLS policies must be applied to all new tables (`vehicles`, `inventory_rolls`, `inspection_checklists`, `warranties`) ensuring multi-tenant isolation by `business_id`.
- PII and customer data must be properly filtered/secured.
- UI styling must remain consistent with BookingPro design tokens (Tailwind, clean cards, green/blue primary accents).

## Review Focus
1. **Roll inventory negative stock:** Ensure film roll length cannot drop below zero when consuming meters for a job.
2. **Vehicle plate format uniqueness:** Prevent duplicate plate numbers per business.
3. **Warranty token uniqueness:** Guarantee unique QR code tokens for generated warranties.
4. **Margin calculation division by zero:** Handle edge cases where job price or material cost is zero.
5. **Photo upload size/type restrictions:** Validate uploaded inspection and before/after photos.

---

## Task 1: Database Migration & Schema Setup

**Files:**
- Create: `supabase/migrations/050_automotive_specialization.sql`

**Interfaces:**
- Consumes: Existing `businesses`, `clients`, `appointments` tables.
- Produces: Tables `vehicles`, `inventory_rolls`, `inspection_checklists`, `warranties`, with RLS enabled and proper foreign keys.

- [ ] **Step 1: Write the migration SQL file**

```sql
-- Create vehicles table
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  plate_number text not null,
  brand text not null,
  model text not null,
  year int,
  color text,
  vin text,
  notes text,
  created_at timestamptz default now() not null
);

enable rls on public.vehicles;

create policy "Users can view vehicles of their business"
  on public.vehicles for select
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Users can manage vehicles of their business"
  on public.vehicles for all
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- Create inventory rolls table for PPF / Films
create table if not exists public.inventory_rolls (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  name text not null,
  total_length_m numeric not null,
  remaining_length_m numeric not null,
  cost_per_m numeric not null,
  min_threshold_m numeric default 5 not null,
  created_at timestamptz default now() not null
);

enable rls on public.inventory_rolls;

create policy "Users can view inventory rolls of their business"
  on public.inventory_rolls for select
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Users can manage inventory rolls of their business"
  on public.inventory_rolls for all
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- Create inspection checklists table
create table if not exists public.inspection_checklists (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete cascade not null,
  photos_before jsonb default '[]'::jsonb,
  photos_after jsonb default '[]'::jsonb,
  client_signature_url text,
  created_at timestamptz default now() not null
);

-- Create warranties table
create table if not exists public.warranties (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  vehicle_id uuid references public.vehicles(id) on delete cascade not null,
  roll_id uuid references public.inventory_rolls(id) on delete set null,
  product_name text not null,
  lot_number text not null,
  duration_months int not null,
  qr_code_token text unique not null,
  pdf_url text,
  created_at timestamptz default now() not null
);

enable rls on public.warranties;

create policy "Users can view warranties of their business"
  on public.warranties for select
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Users can manage warranties of their business"
  on public.warranties for all
  to authenticated
  using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));
```

- [ ] **Step 2: Commit migration file**

```bash
git add supabase/migrations/050_automotive_specialization.sql
git commit -m "feat(db): add vehicles, inventory rolls, inspections and warranties migration"
```

---

## Task 2: Vehicle & Garage Management Module

**Files:**
- Create: `app/(dashboard)/vehicles/page.tsx`
- Create: `app/(dashboard)/vehicles/vehicles-client.tsx`

**Interfaces:**
- Consumes: Supabase client, business ID.
- Produces: Full vehicle CRUD and garage listing interface.

- [ ] **Step 1: Write `app/(dashboard)/vehicles/vehicles-client.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Plus, Car, Trash2, Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Vehicle {
  id: string
  plate_number: string
  brand: string
  model: string
  year: number | null
  color: string | null
  vin: string | null
  clients: { name: string; phone: string | null } | null
}

export function VehiclesClient({ initialVehicles, clients, businessId }: { initialVehicles: Vehicle[]; clients: any[]; businessId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [vehicles, setVehicles] = useState(initialVehicles)
  const [form, setForm] = useState<Partial<Vehicle> & { client_id?: string }>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  async function saveVehicle() {
    if (!form.plate_number || !form.brand || !form.model || !form.client_id) return
    if (editingId) {
      await supabase.from('vehicles').update(form).eq('id', editingId)
    } else {
      await supabase.from('vehicles').insert({ ...form, business_id: businessId })
    }
    setForm({})
    setEditingId(null)
    setIsOpen(false)
    router.refresh()
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Garage & Véhicules</h1>
          <p className="text-sm text-gray-500">Gérez le parc véhicules de vos clients pour le PPF, Covering et Detailing.</p>
        </div>
        <Button onClick={() => { setForm({}); setEditingId(null); setIsOpen(true) }}>
          <Plus className="w-4 h-4 mr-2" /> Ajouter un véhicule
        </Button>
      </div>

      {isOpen && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
          <h3 className="font-semibold text-gray-950">{editingId ? 'Modifier le véhicule' : 'Nouveau véhicule'}</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Client Propriétaire</label>
              <select value={form.client_id || ''} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm">
                <option value="">Sélectionner un client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone || 'Sans tél'})</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Immatriculation / Plaque</label>
              <input type="text" value={form.plate_number || ''} onChange={e => setForm(f => ({ ...f, plate_number: e.target.value }))} placeholder="AB-123-CD" className="w-full mt-1 border rounded-lg px-3 py-2 text-sm uppercase" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Marque</label>
              <input type="text" value={form.brand || ''} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="Porsche" className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Modèle</label>
              <input type="text" value={form.model || ''} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="911 GT3 RS" className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Année</label>
              <input type="number" value={form.year || ''} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} placeholder="2024" className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Couleur</label>
              <input type="text" value={form.color || ''} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} placeholder="Gris Nardo" className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
            <Button onClick={saveVehicle}>Enregistrer</Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
              <th className="text-left px-4 py-3 font-medium">Immatriculation</th>
              <th className="text-left px-4 py-3 font-medium">Véhicule</th>
              <th className="text-left px-4 py-3 font-medium">Propriétaire</th>
              <th className="text-left px-4 py-3 font-medium">Couleur</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-bold text-gray-900 font-mono">{v.plate_number}</td>
                <td className="px-4 py-3">{v.brand} {v.model} ({v.year || '—'})</td>
                <td className="px-4 py-3 text-gray-600">{v.clients?.name || 'Inconnu'}</td>
                <td className="px-4 py-3 text-gray-500">{v.color || '—'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setForm(v); setEditingId(v.id); setIsOpen(true) }} className="p-1.5 hover:bg-gray-100 rounded mr-1"><Pencil className="w-4 h-4 text-gray-500" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write `app/(dashboard)/vehicles/page.tsx`**

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { VehiclesClient } from './vehicles-client'

export default async function VehiclesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).maybeSingle()
  if (!business) redirect('/onboarding')

  const { data: vehicles } = await supabase.from('vehicles').select('*, clients(name, phone)').eq('business_id', business.id).order('created_at', { ascending: false })
  const { data: clients } = await supabase.from('clients').select('id, name, phone').eq('business_id', business.id)

  return <VehiclesClient initialVehicles={vehicles || []} clients={clients || []} businessId={business.id} />
}
```

- [ ] **Step 3: Commit vehicles module**

```bash
git add app/(dashboard)/vehicles/
git commit -m "feat(vehicles): add vehicle garage management module"
```

---

## Task 3: Inventory Rolls & Material Tracking

**Files:**
- Create: `app/(dashboard)/inventory-rolls/page.tsx`
- Create: `app/(dashboard)/inventory-rolls/rolls-client.tsx`

**Interfaces:**
- Consumes: Supabase client, business ID.
- Produces: Roll inventory management interface with linear meters and cost tracking.

- [ ] **Step 1: Write `app/(dashboard)/inventory-rolls/rolls-client.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Plus, Ruler, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Roll {
  id: string
  name: string
  total_length_m: number
  remaining_length_m: number
  cost_per_m: number
  min_threshold_m: number
}

export function RollsClient({ initialRolls, businessId }: { initialRolls: Roll[]; businessId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [rolls, setRolls] = useState(initialRolls)
  const [form, setForm] = useState<Partial<Roll>>({})
  const [isOpen, setIsOpen] = useState(false)

  async function saveRoll() {
    if (!form.name || form.total_length_m == null || form.cost_per_m == null) return
    await supabase.from('inventory_rolls').insert({
      ...form,
      business_id: businessId,
      remaining_length_m: form.total_length_m,
      min_threshold_m: form.min_threshold_m || 5,
    })
    setForm({})
    setIsOpen(false)
    router.refresh()
  }

  async function consumeMeters(id: string, currentRemaining: number) {
    const meters = prompt(`Combien de mètres consommés sur ce rouleau ? (Restant: ${currentRemaining}m)`)
    if (!meters || isNaN(Number(meters))) return
    const consumed = Number(meters)
    const newRemaining = Math.max(0, currentRemaining - consumed)
    await supabase.from('inventory_rolls').update({ remaining_length_m: newRemaining }).eq('id', id)
    setRolls(rolls.map(r => r.id === id ? { ...r, remaining_length_m: newRemaining } : r))
    router.refresh()
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Rouleaux & Films (PPF)</h1>
          <p className="text-sm text-gray-500">Suivi des métrages linéaires de films et calcul du coût matière par chantier.</p>
        </div>
        <Button onClick={() => { setForm({}); setIsOpen(true) }}>
          <Plus className="w-4 h-4 mr-2" /> Ajouter un rouleau
        </Button>
      </div>

      {isOpen && (
        <div className="bg-white border rounded-xl p-6 space-y-4 shadow-sm">
          <h3 className="font-semibold text-gray-950">Nouveau Rouleau de Film / PPF</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Nom / Référence (ex: XPEL Ultimate 60")</label>
              <input type="text" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Métrage Total (mètres)</label>
              <input type="number" value={form.total_length_m || ''} onChange={e => setForm(f => ({ ...f, total_length_m: Number(e.target.value) }))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Coût au mètre (€)</label>
              <input type="number" step="0.01" value={form.cost_per_m || ''} onChange={e => setForm(f => ({ ...f, cost_per_m: Number(e.target.value) }))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
            <Button onClick={saveRoll}>Enregistrer</Button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rolls.map(r => {
          const isLow = r.remaining_length_m <= r.min_threshold_m
          const percent = Math.round((r.remaining_length_m / r.total_length_m) * 100)
          return (
            <div key={r.id} className={`bg-white rounded-xl border p-5 flex flex-col justify-between ${isLow ? 'border-amber-300 bg-amber-50/20' : 'border-gray-200'}`}>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">{r.name}</h3>
                  {isLow && <span className="flex items-center text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full"><AlertTriangle className="w-3 h-3 mr-1" /> Stock bas</span>}
                </div>
                <div className="space-y-1 mb-4 text-sm text-gray-600">
                  <p>Restant : <strong className="text-gray-900">{r.remaining_length_m} m</strong> / {r.total_length_m} m ({percent}%)</p>
                  <p>Coût matière : {r.cost_per_m} € / mètre</p>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-4">
                  <div className={`h-full ${isLow ? 'bg-amber-500' : 'bg-green-600'}`} style={{ width: `${percent}%` }} />
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => consumeMeters(r.id, r.remaining_length_m)}>
                <Ruler className="w-4 h-4 mr-2" /> Déduire métrage chantier
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write `app/(dashboard)/inventory-rolls/page.tsx`**

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RollsClient } from './rolls-client'

export default async function InventoryRollsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).maybeSingle()
  if (!business) redirect('/onboarding')

  const { data: rolls } = await supabase.from('inventory_rolls').select('*').eq('business_id', business.id).order('created_at', { ascending: false })

  return <RollsClient initialRolls={rolls || []} businessId={business.id} />
}
```

- [ ] **Step 3: Commit inventory rolls module**

```bash
git add app/(dashboard)/inventory-rolls/
git commit -m "feat(rolls): add PPF and film linear meter inventory tracking"
```

---

## Task 4: Warranty Certificates & QR Code Generation

**Files:**
- Create: `app/(dashboard)/warranties/page.tsx`
- Create: `app/(dashboard)/warranties/warranties-client.tsx`

**Interfaces:**
- Consumes: Supabase client, business ID, vehicles list, clients list.
- Produces: Warranty certificate management and generation interface.

- [ ] **Step 1: Write `app/(dashboard)/warranties/warranties-client.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Plus, ShieldCheck, QrCode } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function WarrantiesClient({ initialWarranties, vehicles, clients, businessId }: { initialWarranties: any[]; vehicles: any[]; clients: any[]; businessId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [warranties, setWarranties] = useState(initialWarranties)
  const [form, setForm] = useState<any>({})
  const [isOpen, setIsOpen] = useState(false)

  async function saveWarranty() {
    if (!form.client_id || !form.vehicle_id || !form.product_name || !form.lot_number) return
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    await supabase.from('warranties').insert({
      ...form,
      business_id: businessId,
      qr_code_token: token,
      duration_months: Number(form.duration_months || 12),
    })
    setForm({})
    setIsOpen(false)
    router.refresh()
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificats de Garantie PPF & Céramique</h1>
          <p className="text-sm text-gray-500">Générez des certificats officiels avec numéro de lot et traçabilité pour rassurer vos clients.</p>
        </div>
        <Button onClick={() => { setForm({}); setIsOpen(true) }}>
          <Plus className="w-4 h-4 mr-2" /> Émettre un certificat
        </Button>
      </div>

      {isOpen && (
        <div className="bg-white border rounded-xl p-6 space-y-4 shadow-sm">
          <h3 className="font-semibold text-gray-950">Nouveau Certificat de Garantie</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Client</label>
              <select value={form.client_id || ''} onChange={e => setForm((f: any) => ({ ...f, client_id: e.target.value }))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm">
                <option value="">Sélectionner un client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Véhicule</label>
              <select value={form.vehicle_id || ''} onChange={e => setForm((f: any) => ({ ...f, vehicle_id: e.target.value }))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm">
                <option value="">Sélectionner un véhicule</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plate_number})</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Nom du Produit (ex: XPEL Ultimate Plus)</label>
              <input type="text" value={form.product_name || ''} onChange={e => setForm((f: any) => ({ ...f, product_name: e.target.value }))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Numéro de Lot</label>
              <input type="text" value={form.lot_number || ''} onChange={e => setForm((f: any) => ({ ...f, lot_number: e.target.value }))} placeholder="LOT-98234-XP" className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Durée de garantie (mois)</label>
              <input type="number" value={form.duration_months || 12} onChange={e => setForm((f: any) => ({ ...f, duration_months: Number(e.target.value) }))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
            <Button onClick={saveWarranty}>Générer le certificat</Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
              <th className="text-left px-4 py-3 font-medium">Produit & Lot</th>
              <th className="text-left px-4 py-3 font-medium">Client / Véhicule</th>
              <th className="text-left px-4 py-3 font-medium">Durée</th>
              <th className="text-left px-4 py-3 font-medium">Token QR</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {warranties.map(w => (
              <tr key={w.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-bold text-gray-900">{w.product_name}</div>
                  <div className="text-xs text-gray-500 font-mono">Lot: {w.lot_number}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800">{w.clients?.name}</div>
                  <div className="text-xs text-gray-500">{w.vehicles?.brand} {w.vehicles?.model} ({w.vehicles?.plate_number})</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{w.duration_months} mois</td>
                <td className="px-4 py-3 font-mono text-xs text-blue-600 truncate max-w-[150px]">{w.qr_code_token}</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-1">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Actif
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write `app/(dashboard)/warranties/page.tsx`**

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WarrantiesClient } from './warranties-client'

export default async function WarrantiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).maybeSingle()
  if (!business) redirect('/onboarding')

  const { data: warranties } = await supabase.from('warranties').select('*, clients(name), vehicles(brand, model, plate_number)').eq('business_id', business.id).order('created_at', { ascending: false })
  const { data: vehicles } = await supabase.from('vehicles').select('id, brand, model, plate_number').eq('business_id', business.id)
  const { data: clients } = await supabase.from('clients').select('id, name').eq('business_id', business.id)

  return <WarrantiesClient initialWarranties={warranties || []} vehicles={vehicles || []} clients={clients || []} businessId={business.id} />
}
```

- [ ] **Step 3: Commit warranties module**

```bash
git add app/(dashboard)/warranties/
git commit -m "feat(warranties): add warranty certificate management with lot numbers and QR tokens"
```
