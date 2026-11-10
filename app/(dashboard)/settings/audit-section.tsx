'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Activity, ShieldCheck, User, Calendar, Download, Filter,
  ArrowRight, CheckCircle2, XCircle, Clock, Globe, CreditCard,
  MapPin, RefreshCw, ChevronDown, ChevronUp, Search, Eye
} from 'lucide-react'

export type AuditRow = {
  id: string
  action: string
  entity_type: 'appointment' | 'client' | 'job' | string
  entity_id: string | null
  actor_type: 'user' | 'client' | 'system'
  actor_label: string
  old_values: Record<string, any> | null
  new_values: Record<string, any> | null
  metadata: Record<string, any> | null
  created_at: string
  user_id: string | null
}

const STATUS: Record<string, string> = {
  pending: 'En attente', confirmed: 'Confirmé', in_progress: 'En cours',
  completed: 'Terminé', cancelled: 'Annulé', no_show: 'Absent',
  reception: 'Réception', en_cours: 'En cours', controle: 'Contrôle', livre: 'Livré'
}
const NOUN: Record<string, string> = { appointment: 'Rendez-vous', client: 'Client', job: 'Chantier' }

// 'APPOINTMENT_UPDATED' (anciennes lignes) -> 'updated'
const norm = (a: string) => (a || '').toLowerCase().replace(/^(appointment|client|job)_/, '')

const when = (iso?: string) => iso &&
  new Date(iso).toLocaleString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

const eur = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

export function describe(r: AuditRow) {
  const m = r.metadata ?? {}, o = r.old_values ?? {}, n = r.new_values ?? {}
  const who = r.actor_label || 'Utilisateur'
  const noun = NOUN[r.entity_type] || r.entity_type || 'Élément'
  const target = m.label ? `« ${m.label} »` : `le ${noun.toLowerCase()}`

  switch (norm(r.action)) {
    case 'created':
      return { icon: '➕', title: `${noun} créé`, text: `${who} a créé ${target}` }
    case 'public_booking_received':
      return { icon: '🌐', title: 'Réservation en ligne reçue', text: `${who} · ${m.label ?? ''}` }
    case 'moved': {
      const from = [m.workstation_from, when(o.starts_at)].filter(Boolean).join(', ')
      const to = [m.workstation_to, when(n.starts_at)].filter(Boolean).join(', ')
      return { icon: '🔄', title: 'Rendez-vous déplacé', text: `${who} a déplacé ${target}`,
               detail: `${from || '—'} → ${to || '—'}` }
    }
    case 'status_changed':
      return { icon: '🔁', title: 'Statut modifié',
               text: `${who} a passé ${target} de « ${STATUS[o.status] ?? o.status} » à « ${STATUS[n.status] ?? n.status} »` }
    case 'cancelled':
      return { icon: '❌', title: 'Rendez-vous annulé',
               text: r.actor_type === 'client' ? `${m.client_name ?? 'Le client'} a annulé via le lien client`
                                               : `${who} a annulé ${target}` }
    case 'employee_changed':
      return { icon: '👤', title: 'Employé changé',
               text: `${who} a réaffecté ${target} de ${m.employee_from ?? '—'} à ${m.employee_to ?? '—'}` }
    case 'deposit_paid':
      return { icon: '💰', title: 'Acompte payé',
               text: `Acompte${m.deposit_amount ? ' de ' + eur(Number(m.deposit_amount)) : ''} reçu${m.client_name ? ' (' + m.client_name + ')' : ''}` }
    case 'deposit_expired':
      return { icon: '⏱️', title: 'Acompte expiré', text: 'Acompte non payé : créneau libéré' }
    case 'deleted':
      return { icon: '🗑️', title: `${noun} supprimé`, text: `${who} a supprimé ${target}` }
    default: {
      const fields = Object.keys(n).join(', ')
      return { icon: '✏️', title: `${noun} modifié`,
               text: `${who} a modifié ${target}${fields ? ' (' + fields + ')' : ''}`,
               detail: undefined }
    }
  }
}

export function AuditSection({ businessId }: { businessId: string }) {
  const supabase = createClient()
  const [logs, setLogs] = useState<AuditRow[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [filterType, setFilterType] = useState<string>('all')
  const [filterAction, setFilterAction] = useState<string>('all')
  const [filterActor, setFilterActor] = useState<string>('all')
  const [filterPeriod, setFilterPeriod] = useState<string>('7d')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Expanded rows for JSON diff modal/collapse
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    async function loadLogs() {
      setLoading(true)
      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(200)

      if (filterType !== 'all') {
        query = query.eq('entity_type', filterType)
      }
      if (filterAction !== 'all') {
        if (filterAction === 'status') {
          query = query.in('action', ['status_changed', 'cancelled'])
        } else if (filterAction === 'payment') {
          query = query.in('action', ['deposit_paid', 'deposit_expired'])
        } else {
          query = query.eq('action', filterAction)
        }
      }
      if (filterActor !== 'all') {
        query = query.eq('actor_type', filterActor)
      }

      // Date filtering
      const now = new Date()
      if (filterPeriod === '1d') {
        const d = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        query = query.gte('created_at', d.toISOString())
      } else if (filterPeriod === '7d') {
        const d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        query = query.gte('created_at', d.toISOString())
      } else if (filterPeriod === '30d') {
        const d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        query = query.gte('created_at', d.toISOString())
      }

      const { data } = await query
      if (data) {
        let filtered = data
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          filtered = data.filter(l =>
            l.actor_label.toLowerCase().includes(q) ||
            l.action.toLowerCase().includes(q) ||
            (l.entity_id && l.entity_id.toLowerCase().includes(q)) ||
            JSON.stringify(l.new_values || {}).toLowerCase().includes(q)
          )
        }
        setLogs(filtered)
      }
      setLoading(false)
    }
    loadLogs()
  }, [businessId, filterType, filterAction, filterActor, filterPeriod, searchQuery, supabase])

  function resetFilters() {
    setFilterType('all')
    setFilterAction('all')
    setFilterActor('all')
    setFilterPeriod('7d')
    setSearchQuery('')
  }

  function exportCSV() {
    const headers = ['ID', 'Date', 'Type', 'Action', 'Acteur', 'ID Entité', 'Description', 'Anciennes valeurs', 'Nouvelles valeurs']
    const rows = logs.map(l => {
      const d = describe(l)
      return [
        l.id,
        l.created_at,
        l.entity_type,
        l.action,
        l.actor_label,
        l.entity_id || '',
        `"${d.text.replace(/"/g, '""')}"`,
        JSON.stringify(l.old_values || {}),
        JSON.stringify(l.new_values || {})
      ]
    })
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `journal_activite_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Group logs by date string (full format: ex: lundi 10 novembre 2026)
  const groupedLogs: Record<string, AuditRow[]> = {}
  logs.forEach(l => {
    const dateKey = new Date(l.created_at).toLocaleDateString('fr-FR', { dateStyle: 'full' })
    if (!groupedLogs[dateKey]) groupedLogs[dateKey] = []
    groupedLogs[dateKey].push(l)
  })

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Journal d&apos;activité & Piste d&apos;audit</h2>
              <p className="text-sm text-gray-500">Traçabilité complète en français : actions, acteurs, déplacements et statuts.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">{logs.length} résultat{logs.length > 1 ? 's' : ''}</span>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              <Download className="w-4 h-4" /> Exporter CSV
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <Filter className="w-3.5 h-3.5 text-blue-600" /> Filtres :
            </div>

            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="text-xs border rounded-lg px-3 py-1.5 bg-white font-medium text-gray-700"
            >
              <option value="1d">Dernières 24h</option>
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="all">Tout l&apos;historique</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs border rounded-lg px-3 py-1.5 bg-white font-medium text-gray-700"
            >
              <option value="all">Toutes les entités</option>
              <option value="appointment">Rendez-vous</option>
              <option value="client">Client</option>
              <option value="job">Chantier</option>
            </select>

            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="text-xs border rounded-lg px-3 py-1.5 bg-white font-medium text-gray-700"
            >
              <option value="all">Toutes les actions</option>
              <option value="created">Création</option>
              <option value="moved">Déplacement</option>
              <option value="status">Statut & Annulation</option>
              <option value="payment">Paiements & Acomptes</option>
              <option value="public_booking_received">Réservation en ligne</option>
            </select>

            <select
              value={filterActor}
              onChange={(e) => setFilterActor(e.target.value)}
              className="text-xs border rounded-lg px-3 py-1.5 bg-white font-medium text-gray-700"
            >
              <option value="all">Tous les acteurs</option>
              <option value="user">Utilisateur (Employé/Admin)</option>
              <option value="client">Client</option>
              <option value="system">Système</option>
            </select>

            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher acteur, action, ID..."
                className="w-full text-xs border rounded-lg pl-8 pr-3 py-1.5 bg-white font-medium"
              />
            </div>

            <button
              onClick={resetFilters}
              className="text-xs text-blue-600 font-semibold hover:underline px-2 py-1"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Activity Timeline List */}
        <div>
          {loading ? (
            <div className="py-16 text-center text-sm text-gray-400">Chargement de la piste d&apos;audit...</div>
          ) : Object.keys(groupedLogs).length === 0 ? (
            <div className="py-20 text-center">
              <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Aucun événement ne correspond à vos critères.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedLogs).map(([dateLabel, dayLogs]) => (
                <div key={dateLabel} className="space-y-3">
                  <div className="sticky top-0 bg-white/90 backdrop-blur-sm py-2 border-b border-gray-100 flex items-center justify-between z-10">
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">{dateLabel}</h3>
                    <span className="text-[11px] font-medium text-gray-400">{dayLogs.length} événement{dayLogs.length > 1 ? 's' : ''}</span>
                  </div>

                  <div className="space-y-3 pl-2">
                    {dayLogs.map((log) => {
                      const timeStr = new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      const fullDateStr = new Date(log.created_at).toLocaleString()
                      const desc = describe(log)
                      const isExpanded = expandedId === log.id

                      return (
                        <div key={log.id} className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-sm hover:border-blue-200 transition-all space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0 mt-0.5 text-base">
                                {desc.icon}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-gray-900">{desc.title}</span>
                                  <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                                    [{NOUN[log.entity_type] || log.entity_type || 'Élément'}]
                                  </span>
                                  {log.entity_id && false && (
                                    <span className="text-[10px] text-gray-400 font-mono">
                                      #{log.entity_id.slice(0, 6)}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs font-medium text-gray-800">
                                  {desc.text}
                                </p>
                                {'detail' in desc && desc.detail && (
                                  <p className="text-[11px] text-blue-600 font-semibold bg-blue-50/60 px-2.5 py-1 rounded-md inline-block">
                                    {desc.detail}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right" title={fullDateStr}>
                                <span className="text-xs font-bold text-gray-900">{timeStr}</span>
                              </div>
                              {(log.old_values || log.new_values) && (
                                <button
                                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                                  className="text-gray-400 hover:text-blue-600 p-1 rounded-lg transition-colors"
                                  title="Voir le détail complet (JSON / Diffs)"
                                >
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Collapsible JSON / Diff details */}
                          {isExpanded && (
                            <div className="pt-3 mt-2 border-t border-gray-100 text-xs font-mono bg-gray-50 p-3 rounded-lg space-y-2 text-gray-700">
                              <div className="flex justify-between items-center text-[10px] text-gray-400 border-b pb-1">
                                <span>Acteur: {log.actor_label} ({log.actor_type})</span>
                                <span>Horodatage UTC: {log.created_at}</span>
                              </div>
                              {log.old_values && Object.keys(log.old_values).length > 0 && (
                                <div>
                                  <span className="text-red-600 font-semibold">Anciennes valeurs :</span>
                                  <pre className="mt-1 text-[11px] text-red-700 whitespace-pre-wrap overflow-x-auto bg-red-50/50 p-2 rounded">
                                    {JSON.stringify(log.old_values, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.new_values && Object.keys(log.new_values).length > 0 && (
                                <div>
                                  <span className="text-emerald-700 font-semibold">Nouvelles valeurs :</span>
                                  <pre className="mt-1 text-[11px] text-emerald-800 whitespace-pre-wrap overflow-x-auto bg-emerald-50/50 p-2 rounded">
                                    {JSON.stringify(log.new_values, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
