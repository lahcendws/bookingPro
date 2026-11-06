'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Plus, Search, Pencil, Car } from 'lucide-react'
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

export function VehiclesClient({ initialVehicles, clients, businessId, searchParamQuery }: { initialVehicles: Vehicle[]; clients: any[]; businessId: string; searchParamQuery?: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [vehicles, setVehicles] = useState(initialVehicles)
  const [form, setForm] = useState<Partial<Vehicle> & { client_id?: string }>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState(searchParamQuery || '')

  const filteredVehicles = vehicles.filter(v =>
    v.plate_number.toLowerCase().includes(search.toLowerCase()) ||
    v.brand.toLowerCase().includes(search.toLowerCase()) ||
    v.model.toLowerCase().includes(search.toLowerCase()) ||
    (v.clients?.name && v.clients.name.toLowerCase().includes(search.toLowerCase()))
  )

  async function saveVehicle() {
    if (!form.plate_number || !form.brand || !form.model || !form.client_id) return
    const payload = {
      ...form,
      plate_number: form.plate_number.toUpperCase().trim(),
      business_id: businessId,
    }
    if (editingId) {
      const { data } = await (supabase.from('vehicles') as any).update(payload).eq('id', editingId).select('*, clients(name, phone)').single()
      if (data) {
        setVehicles(vehicles.map(v => v.id === editingId ? data : v))
      }
    } else {
      const { data } = await (supabase.from('vehicles') as any).insert(payload).select('*, clients(name, phone)').single()
      if (data) {
        setVehicles([data, ...vehicles])
      }
    }
    setForm({})
    setEditingId(null)
    setIsOpen(false)
    router.refresh()
  }

  return (
    <>
      <Header
        title="Véhicules"
        actions={
          <Button size="sm" onClick={() => { setForm({}); setEditingId(null); setIsOpen(true) }}>
            <Plus className="w-4 h-4 mr-1" /> Ajouter un véhicule
          </Button>
        }
      />
      <main className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par plaque, marque, modèle, client..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {isOpen && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
            <h3 className="font-semibold text-gray-950">{editingId ? 'Modifier le véhicule' : 'Nouveau véhicule'}</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Client Propriétaire</label>
                <select value={form.client_id || ''} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">Sélectionner un client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone || 'Sans tél'})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Immatriculation / Plaque</label>
                <input type="text" value={form.plate_number || ''} onChange={e => setForm(f => ({ ...f, plate_number: e.target.value.toUpperCase() }))} placeholder="AB-123-CD" className="w-full mt-1 border rounded-lg px-3 py-2 text-sm uppercase" />
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
          {filteredVehicles.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <Car className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <div className="font-medium">Aucun véhicule trouvé</div>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase">
                  <th className="text-left px-4 py-3 font-medium">Immatriculation</th>
                  <th className="text-left px-4 py-3 font-medium">Véhicule</th>
                  <th className="text-left px-4 py-3 font-medium">Propriétaire</th>
                  <th className="text-left px-4 py-3 font-medium">Couleur</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map(v => (
                  <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-0">
                    <td className="px-4 py-3 font-bold text-gray-900 font-mono uppercase">{v.plate_number}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{v.brand} {v.model} <span className="text-gray-400 font-normal">({v.year || '—'})</span></td>
                    <td className="px-4 py-3 text-gray-600">{v.clients?.name || 'Inconnu'}</td>
                    <td className="px-4 py-3 text-gray-500">{v.color || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { setForm(v); setEditingId(v.id); setIsOpen(true) }} className="p-1.5 hover:bg-gray-100 rounded mr-1"><Pencil className="w-4 h-4 text-gray-500" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  )
}
