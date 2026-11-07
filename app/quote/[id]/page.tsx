'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { FileText, CheckCircle2, XCircle, Building2, User, Calendar, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Public quote view page for clients to review and accept/refuse with timestamping.
// No existing file serves public quote acceptance.
// Reads/writes public.quotes via /api/quotes/[id].
// User instruction: "Devis : tables quotes et quote_lines, statuts (brouillon, envoyé, accepté, refusé, expiré), durée de validité, PDF, lien public d’acceptation avec horodatage. Conversion devis → rendez-vous."

export default function PublicQuotePage() {
  const params = useParams()
  const id = params.id as string
  const [quote, setQuote] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!id) return
    fetch(`/api/quotes/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Devis introuvable')
        return res.json()
      })
      .then(data => {
        setQuote(data)
        setLoading(false)
      })
      .catch(err => {
        setErrorMsg(err.message)
        setLoading(false)
      })
  }, [id])

  async function handleAction(action: 'accept' | 'refuse') {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/quotes/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      const data = await res.json()
      if (res.ok) {
        setQuote((q: any) => ({ ...q, status: data.status, accepted_at: data.accepted_at }))
      } else {
        alert('Erreur: ' + (data.error || 'Action impossible'))
      }
    } catch (err: any) {
      alert('Erreur réseau: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Chargement du devis...</div>
  }

  if (errorMsg || !quote) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <XCircle className="w-12 h-12 text-red-500 mb-2" />
        <h1 className="text-xl font-bold text-gray-900">Devis introuvable</h1>
        <p className="text-sm text-gray-500 mt-1">Ce lien de devis est invalide ou a expiré.</p>
      </div>
    )
  }

  const isAccepted = quote.status === 'accepte'
  const isRefused = quote.status === 'refuse'

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden p-8 space-y-8">
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-6">
            <div>
              <div className="text-xs font-semibold tracking-wider text-blue-600 uppercase">Devis Professionnel</div>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">Devis #{quote.id.substring(0, 8).toUpperCase()}</h1>
              <p className="text-xs text-gray-500 mt-1">Émis le {new Date(quote.created_at).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg text-gray-900">{quote.businesses?.name || 'BookingPro'}</div>
              <div className="text-xs text-gray-500 max-w-[200px]">{quote.businesses?.address}</div>
            </div>
          </div>

          {/* Client & Validity */}
          <div className="grid sm:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl text-sm">
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase">Client</div>
              <div className="font-semibold text-gray-900 mt-1 flex items-center gap-1.5">
                <User className="w-4 h-4 text-gray-500" /> {quote.clients?.name}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{quote.clients?.email} • {quote.clients?.phone || 'Sans tél'}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase">Validité & Statut</div>
              <div className="font-semibold text-gray-900 mt-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-500" /> Valide jusqu&apos;au {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : '—'}
              </div>
              <div className="mt-1">
                <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase ${isAccepted ? 'bg-green-100 text-green-800' : isRefused ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                  Statut : {quote.status}
                </span>
              </div>
            </div>
          </div>

          {/* Lines Table */}
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
                <tr>
                  <th className="text-left px-4 py-3">Prestation / Description</th>
                  <th className="text-center px-4 py-3">Quantité</th>
                  <th className="text-right px-4 py-3">Prix Unitaire</th>
                  <th className="text-right px-4 py-3">Total TTC</th>
                </tr>
              </thead>
              <tbody>
                {quote.quote_lines?.map((l: any, idx: number) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium text-gray-900">{l.description}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{l.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{l.unit_price} €</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{l.total_price} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="flex justify-end items-center border-t pt-4">
            <div className="text-right">
              <div className="text-xs text-gray-500 uppercase font-medium">Montant Total TTC</div>
              <div className="text-2xl font-bold text-gray-900 mt-0.5">{quote.total_amount} €</div>
            </div>
          </div>

          {/* Acceptance Box with Timestamp */}
          {isAccepted ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
              <div className="font-bold text-green-900 text-lg">Devis Accepté avec succès !</div>
              <p className="text-xs text-green-700">
                Horodatage officiel : {quote.accepted_at ? new Date(quote.accepted_at).toLocaleString() : '—'}
              </p>
            </div>
          ) : isRefused ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-2">
              <XCircle className="w-10 h-10 text-red-600 mx-auto" />
              <div className="font-bold text-red-900 text-lg">Devis refusé</div>
              <p className="text-xs text-red-700">Vous avez refusé ce devis.</p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="font-bold text-blue-900">Validation en ligne</div>
                <p className="text-xs text-blue-700 mt-0.5">En acceptant ce devis, vous validez les prestations ci-dessus.</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <Button variant="outline" onClick={() => handleAction('refuse')} disabled={submitting} className="border-red-200 text-red-600 hover:bg-red-50">
                  Refuser
                </Button>
                <Button onClick={() => handleAction('accept')} disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white">
                  {submitting ? 'Validation...' : 'Accepter le devis'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
