'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Download, CreditCard, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Invoice {
  id: string
  number: string
  type: 'invoice' | 'credit_note'
  status: 'draft' | 'issued' | 'paid' | 'partially_paid' | 'cancelled'
  subtotal: number
  tax_amount: number
  total_amount: number
  deposit_paid: number
  balance_due: number
  due_date: string | null
  issued_at: string | null
  clients: { name: string; phone: string | null } | null
  invoice_lines: any[]
  payments: any[]
}

export function InvoicesClient({ initialInvoices, quotes, clients, businessId }: { initialInvoices: Invoice[]; quotes: any[]; clients: any[]; businessId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [invoices, setInvoices] = useState(initialInvoices)
  const [selectedQuoteId, setSelectedQuoteId] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Convert Quote to Invoice
  async function convertQuoteToInvoice() {
    if (!selectedQuoteId) return
    setLoading(true)
    const quote = quotes.find(q => q.id === selectedQuoteId)
    if (!quote) {
      setLoading(false)
      return
    }

    // Generate gapless number
    const count = invoices.length + 1
    const year = new Date().getFullYear()
    const invNumber = `FAC-${year}-${String(count).padStart(5, '0')}`

    const subtotal = quote.total_amount / 1.2 // Assuming 20% VAT
    const taxAmount = quote.total_amount - subtotal

    const { data: inv, error } = await (supabase.from('invoices') as any).insert({
      business_id: businessId,
      client_id: quote.client_id,
      quote_id: quote.id,
      type: 'invoice',
      number: invNumber,
      status: 'issued',
      subtotal: Number(subtotal.toFixed(2)),
      tax_amount: Number(taxAmount.toFixed(2)),
      total_amount: quote.total_amount,
      deposit_paid: 0,
      balance_due: quote.total_amount,
      issued_at: new Date().toISOString(),
      notes: `Converti depuis le devis #${quote.id.substring(0, 8).toUpperCase()}`
    }).select('*, clients(name, phone), invoice_lines(*), payments(*)').single()

    if (error || !inv) {
      alert('Erreur création facture: ' + error?.message)
      setLoading(false)
      return
    }

    // Copy lines
    if (quote.quote_lines && quote.quote_lines.length > 0) {
      const lines = quote.quote_lines.map((l: any) => ({
        invoice_id: inv.id,
        service_id: l.service_id,
        description: l.description,
        quantity: l.quantity,
        unit_price: l.unit_price,
        tax_rate: 20,
        total_price: l.total_price
      }))
      await (supabase.from('invoice_lines') as any).insert(lines)
    }

    setInvoices([inv, ...invoices])
    setSelectedQuoteId('')
    setIsOpen(false)
    setLoading(false)
    router.refresh()
  }

  // Mark balance paid / record manual payment
  async function markPaid(invoiceId: string, balance: number) {
    const { error } = await (supabase.from('invoices') as any).update({
      status: 'paid',
      balance_due: 0,
      deposit_paid: balance
    }).eq('id', invoiceId)

    if (!error) {
      await (supabase.from('payments') as any).insert({
        invoice_id: invoiceId,
        business_id: businessId,
        amount: balance,
        method: 'card',
        status: 'completed'
      })
      setInvoices(invoices.map(inv => inv.id === invoiceId ? { ...inv, status: 'paid', balance_due: 0, deposit_paid: inv.total_amount } : inv))
      router.refresh()
    }
  }

  // Issue Credit Note (Avoir)
  async function issueCreditNote(inv: Invoice) {
    const count = invoices.length + 1
    const year = new Date().getFullYear()
    const avNumber = `AV-${year}-${String(count).padStart(5, '0')}`

    const { data: credit, error } = await (supabase.from('invoices') as any).insert({
      business_id: businessId,
      client_id: inv.clients ? clients.find(c => c.name === inv.clients?.name)?.id || clients[0]?.id : clients[0]?.id,
      type: 'credit_note',
      number: avNumber,
      status: 'issued',
      subtotal: -inv.subtotal,
      tax_amount: -inv.tax_amount,
      total_amount: -inv.total_amount,
      balance_due: 0,
      issued_at: new Date().toISOString(),
      notes: `Avoir rectificatif sur facture ${inv.number}`
    }).select('*, clients(name, phone), invoice_lines(*), payments(*)').single()

    if (credit && !error) {
      setInvoices([credit, ...invoices])
      router.refresh()
    }
  }

  return (
    <>
      <Header
        title="Factures, Avoirs & Acomptes"
        actions={
          <div className="flex gap-2">
            <a href="/api/invoices/export-csv" target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1.5" /> Export Comptable (CSV)
              </Button>
            </a>
            <Button size="sm" onClick={() => setIsOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Transformer un devis en facture
            </Button>
          </div>
        }
      />
      <main className="p-6 space-y-6">
        {isOpen && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
            <h3 className="font-semibold text-gray-950">Sélectionner un devis accepté à facturer</h3>
            <div className="flex gap-3">
              <select
                value={selectedQuoteId}
                onChange={e => setSelectedQuoteId(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="">Sélectionner un devis</option>
                {quotes.map((q: any) => (
                  <option key={q.id} value={q.id}>
                    Devis #{q.id.substring(0, 8).toUpperCase()} - {q.clients?.name} ({q.total_amount} €)
                  </option>
                ))}
              </select>
              <Button onClick={convertQuoteToInvoice} disabled={loading || !selectedQuoteId}>
                {loading ? 'Génération...' : 'Générer la facture'}
              </Button>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {invoices.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <FileText className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <div className="font-medium text-gray-900">Aucune facture émise</div>
              <p className="text-xs text-gray-400 mt-1">Transformez un devis en facture conforme pour démarrer.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
                  <th className="text-left px-4 py-3 font-medium">Numéro</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Client</th>
                  <th className="text-left px-4 py-3 font-medium">Statut</th>
                  <th className="text-right px-4 py-3 font-medium">Total TTC</th>
                  <th className="text-right px-4 py-3 font-medium">Reste dû</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} className="border-b hover:bg-gray-50 transition-colors last:border-0">
                    <td className="px-4 py-3 font-mono font-bold text-gray-900">{inv.number}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded ${inv.type === 'credit_note' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                        {inv.type === 'credit_note' ? 'Avoir' : 'Facture'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{inv.clients?.name || 'Client inconnu'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full uppercase ${inv.status === 'paid' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">{inv.total_amount} €</td>
                    <td className="px-4 py-3 text-right text-gray-600">{inv.balance_due} €</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.balance_due > 0 && inv.type === 'invoice' && (
                          <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => markPaid(inv.id, inv.balance_due)}>
                            Encaisser solde
                          </Button>
                        )}
                        {inv.type === 'invoice' && (
                          <Button size="sm" variant="outline" className="text-xs h-7 px-2 text-purple-600" onClick={() => issueCreditNote(inv)}>
                            Émettre Avoir
                          </Button>
                        )}
                      </div>
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
