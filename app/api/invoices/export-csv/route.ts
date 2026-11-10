import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Called by export button in Invoices UI (`app/(dashboard)/invoices/invoices-client.tsx`).
// No existing file serves the accounting CSV export purpose.
// Reads public.invoices and public.clients.
// User instruction: "utilise superpowers pour planifier, implementer et faire revue de code et skill playright pour tester en direct dans le navigateur pour developper ce ci: Phase 2 : facturation conforme et acompte"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: business } = await supabase.from('businesses').select('id, name').eq('owner_id', user.id).maybeSingle()
  if (!business) return new NextResponse('Business not found', { status: 404 })

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, clients(name)')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  let csv = 'JournalCode,EcritureNum,EcritureDate,CompteNum,CompteLib,CompteAuxNum,CompteAuxLib,PieceRef,PieceDate,EcritureLib,Debit,Credit,EcritureLet,DateLet,ValidDate,MontantDevise,Devise\n'

  if (invoices) {
    for (const inv of invoices as any[]) {
      const dateStr = inv.issued_at ? new Date(inv.issued_at).toISOString().split('T')[0].replace(/-/g, '') : new Date().toISOString().split('T')[0].replace(/-/g, '')
      const clientName = inv.clients?.name || 'Client'
      csv += `VT,${inv.number},${dateStr},411000,Clients, ,${clientName},${inv.number},${dateStr},Facture ${inv.number},${inv.total_amount},0, , , ,${inv.total_amount},EUR\n`
      csv += `VT,${inv.number},${dateStr},706000,Prestations de services, , ,${inv.number},${dateStr},Facture ${inv.number} (HT),0,${inv.subtotal}, , , ,${inv.subtotal},EUR\n`
      csv += `VT,${inv.number},${dateStr},445710,TVA collectée 20%, , ,${inv.number},${dateStr},Facture ${inv.number} (TVA),0,${inv.tax_amount}, , , ,${inv.tax_amount},EUR\n`
    }
  }

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="export-comptable-${business.name || 'bookingpro'}.csv"`
    }
  })
}
