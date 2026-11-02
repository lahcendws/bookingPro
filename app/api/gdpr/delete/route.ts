import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Soft delete business and set retention period (e.g. 30 days)
  const retentionDays = 30
  const retentionExpiresAt = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from('businesses')
    .update({
      deleted_at: new Date().toISOString(),
      retention_expires_at: retentionExpiresAt,
    } as any)
    .eq('owner_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: 'Account scheduled for deletion with retention period',
    retentionExpiresAt
  })
}
