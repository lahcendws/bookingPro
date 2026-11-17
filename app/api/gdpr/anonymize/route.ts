import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json() as { clientId?: string }
  if (!body.clientId) {
    return NextResponse.json({ error: 'clientId is required' }, { status: 400 })
  }

  // Verify the client belongs to a business owned by the authenticated user
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, business_id, name')
    .eq('id', body.clientId)
    .single()

  if (clientError || !client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // Check that the client's business is owned by the user
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('id, owner_id')
    .eq('id', client.business_id)
    .eq('owner_id', user.id)
    .single()

  if (bizError || !business) {
    return NextResponse.json({ error: 'Forbidden: you do not own this client\'s business' }, { status: 403 })
  }

  // Generate random customer number e.g. Customer #92817
  const randomNum = Math.floor(10000 + Math.random() * 90000)
  const anonymousName = `Customer #${randomNum}`

  // Call database function to anonymize client while preserving accounting history
  const { error: rpcError } = await supabase.rpc('anonymize_client' as any, {
    p_client_id: body.clientId,
    p_anonymous_name: anonymousName,
  })

  if (rpcError) {
    return NextResponse.json({ error: rpcError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, anonymousName })
}
