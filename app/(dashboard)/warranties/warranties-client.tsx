'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Plus, ShieldCheck, Search, Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function WarrantiesClient({ initialWarranties, vehicles, clients, businessId }: { initialWarranties: any[]; vehicles: any[]; clients: any[]; businessId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [warranties, setWarranties] = useState(initialWarranties)
  const [form, setForm] = useState<any>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredWarranties = warranties.filter(w =>
    w.product_name.toLowerCase().includes(search.toLowerCase()) ||
    w.lot_number.toLowerCase().includes(search.toLowerCase()) ||
    (w.clients?.name && w.clients.name.toLowerCase().includes(search.toLowerCase())) ||
    (w.vehicles?.plate_number && w.vehicles.plate_number.toLowerCase().includes(search.toLowerCase()))
  )

  async function saveWarranty() {
    if (!form.client_id || !form.vehicle_id || !form.product_name || !form.lot_number) return
    const token = form.qr_code_token || (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))
    const payload = {
      client_id: form.client_id,
      vehicle_id: form.vehicle_id,
      product_name: form.product_name,
      lot_number: form.lot_number,
      duration_months: Number(form.duration_months || 12),
      qr_code_token: token,
      business_id: businessId,
    }

    if (editingId) {
      const { data } = await (supabase.from('warranties') as any).update(payload).eq('id', editingId).select('*, clients(name), vehicles(brand, model, plate_number)').single()
      if (data) {
        setWarranties(warranties.map(w => w.id === editingId ? data : w))
      }
    } else {
      const { data } = await (supabase.from('warranties') as any).insert(payload).select('*, clients(name), vehicles(brand, model, plate_number)').single()
      if (data) {
        setWarranties([data, ...warranties])
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
        title="Garanties"
        actions={
          <Button size="sm" onClick={() => { setForm({}); setEditingId(null); setIsOpen(true) }}>
            <Plus className="w-4 h-4 mr-1" /> Émettre un certificat
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
              placeholder="Rechercher par produit, lot, client, plaque..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {isOpen && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
            <h3 className="font-semibold text-gray-950">{editingId ? 'Modifier le certificat' : 'Nouveau Certificat de Garantie'}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Client</label>
                <select value={form.client_id || ''} onChange={e => setForm((f: any) => ({ ...f, client_id: e.target.value }))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">Sélectionner un client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Véhicule</label>
                <select value={form.vehicle_id || ''} onChange={e => setForm((f: any) => ({ ...f, vehicle_id: e.target.value }))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">Sélectionner un véhicule</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plate_number})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Nom du Produit (ex: XPEL Ultimate Plus)</label>
                <input type="text" value={form.product_name || ''} onChange={e => setForm((f: any) => ({ ...f, product_name: e.target.value }))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Numéro de Lot</label>
                <input type="text" value={form.lot_number || ''} onChange={e => setForm((f: any) => ({ ...f, lot_number: e.target.value }))} placeholder="LOT-98234-XP" className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Durée de garantie (mois)</label>
                <input type="number" value={form.duration_months || 12} onChange={e => setForm((f: any) => ({ ...f, duration_months: Number(e.target.value) }))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white" />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
              <Button onClick={saveWarranty}>Enregistrer</Button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {filteredWarranties.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <ShieldCheck className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <div className="font-medium">Aucun certificat trouvé</div>
            </div>
          ) : (
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
                {filteredWarranties.map(w => (
                  <tr key={w.id} className="border-b hover:bg-gray-50 transition-colors last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900">{w.product_name}</div>
                      <div className="text-xs text-gray-500 font-mono">Lot: {w.lot_number}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{w.clients?.name}</div>
                      <div className="text-xs text-gray-500">{w.vehicles?.brand} {w.vehicles?.model} (<span className="uppercase font-mono">{w.vehicles?.plate_number}</span>)</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{w.duration_months} mois</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600 truncate max-w-[150px]">{w.qr_code_token}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setForm(w); setEditingId(w.id); setIsOpen(true) }} className="p-1.5 hover:bg-gray-100 rounded mr-1"><Pencil className="w-4 h-4 text-gray-500" /></button>
                        <span className="inline-flex items-center text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-1">
                          <ShieldCheck className="w-3 h-3 mr-1" /> Actif
                        </span>
                      </div>
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
