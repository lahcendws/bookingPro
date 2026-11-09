'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Wrench, Plus, CheckCircle, Clock, ShieldCheck, Car, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export function JobsClient({ initialJobs, clients, vehicles }: { initialJobs: any[]; clients: any[]; vehicles: any[] }) {
  const [jobs, setJobs] = useState(initialJobs)
  const [showNewModal, setShowNewModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const filteredVehicles = vehicles.filter((v: any) => !selectedClient || String(v.client_id) === String(selectedClient))
  const availableVehicles = filteredVehicles.length > 0 ? filteredVehicles : vehicles

  async function handleCreateJob(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedClient || !selectedVehicle) return

    setLoading(true)
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: selectedClient,
          vehicle_id: selectedVehicle,
          status: 'reception',
          notes
        })
      })

      if (res.ok) {
        const data = await res.json()
        setJobs([data.job, ...jobs])
        setShowNewModal(false)
        setSelectedClient('')
        setSelectedVehicle('')
        setNotes('')
        window.location.reload()
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })

    if (res.ok) {
      const data = await res.json()
      setJobs(jobs.map((j: any) => j.id === id ? { ...j, status: data.job.status } : j))
    }
  }

  const statuses = [
    { key: 'reception', label: 'Réception', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { key: 'en_cours', label: 'En cours', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { key: 'controle', label: 'Contrôle', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { key: 'livre', label: 'Livré', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  ]

  return (
    <>
      <Header
        title="Gestion des Chantiers"
        actions={
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Nouveau Chantier
          </button>
        }
      />
      <main className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statuses.map((st) => {
            const colJobs = jobs.filter((j: any) => j.status === st.key)
            return (
              <div key={st.key} className="bg-gray-50 rounded-2xl border border-gray-200 p-4 flex flex-col space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${st.color}`}>
                    {st.label} ({colJobs.length})
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px]">
                  {colJobs.length === 0 ? (
                    <div className="text-center py-12 text-xs text-gray-400">Aucun chantier</div>
                  ) : (
                    colJobs.map((j: any) => (
                      <div key={j.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-gray-900">{j.clients?.name || 'Client'}</span>
                          <Link
                            href={`/track/${j.tracking_token}`}
                            target="_blank"
                            className="text-gray-400 hover:text-blue-600"
                            title="Lien client"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                        <div className="text-xs text-gray-600 flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-medium text-gray-800">{j.vehicles?.brand} {j.vehicles?.model} ({j.vehicles?.plate_number || j.vehicles?.plate})</span>
                        </div>
                        {j.notes && <p className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded">{j.notes}</p>}

                        <div className="pt-2 border-t flex justify-between items-center text-xs">
                          <Link
                            href={`/jobs/${j.id}`}
                            className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
                          >
                            <Wrench className="w-3.5 h-3.5" /> État des lieux
                          </Link>
                          <select
                            value={j.status}
                            onChange={(e) => updateStatus(j.id, e.target.value)}
                            className="text-xs border rounded px-2 py-1 bg-white font-medium"
                          >
                            <option value="reception">Réception</option>
                            <option value="en_cours">En cours</option>
                            <option value="controle">Contrôle</option>
                            <option value="livre">Livré</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {showNewModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-xl">
              <h3 className="text-lg font-bold text-gray-900">Nouveau Chantier</h3>
              <form onSubmit={handleCreateJob} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Client</label>
                  <select
                    value={selectedClient}
                    onChange={(e) => {
                      setSelectedClient(e.target.value)
                      setSelectedVehicle('')
                    }}
                    required
                    className="w-full text-xs border rounded-xl p-2.5 bg-white"
                  >
                    <option value="">Sélectionner un client...</option>
                    {clients.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Véhicule</label>
                  <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    required
                    className="w-full text-xs border rounded-xl p-2.5 bg-white"
                  >
                    <option value="">Sélectionner un véhicule...</option>
                    {availableVehicles.map((v: any) => (
                      <option key={v.id} value={v.id}>
                        {v.brand} {v.model} ({v.plate_number || v.plate})
                      </option>
                    ))}
                  </select>
                  {selectedClient && filteredVehicles.length === 0 && vehicles.length > 0 && (
                    <p className="text-[11px] text-amber-600 mt-1">Note : Aucun véhicule directement lié à ce client n&apos;a été trouvé. Affichage de tous les véhicules du garage.</p>
                  )}
                  {selectedClient && vehicles.length === 0 && (
                    <p className="text-[11px] text-amber-600 mt-1">Ce client n&apos;a aucun véhicule enregistré. Veuillez d&apos;abord lui ajouter un véhicule dans le Garage.</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Notes / Instructions</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full text-xs border rounded-xl p-2.5"
                    placeholder="Instructions particulières..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-750"
                  >
                    Créer le chantier
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
