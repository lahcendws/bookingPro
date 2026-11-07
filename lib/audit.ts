import { createClient } from '@/lib/supabase/server'

export async function logActivity(opts: {
  businessId: string
  userId?: string | null
  action: string
  entityType: string
  entityId?: string | null
  details?: Record<string, any>
}) {
  try {
    const supabase = await createClient()
    await (supabase.from('activity_logs') as any).insert({
      business_id: opts.businessId,
      user_id: opts.userId || null,
      action: opts.action,
      entity_type: opts.entityType,
      entity_id: opts.entityId || null,
      details: opts.details || {},
    })
  } catch (err) {
    console.error('[AuditLog Error]', err)
  }
}
