'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { FileText, Plus, Send, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Called by `app/(dashboard)/quotes/page.tsx`.
// No existing file handles client-side quotes list and email sending interaction.
// Reads/writes quote data and invokes /api/quotes/send-email.
// User instruction: "oui, ajoute le bouton pour envoyer par email"

export function QuotesClient({ initialQuotes }: { initialQuotes: any[] }) {
  const [quotes, setQuotes] = useState(initialQuotes)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  async function handleSendEmail(quoteId: string) {
    setSendingId(quoteId)
    setMessage('')
    try {
      const res = await fetch('/api/quotes/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId })
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('Devis envoyé par e-mail avec succès !')
      } else {
        alert('Erreur: ' + (data.error || 'Impossible d\'envoyer l\'email'))
      }
    } catch (err: any) {
      alert('Erreur réseau: ' + err.message)
    } finally {
      setSendingId(null)
    }
  }

  return (
    <>
      <Header
        title="Devis & Chiffrage Express"
        actions={
          <Link href="/vehicles">
            <button className="inline-flex items-center justify-center rounded-lg bg-green-600 text-white px-3 py-2 text-sm font-medium hover:bg-green-700 transition-colors">
              <Plus className="w-4 h-4 mr-1.5" /> Créer un devis (via Véhicules)
            </button>
          </Link>
        }
      />
      <main className="p-6 space-y-6">
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {!quotes || quotes.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <FileText className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <div className="font-medium text-gray-900">Aucun devis enregistré</div>
              <p className="text-xs text-gray-400 mt-1">Rendez-vous dans la section Véhicules pour générer un devis express en moins de 2 minutes.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
                  <th className="text-left px-4 py-3 font-medium">Référence</th>
                  <th className="text-left px-4 py-3 font-medium">Client / Véhicule</th>
                  <th className="text-left px-4 py-3 font-medium">Statut</th>
                  <th className="text-left px-4 py-3 font-medium">Validité</th>
                  <th className="text-right px-4 py-3 font-medium">Total TTC</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q: any) => (
                  <tr key={q.id} className="border-b hover:bg-gray-50 transition-colors last:border-0">
                    <td className="px-4 py-3 font-mono font-bold text-gray-900">
                      #{q.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{q.clients?.name || 'Client inconnu'}</div>
                      <div className="text-xs text-gray-500">
                        {q.vehicles ? `${q.vehicles.brand} ${q.vehicles.model} (${q.vehicles.plate_number})` : 'Aucun véhicule'}
                        {q.clients?.email ? ` • ${q.clients.email}` : ' • (Pas d\'e-mail)'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                        {q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {q.valid_until ? new Date(q.valid_until).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                      {q.total_amount} €
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 px-2.5"
                        disabled={sendingId === q.id || !q.clients?.email}
                        onClick={() => handleSendEmail(q.id)}
                      >
                        <Send className="w-3 h-3 mr-1.5 text-blue-600" />
                        {sendingId === q.id ? 'Envoi...' : 'Envoyer par e-mail'}
                      </Button>
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
