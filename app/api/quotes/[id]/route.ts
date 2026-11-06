import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Public quote view and acceptance API endpoint
// Called by client via public link /quote/[id]
// Reads public.quotes, public.quote_lines, public.clients, public.businesses
// User instruction: "Devis : tables quotes et quote_lines, statuts (brouillon, envoyé, accepté, refusé, expiré), durée de validité, PDF, lien public d’acceptation avec horodatage. Conversion devis → rendez-vous."

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: quote, error } = await (supabase.from('quotes') as any)
    .select('*, clients(name, email, phone), businesses(name, address), quote_lines(*)')
    .eq('id', id)
    .single()

  if (error || !quote) {
    return new NextResponse('Devis introuvable ou expiré', { status: 404 })
  }

  return NextResponse.json(quote)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { action } = await req.json() // 'accept' or 'refuse'

  if (!['accept', 'refuse'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const supabase = await createClient()
  const newStatus = action === 'accept' ? 'accepte' : 'refuse'
  const updatePayload: any = { status: newStatus }
  if (action === 'accept') {
    updatePayload.accepted_at = new Date().toISOString()
  }

  const { data, error } = await (supabase.from('quotes') as any)
    .update(updatePayload)
    .eq('id', id)
    .select('*, clients(name, email)')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Update failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true, status: data.status, accepted_at: data.accepted_at })
}
