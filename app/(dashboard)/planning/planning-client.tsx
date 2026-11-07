'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { CalendarDays, Layers, Clock, User, Car, CheckCircle2 } from 'lucide-react'

export function PlanningClient({ workstations, appointments }: { workstations: any[]; appointments: any[] }) {
  const [items, setItems] = useState(appointments)

  return (
    <>
      <Header
        title="Planning Postes & Multi-jours"
        actions={
          <div className="text-xs text-gray-500">
            Vue d'ensemble par poste de travail
          </div>
        }
      />
      <main className="p-6 space-y-6 max-w-7xl mx-auto">
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
                          <div key={a.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2 hover:border-blue-200 transition-all">
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-bold text-blue-600 uppercase">
                                {a.clients?.name || 'Client'}
                              </span>
                              <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full uppercase">
                                {a.status}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                                <span>{new Date(a.starts_at).toLocaleDateString()}</span>
                                <span className="text-gray-400">•</span>
                                <span className="font-semibold text-gray-700">{a.duration_days} jour{a.duration_days > 1 ? 's' : ''}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                {new Date(a.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              {a.services?.name && (
                                <div className="font-medium text-gray-900 mt-2 pt-2 border-t flex justify-between items-center">
                                  <span>{a.services.name}</span>
                                  <span className="font-bold text-gray-900">{a.price} €</span>
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
