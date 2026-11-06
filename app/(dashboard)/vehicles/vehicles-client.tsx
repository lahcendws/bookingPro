'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Plus, Search, Pencil, Car, ClipboardCheck, History, FileText } from 'lucide-react'
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

  // Advanced feature modals state
  const [activeTab, setActiveTab] = useState<'list' | 'history' | 'inspection' | 'quote'>('list')
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

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
      vin: form.vin || null,
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
        alert('Erreur lors de la modification: ' + error.message)
        return
      }
    } else {
      const { data, error } = await (supabase.from('vehicles') as any).insert(payload).select('*, clients(name, phone)').single()
      if (data) {
        setVehicles([data, ...vehicles])
      } else if (error) {
        alert('Erreur lors de la création: ' + error.message)
        return
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
        title="Véhicules & Spécialisation PPF / Detailing"
        actions={
          <div className="flex gap-2">
            <Button size="sm" onClick={() => { setForm({}); setEditingId(null); setIsOpen(true) }}>
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
              <div className="sm:col-span-3">
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

        {/* Modal / Section for Advanced Modules */}
        {activeTab !== 'list' && selectedVehicle && (
          <div className="bg-white border-2 border-green-500 rounded-xl p-6 space-y-4 shadow-md">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-950 flex items-center gap-2">
                  <Car className="w-5 h-5 text-green-600" />
                  {selectedVehicle.brand} {selectedVehicle.model} (<span className="uppercase font-mono">{selectedVehicle.plate_number}</span>)
                </h3>
                <p className="text-xs text-gray-500">Client : {selectedVehicle.clients?.name || 'Inconnu'}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setActiveTab('list'); setSelectedVehicle(null) }}>Fermer</Button>
            </div>

            {activeTab === 'history' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-600" /> Historique des poses & interventions detailing
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <div>
                      <span className="font-medium text-gray-900">Pose PPF Face Avant complète (XPEL Ultimate)</span>
                      <p className="text-xs text-gray-500">Lot: LOT-8832-XP • Film 200 microns</p>
                    </div>
                    <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">Terminé (Il y a 3 mois)</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <div>
                      <span className="font-medium text-gray-900">Traitement Céramique Gyeon Quartz 5 ans</span>
                      <p className="text-xs text-gray-500">Application carrosserie + jantes</p>
                    </div>
                    <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">Terminé (Il y a 3 mois)</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'inspection' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-amber-600" /> État des Lieux Avant/Après & Signature Client
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="border p-4 rounded-lg space-y-2">
                    <span className="text-xs font-bold text-gray-700 uppercase">Photos Avant (Réception)</span>
                    <div className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-xs text-gray-400 bg-gray-50">
                      Glisser les photos de contrôle carrosserie (0 impacts / rayures relevées)
                    </div>
                  </div>
                  <div className="border p-4 rounded-lg space-y-2">
                    <span className="text-xs font-bold text-gray-700 uppercase">Photos Après (Restitution)</span>
                    <div className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-xs text-gray-400 bg-gray-50">
                      Photos de pose PPF / Céramique terminée
                    </div>
                  </div>
                </div>
                <div className="border p-4 rounded-lg space-y-2">
                  <span className="text-xs font-bold text-gray-700 uppercase">Signature Numérique du Client</span>
                  <div className="h-24 border bg-gray-50 rounded-lg flex items-center justify-center text-sm text-gray-500 italic">
                    [ Zone de signature tactile / numérique validant l&apos;état du véhicule ]
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'quote' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" /> Devis Rapide & Personnalisé par Véhicule
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-sm">
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">Forfait PPF</label>
                      <select className="w-full mt-1 border rounded p-2 text-sm bg-white">
                        <option>Face Avant (Bouclier + Ailes + Capot)</option>
                        <option>Full Body PPF Intégral</option>
                        <option>Kit Seuil & Bas de caisse</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Traitement Céramique</label>
                      <select className="w-full mt-1 border rounded p-2 text-sm bg-white">
                        <option>Céramique Carrosserie 5 ans</option>
                        <option>Vitres & Pare-brise Hydrofuge</option>
                        <option>Jantes & Étriers</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Remise / Option</label>
                      <input type="text" placeholder="Ex: -10% pack complet" className="w-full mt-1 border rounded p-2 text-sm bg-white" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-bold text-gray-900">Total estimé : 2 450,00 € TTC</span>
                    <Button size="sm">Générer & Envoyer le Devis par Lien</Button>
                  </div>
                </div>
              </div>
            )}
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
                  <th className="text-left px-4 py-3 font-medium">Spécialisation PPF / Detailing</th>
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Button variant="outline" size="sm" className="text-xs h-7 px-2" onClick={() => { setSelectedVehicle(v); setActiveTab('history') }}>
                          <History className="w-3 h-3 mr-1 text-blue-600" /> Historique
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs h-7 px-2" onClick={() => { setSelectedVehicle(v); setActiveTab('inspection') }}>
                          <ClipboardCheck className="w-3 h-3 mr-1 text-amber-600" /> État des Lieux
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs h-7 px-2" onClick={() => { setSelectedVehicle(v); setActiveTab('quote') }}>
                          <FileText className="w-3 h-3 mr-1 text-purple-600" /> Devis PPF
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
