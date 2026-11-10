'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Activity, ShieldCheck, User, Calendar, FileText, ArrowRight, Download, Filter } from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  entity_type: string
  entity_id: string | null
  actor_type: string
  actor_label: string
  old_values: Record<string, any> | null
  new_values: Record<string, any> | null
  created_at: string
  user_id: string | null
}

export function AuditSection({ businessId }: { businessId: string }) {
  const supabase = createClient()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterAction, setFilterAction] = useState<string>('all')

  useEffect(() => {
    async function loadLogs() {
      setLoading(true)
      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(100)

      if (filterType !== 'all') {
        query = query.eq('entity_type', filterType)
      }
      if (filterAction !== 'all') {
        query = query.eq('action', filterAction)
      }

      const { data } = await query
      if (data) {
        setLogs(data)
      }
      setLoading(false)
    }
    loadLogs()
  }, [businessId, filterType, filterAction, supabase])

  function exportCSV() {
    const headers = ['ID', 'Date', 'Type', 'Action', 'Acteur', 'ID Entité', 'Anciennes valeurs', 'Nouvelles valeurs']
    const rows = logs.map(l => [
      l.id,
      l.created_at,
      l.entity_type,
      l.action,
      l.actor_label,
      l.entity_id || '',
      JSON.stringify(l.old_values || {}),
      JSON.stringify(l.new_values || {})
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `journal_activite_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function formatActionLabel(action: string) {
    switch (action) {
      case 'created': return 'Création'
      case 'updated': return 'Modification'
      case 'moved': return 'Déplacement (Créneau / Poste)'
      case 'status_changed': return 'Changement de statut'
      case 'cancelled': return 'Annulation'
      case 'employee_changed': return 'Changement d’employé'
      case 'public_booking_received': return 'Réservation publique en ligne'
      case 'deposit_paid': return 'Acompte payé'
      case 'deposit_expired': return 'Acompte expiré'
      default: return action
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Journal d&apos;activité (Audit Logs & Événements)</h2>
              <p className="text-sm text-gray-500">Traçabilité complète inaltérable : créations, déplacements, statuts, acomptes et réservations.</p>
            </div>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4" /> Exporter CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Filter className="w-3.5 h-3.5" /> Filtrer par :
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs border rounded-lg px-3 py-1.5 bg-white font-medium"
          >
            <option value="all">Toutes les entités</option>
            <option value="appointment">Rendez-vous</option>
            <option value="client">Client</option>
            <option value="job">Chantier</option>
          </select>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="text-xs border rounded-lg px-3 py-1.5 bg-white font-medium"
          >
            <option value="all">Toutes les actions</option>
            <option value="created">Création</option>
            <option value="moved">Déplacement</option>
            <option value="status_changed">Statut</option>
            <option value="cancelled">Annulation</option>
            <option value="public_booking_received">Réservation publique</option>
            <option value="deposit_paid">Acompte payé</option>
          </select>
        </div>

        <div>
          {loading ? (
            <div className="py-12 text-center text-sm text-gray-400">Chargement du journal...</div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center">
              <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Aucun événement enregistré pour ces critères.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {logs.map((log) => {
                const time = new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                const date = new Date(log.created_at).toLocaleDateString()
                return (
                  <div key={log.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">{log.actor_label}</span>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium">
                            {formatActionLabel(log.action)}
                          </span>
                          <span className="text-xs text-gray-400 uppercase font-mono">
                            [{log.entity_type}]
                          </span>
                        </div>
                        {log.old_values || log.new_values ? (
                          <div className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded-lg space-y-1 max-w-xl overflow-x-auto">
                            {log.old_values && Object.keys(log.old_values).length > 0 && (
                              <div><span className="text-red-500 font-semibold">Ancien :</span> {JSON.stringify(log.old_values)}</div>
                            )}
                            {log.new_values && Object.keys(log.new_values).length > 0 && (
                              <div><span className="text-emerald-600 font-semibold">Nouveau :</span> {JSON.stringify(log.new_values)}</div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-semibold text-gray-900">{time}</span>
                      <p className="text-[11px] text-gray-400">{date}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
