'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { CalendarDays, Layers, Clock, User, Car, CheckCircle2 } from 'lucide-react'

export function PlanningClient({ workstations, appointments }: { workstations: any[]; appointments: any[] }) {
  const [items, setItems] = useState(appointments)

  return (
    <>
      <Header title="Planning par Poste de Travail" />
      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Vue Agenda multi-postes</h2>
              <p className="text-xs text-gray-500 mt-0.5">Suivi des rendez-vous par poste et gestion des durées multi-jours.</p>
            </div>
          </div>

          {workstations.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              Aucun poste de travail configuré. Veuillez en créer un dans la section Postes.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workstations.map((w: any) => {
                const wsAppointments = items.filter((a: any) => a.workstation_id === w.id)
                return (
                  <div key={w.id} className="border rounded-xl bg-gray-50 overflow-hidden flex flex-col">
                    <div className="bg-blue-600 text-white p-4 font-semibold text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Layers className="w-4 h-4" /> {w.name}
                      </span>
                      <span className="text-xs bg-blue-700 px-2 py-0.5 rounded-full">
                        {wsAppointments.length} RDV
                      </span>
                    </div>
                    <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
                      {wsAppointments.length === 0 ? (
                        <div className="text-xs text-gray-400 text-center py-8">Aucun rendez-vous sur ce poste</div>
                      ) : (
                        wsAppointments.map((a: any) => (
                          <div key={a.id} className="bg-white p-3.5 rounded-lg border shadow-sm space-y-2">
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-bold text-blue-600 uppercase">
                                {a.clients?.name || 'Client'}
                              </span>
                              <span className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full uppercase">
                                {a.status}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div className="flex items-center gap-1.5">
                                <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                                {new Date(a.starts_at).toLocaleDateString()} ({a.duration_days} jour{a.duration_days > 1 ? 's' : ''})
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                {new Date(a.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              {a.services?.name && (
                                <div className="font-medium text-gray-900 mt-1">
                                  {a.services.name} ({a.price} €)
                                </div>
                              )}
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
