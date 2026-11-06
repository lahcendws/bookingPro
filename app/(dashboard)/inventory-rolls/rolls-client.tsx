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
    await (supabase.from('inventory_rolls') as any).insert({
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
    await (supabase.from('inventory_rolls') as any).update({ remaining_length_m: newRemaining }).eq('id', id)
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
