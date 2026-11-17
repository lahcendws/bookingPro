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

  // Verify business ownership
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (bizError || !business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  // Soft delete business and set retention period (e.g. 30 days)
  const retentionDays = 30
  const retentionExpiresAt = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000).toISOString()

  // Anonymize associated clients first (preserves accounting history)
  const { error: anonError } = await supabase.rpc('anonymize_client' as any, {
    p_client_id: body.clientId,
    p_anonymous_name: `Customer #${Math.floor(10000 + Math.random() * 90000)}`,
  })

  if (anonError) {
    return NextResponse.json({ error: anonError.message }, { status: 500 })
  }

  // Soft-delete business with retention
  const { error: delError } = await supabase
    .from('businesses')
    .update({
      deleted_at: new Date().toISOString(),
      retention_expires_at: retentionExpiresAt,
    } as any)
    .eq('owner_id', user.id)

  if (delError) {
    return NextResponse.json({ error: delError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: 'Account scheduled for deletion with retention period',
    retentionExpiresAt,
    anonymizedClient: body.clientId,
  })
}