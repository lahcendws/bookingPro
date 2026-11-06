import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendQuoteEmail } from '@/lib/email'

// Called by Email button on quotes list (`app/(dashboard)/quotes/quotes-client.tsx`).
// No existing file handles quote email sending.
// Reads public.quotes, public.quote_lines, public.clients, public.businesses.
// User instruction: "oui, ajoute le bouton pour envoyer par email"

export async function POST(req: NextRequest) {
  try {
    const { quoteId } = await req.json()
    if (!quoteId) return NextResponse.json({ error: 'missing quoteId' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const { data: business } = await supabase.from('businesses').select('id, name').eq('owner_id', user.id).maybeSingle()
    if (!business) return NextResponse.json({ error: 'business not found' }, { status: 404 })

    const { data: quote, error: qErr } = await (supabase.from('quotes') as any)
      .select('*, clients(name, email), quote_lines(description, total_price)')
      .eq('id', quoteId)
      .eq('business_id', business.id)
      .single()

    if (qErr || !quote) return NextResponse.json({ error: 'quote not found' }, { status: 404 })

    const client = quote.clients as any
    const recipientEmail = client?.email
    if (!recipientEmail) {
      return NextResponse.json({ error: 'client has no email address' }, { status: 400 })
    }

    const quoteNumber = quote.id.substring(0, 8).toUpperCase()
    const validUntil = quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : '—'
    const lines = (quote.quote_lines || []).map((l: any) => ({
      description: l.description,
      total_price: l.total_price
    }))

    const result = await sendQuoteEmail({
      to: recipientEmail,
      clientName: client.name || 'Client',
      businessName: business.name || 'BookingPro',
      quoteId,
      quoteNumber,
      totalAmount: quote.total_amount,
      validUntil,
      lines,
    })

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ sent: true })
  } catch (err: any) {
    console.error('[api/quotes/send-email]', err)
    return NextResponse.json({ error: err.message || 'internal error' }, { status: 500 })
  }
}
