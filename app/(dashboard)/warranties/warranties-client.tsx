'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Plus, ShieldCheck } from 'lucide-react'
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
