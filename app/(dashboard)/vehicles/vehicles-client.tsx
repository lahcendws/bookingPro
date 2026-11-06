'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Plus, Search, Pencil, Car, History, ClipboardCheck, FileText, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Vehicle {
  id: string
  plate_number: string
  brand: string
  model: string
  year: number | null
  color: string | null
  vin: string | null
  size_class: 'citadine' | 'berline' | 'suv' | 'utilitaire'
  client_id: string
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

  // Quick Quote Generator Modal State
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [quoteVehicle, setQuoteVehicle] = useState<Vehicle | null>(null)
  const [quoteServices, setQuoteServices] = useState<any[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [quoteLines, setQuoteLines] = useState<any[]>([])
  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState('')

  const filteredVehicles = vehicles.filter(v =>
    v.plate_number.toLowerCase().includes(search.toLowerCase()) ||
    v.brand.toLowerCase().includes(search.toLowerCase()) ||
    v.model.toLowerCase().includes(search.toLowerCase()) ||
    (v.clients?.name && v.clients.name.toLowerCase().includes(search.toLowerCase()))
  )

  async function saveVehicle() {
    if (!form.plate_number || !form.brand || !form.model || (!editingId && !form.client_id)) return
    const payload: any = {
      plate_number: form.plate_number.toUpperCase().trim(),
      brand: form.brand,
      model: form.model,
      year: form.year ? Number(form.year) : null,
      color: form.color || null,
      vin: form.vin ? form.vin.toUpperCase().trim() : null,
      size_class: form.size_class || 'berline',
      business_id: businessId,
    }
    if (form.client_id) {
      payload.client_id = form.client_id
    }

    if (editingId) {
      const { data, error } = await (supabase.from('vehicles') as any).update(payload).eq('id', editingId).select('*, clients(name, phone)').single()
      if (data) {
        setVehicles(vehicles.map(v => v.id === editingId ? data : v))
      } else if (error) {
        alert('Erreur: ' + error.message)
        return
      }
    } else {
      const { data, error } = await (supabase.from('vehicles') as any).insert(payload).select('*, clients(name, phone)').single()
      if (data) {
        setVehicles([data, ...vehicles])
      } else if (error) {
        alert('Erreur: ' + error.message)
        return
      }
    }
    setForm({})
    setEditingId(null)
    setIsOpen(false)
    router.refresh()
  }

  async function openQuickQuote(v: Vehicle) {
    setQuoteVehicle(v)
    const { data: svcs } = await supabase.from('services').select('*').eq('business_id', businessId).eq('is_active', true)
    setQuoteServices(svcs || [])
    setQuoteLines([])
    setQuoteSuccessMsg('')
    setQuoteOpen(true)
  }

  function addServiceToQuote() {
    const svc = quoteServices.find(s => s.id === selectedServiceId)
    if (!svc) return
    const sizeClass = quoteVehicle?.size_class || 'berline'
    const pricingMatrix = svc.pricing_by_size || {}
    const classPrice = pricingMatrix[sizeClass]?.price ?? svc.price
    const classDuration = pricingMatrix[sizeClass]?.duration_min ?? svc.duration_min

    setQuoteLines([...quoteLines, {
      service_id: svc.id,
      description: `${svc.name} (${sizeClass.toUpperCase()}) - ${classDuration} min`,
      quantity: 1,
      unit_price: classPrice,
      total_price: classPrice,
      material_estimated_m: pricingMatrix[sizeClass]?.material_m ?? 2.5
    }])
    setSelectedServiceId('')
  }

  async function createQuoteRecord() {
    if (!quoteVehicle || quoteLines.length === 0) return
    const totalAmount = quoteLines.reduce((acc, l) => acc + l.total_price, 0)
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + 30)

    const { data: quote, error } = await (supabase.from('quotes') as any).insert({
      business_id: businessId,
      client_id: quoteVehicle.client_id,
      vehicle_id: quoteVehicle.id,
      status: 'envoye',
      valid_until: validUntil.toISOString().split('T')[0],
      total_amount: totalAmount,
    }).select('id').single()

    if (error || !quote) {
      alert('Erreur création devis: ' + error?.message)
      return
    }

    const linesPayload = quoteLines.map(l => ({
      quote_id: quote.id,
      service_id: l.service_id,
      description: l.description,
      quantity: l.quantity,
      unit_price: l.unit_price,
      total_price: l.total_price,
      material_estimated_m: l.material_estimated_m,
    }))

    await (supabase.from('quote_lines') as any).insert(linesPayload)
    setQuoteSuccessMsg(`Devis # ${quote.id.substring(0, 8).toUpperCase()} créé avec succès (Total: ${totalAmount} €) !`)
    setTimeout(() => {
      setQuoteOpen(false)
      router.push('/quotes')
    }, 1500)
  }

  return (
    <>
      <Header
        title="Véhicules & Grille Tarifaire par Classe"
        actions={
          <div className="flex gap-2">
            <Button size="sm" onClick={() => { setForm({ size_class: 'berline' }); setEditingId(null); setIsOpen(true) }}>
              <Plus className="w-4 h-4 mr-1" /> Ajouter un véhicule
            </Button>
          </div>
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
                <input type="text" value={form.plate_number || ''} onChange={e => setForm(f => ({ ...f, plate_number: e.target.value.toUpperCase() }))} placeholder="AB-123-CD" className="w-full mt-1 border rounded-lg px-3 py-2 text-sm uppercase bg-white" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Classe de Taille</label>
                <select value={form.size_class || 'berline'} onChange={e => setForm(f => ({ ...f, size_class: e.target.value as any }))} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="citadine">Citadine (Mini / Smart)</option>
                  <option value="berline">Berline / Coupé</option>
                  <option value="suv">SUV / 4x4 / Break</option>
                  <option value="utilitaire">Utilitaire / Van</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Marque</label>
                <input type="text" value={form.brand || ''} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="Porsche" className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Modèle</label>
                <input type="text" value={form.model || ''} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="911 GT3 RS" className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Année</label>
                <input type="number" value={form.year || ''} onChange={e => setForm(f => ({ ...f, year: e.target.value ? Number(e.target.value) : null }))} placeholder="2024" className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Couleur</label>
                <input type="text" value={form.color || ''} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} placeholder="Gris Nardo" className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-white" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-gray-500">Numéro de Châssis (VIN)</label>
                <input type="text" value={form.vin || ''} onChange={e => setForm(f => ({ ...f, vin: e.target.value.toUpperCase() }))} placeholder="WP0ZZZ99ZTS..." className="w-full mt-1 border rounded-lg px-3 py-2 text-sm uppercase bg-white font-mono" />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
              <Button onClick={saveVehicle}>Enregistrer</Button>
            </div>
          </div>
        )}

        {/* Quick Quote Modal (< 2 mins target) */}
        {quoteOpen && quoteVehicle && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-950">Devis Rapide & Personnalisé</h3>
                  <p className="text-xs text-gray-500">Véhicule : {quoteVehicle.brand} {quoteVehicle.model} ({quoteVehicle.plate_number}) • Classe : <strong className="uppercase text-blue-600">{quoteVehicle.size_class}</strong></p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setQuoteOpen(false)}>Fermer</Button>
              </div>

              {quoteSuccessMsg ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-green-600" />
                  <p className="font-semibold text-gray-900">{quoteSuccessMsg}</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <select value={selectedServiceId} onChange={e => setSelectedServiceId(e.target.value)} className="flex-1 border rounded-lg p-2 text-sm bg-white">
                        <option value="">Sélectionner une prestation du catalogue</option>
                        {quoteServices.map(s => <option key={s.id} value={s.id}>{s.name} ({s.price} €)</option>)}
                      </select>
                      <Button onClick={addServiceToQuote}>Ajouter</Button>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                          <tr>
                            <th className="text-left px-3 py-2">Prestation</th>
                            <th className="text-right px-3 py-2">Métrage Est.</th>
                            <th className="text-right px-3 py-2">Prix</th>
                            <th className="px-3 py-2" />
                          </tr>
                        </thead>
                        <tbody>
                          {quoteLines.length === 0 ? (
                            <tr><td colSpan={4} className="text-center py-6 text-gray-400 text-xs">Aucune prestation ajoutée au devis</td></tr>
                          ) : (
                            quoteLines.map((l, i) => (
                              <tr key={i} className="border-t">
                                <td className="px-3 py-2 font-medium">{l.description}</td>
                                <td className="px-3 py-2 text-right text-gray-600">{l.material_estimated_m} m</td>
                                <td className="px-3 py-2 text-right font-semibold">{l.total_price} €</td>
                                <td className="px-3 py-2 text-right">
                                  <button onClick={() => setQuoteLines(quoteLines.filter((_, idx) => idx !== i))} className="text-red-500 text-xs hover:underline">Supprimer</button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="font-bold text-gray-900">Total : {quoteLines.reduce((a, b) => a + b.total_price, 0)} € TTC</span>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setQuoteOpen(false)}>Annuler</Button>
                      <Button onClick={createQuoteRecord} disabled={quoteLines.length === 0}>Créer & Envoyer le Devis</Button>
                    </div>
                  </div>
                </>
              )}
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
                  <th className="text-left px-4 py-3 font-medium">Véhicule & Taille</th>
                  <th className="text-left px-4 py-3 font-medium">Propriétaire</th>
                  <th className="text-left px-4 py-3 font-medium">Couleur</th>
                  <th className="text-left px-4 py-3 font-medium">Actions Phase 1</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map(v => (
                  <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-0">
                    <td className="px-4 py-3 font-bold text-gray-900 font-mono uppercase">{v.plate_number}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {v.brand} {v.model} <span className="text-gray-400 font-normal">({v.year || '—'})</span>
                      <div className="mt-0.5">
                        <span className="inline-flex items-center text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded px-1.5 py-0.5 uppercase">
                          {v.size_class || 'berline'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{v.clients?.name || 'Inconnu'}</td>
                    <td className="px-4 py-3 text-gray-500">{v.color || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Button variant="outline" size="sm" className="text-xs h-7 px-2" onClick={() => openQuickQuote(v)}>
                          <FileText className="w-3 h-3 mr-1 text-purple-600" /> Devis Express (&lt;2 min)
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { setForm(v); setEditingId(v.id); setIsOpen(true) }} className="p-1.5 hover:bg-gray-100 rounded mr-1" title="Modifier"><Pencil className="w-4 h-4 text-gray-500" /></button>
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
