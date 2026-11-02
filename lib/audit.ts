import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function logAudit({
  businessId,
  userId,
  action,
  entityType,
  entityId,
  metadata,
  req,
}: {
  businessId: string
  userId?: string | null
  action: string
  entityType: string
  entityId?: string | null
  metadata?: Record<string, any>
  req?: Request
}) {
  try {
    const supabase = await createClient()

    let ipHash: string | null = null
    if (req) {
      const forwarded = req.headers.get('x-forwarded-for')
      const ip = forwarded ? forwarded.split(',')[0].trim() : (req.headers.get('x-real-ip') || '127.0.0.1')
      ipHash = crypto.createHash('sha256').update(ip + (process.env.IP_SALT || 'bookingpro-salt')).digest('hex')
    }

    await (supabase.from('audit_logs') as any).insert({
      business_id: businessId,
      user_id: userId || null,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      metadata: metadata || {},
      ip_hash: ipHash,
    })
  } catch (err) {
    console.error('Failed to write audit log:', err)
  }
}
