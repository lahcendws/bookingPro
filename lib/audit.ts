import { createClient } from '@/lib/supabase/server'

/**
 * Writes an activity log entry into public.activity_logs.
 * Kept for backward compatibility; consider migrating to logAudit only.
 */
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

/**
 * Writes an audit log entry into public.activity_logs.
 * Single source of truth for audit logging. Prefer this over logActivity.
 */
export async function logAudit(opts: {
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


