'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Activity, ShieldCheck, User } from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Record<string, any>
  created_at: string
  users?: { email?: string } | null
}

export function AuditSection({ businessId }: { businessId: string }) {
  const supabase = createClient()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLogs() {
      setLoading(true)
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(50)
      if (data) setLogs(data)
      setLoading(false)
    }
    loadLogs()
  }, [businessId, supabase])

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Journal d&apos;activité (Audit Logs)</h2>
            <p className="text-sm text-gray-500">Historique complet des actions professionnelles, modifications et événements de sécurité.</p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          {loading ? (
            <div className="py-10 text-center text-sm text-gray-400">Chargement du journal...</div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center">
              <ShieldCheck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Aucun journal d&apos;activité enregistré pour le moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {logs.map((log) => {
                const time = new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                const date = new Date(log.created_at).toLocaleDateString()
                return (
                  <div key={log.id} className="py-3.5 flex items-start justify-between gap-4 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">
                          Action <span className="font-mono text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{log.action}</span> sur <span className="text-gray-700">{log.entity_type}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {log.metadata?.description || `Entité ID: ${log.entity_id ?? 'N/A'}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-semibold text-gray-900">{time}</span>
                      <p className="text-[10px] text-gray-400">{date}</p>
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
