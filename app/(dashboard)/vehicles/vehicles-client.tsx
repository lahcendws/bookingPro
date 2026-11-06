'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Plus, Pencil } from 'lucide-react'
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
      await (supabase.from('vehicles') as any).update(form).eq('id', editingId)
    } else {
      await (supabase.from('vehicles') as any).insert({ ...form, business_id: businessId })
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
