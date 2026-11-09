'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { CalendarDays, Layers, Clock, User, Car, CheckCircle2, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function PlanningClient({ workstations, appointments }: { workstations: any[]; appointments: any[] }) {
  const router = useRouter()
  const [items, setItems] = useState(appointments)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleAssignWorkstation(appointmentId: string, workstationId: string) {
    setLoadingId(appointmentId)
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workstation_id: workstationId || null })
      })
      if (res.ok) {
        const updated = await res.json()
        setItems(items.map(a => a.id === appointmentId ? { ...a, workstation_id: updated.workstation_id } : a))
        router.refresh()
      } else {
        const err = await res.json()
        alert('Erreur: ' + (err.error || 'Impossible d\'assigner'))
      }
    } finally {
      setLoadingId(null)
    }
  }

  async function handleUpdateDuration(appointmentId: string, durationDays: number) {
    setLoadingId(appointmentId)
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration_days: durationDays })
      })
      if (res.ok) {
        const updated = await res.json()
        setItems(items.map(a => a.id === appointmentId ? { ...a, duration_days: updated.duration_days } : a))
        router.refresh()
      }
    } finally {
      setLoadingId(null)
    }
  }

  const unassignedAppointments = items.filter(a => !a.workstation_id)

  return (
    <>
      <Header
        title="Planning Postes et Multi-jours"
        actions={
          <div className="text-xs text-gray-500 font-medium">
            {items.length} rendez-vous au total ({unassignedAppointments.length} non assignés)
          </div>
        }
      />
      <main className="p-6 space-y-6">
        {/* Unassigned Appointments Quick Bar */}
        {unassignedAppointments.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-amber-600" /> Rendez-vous en attente d&apos;affectation à un poste ({unassignedAppointments.length})
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {unassignedAppointments.map((a: any) => (
                <div key={a.id} className="bg-white p-3 rounded-lg border border-amber-200 shadow-sm space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-900">{a.clients?.name || 'Client'}</span>
                    <span className="text-gray-500">{new Date(a.starts_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-gray-600 font-medium">
                    {a.services?.name || 'Prestation'} • {a.price || 0} €
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t">
                    <span className="text-[11px] text-gray-500 font-medium">Poste :</span>
                    <select
                      disabled={loadingId === a.id}
                      defaultValue=""
                      onChange={(e) => handleAssignWorkstation(a.id, e.target.value)}
                      className="flex-1 text-xs border rounded px-2 py-1 bg-white font-medium focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="" disabled>Choisir un poste...</option>
                      {workstations.map((w: any) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Agenda par poste technique</h2>
              <p className="text-xs text-gray-500 mt-0.5">Suivi des interventions et occupation des cabines / ponts (incluant multi-jours).</p>
            </div>
          </div>

          {workstations.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <Layers className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <div className="font-medium text-gray-900">Aucun poste configuré</div>
              <p className="text-xs text-gray-400 mt-1">Rendez-vous dans la section Postes de Travail pour en ajouter.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workstations.map((w: any) => {
                const wsAppointments = items.filter((a: any) => a.workstation_id === w.id)
                return (
                  <div key={w.id} className="border rounded-xl bg-gray-50/50 overflow-hidden flex flex-col shadow-sm">
                    <div className="bg-blue-600 text-white p-4 font-semibold text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Layers className="w-4 h-4" /> {w.name}
                      </span>
                      <span className="text-xs bg-blue-700/80 px-2 py-0.5 rounded-full font-medium">
                        {wsAppointments.length} RDV
                      </span>
                    </div>
                    <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
                      {wsAppointments.length === 0 ? (
                        <div className="text-xs text-gray-400 text-center py-12">Aucun rendez-vous sur ce poste</div>
                      ) : (
                        wsAppointments.map((a: any) => (
                          <div key={a.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3 hover:border-blue-200 transition-all">
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-bold text-blue-600 uppercase">
                                {a.clients?.name || 'Client'}
                              </span>
                              <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full uppercase">
                                {a.status}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                                  <span>{new Date(a.starts_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                                  {new Date(a.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t">
                                <span className="text-gray-500">Durée (jours) :</span>
                                <select
                                  value={a.duration_days || 1}
                                  onChange={(e) => handleUpdateDuration(a.id, Number(e.target.value))}
                                  className="text-xs border rounded px-2 py-0.5 bg-white font-semibold"
                                >
                                  <option value={1}>1 jour</option>
                                  <option value={2}>2 jours</option>
                                  <option value={3}>3 jours</option>
                                  <option value={5}>5 jours</option>
                                  <option value={7}>1 semaine</option>
                                </select>
                              </div>

                              {a.services?.name && (
                                <div className="font-medium text-gray-900 pt-2 border-t flex justify-between items-center">
                                  <span>{a.services.name}</span>
                                  <span className="font-bold text-gray-900">{a.price} €</span>
                                </div>
                              )}

                              <div className="pt-2 border-t flex items-center justify-between">
                                <span className="text-[11px] text-gray-400">Changer de poste :</span>
                                <select
                                  disabled={loadingId === a.id}
                                  value={a.workstation_id || ''}
                                  onChange={(e) => handleAssignWorkstation(a.id, e.target.value)}
                                  className="text-[11px] border rounded px-2 py-1 bg-white font-medium"
                                >
                                  {workstations.map((wk: any) => (
                                    <option key={wk.id} value={wk.id}>{wk.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

