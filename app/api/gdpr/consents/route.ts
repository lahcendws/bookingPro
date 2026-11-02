import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json() as { consentType?: string; version?: string }
  if (!body.consentType) {
    return NextResponse.json({ error: 'consentType is required' }, { status: 400 })
  }

  // Get client IP hash for GDPR audit compliance (without storing raw IP)
  const forwardedFor = req.headers.get('x-forwarded-for')
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1'
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex')

  const { error } = await (supabase.from('consents') as any).insert({
    user_id: user.id,
    consent_type: body.consentType,
    version: body.version || '1.0',
    ip_hash: ipHash,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, acceptedAt: new Date().toISOString() })
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: consents, error } = await (supabase.from('consents') as any)
    .select('*')
    .eq('user_id', user.id)
    .order('accepted_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ consents: consents || [] })
}
