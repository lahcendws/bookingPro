import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/service-admin'

export async function GET(
  request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params
    const supabase = createAdminClient()

    const { data: job, error } = await supabase
      .from('jobs' as any)
      .select('id, status, tracking_expires_at, tracking_revoked_at, vehicles(brand, model, plate_number), clients(name)')
      .eq('tracking_token', token)
      .maybeSingle()

    // Same response for unknown/expired/revoked tokens
    if (error || !job) {
      return NextResponse.json({ found: false }, { status: 200 })
    }

    // Check expiry
    if (job.tracking_expires_at && new Date(job.tracking_expires_at) < new Date()) {
      return NextResponse.json({ found: false }, { status: 200 })
    }

    // Check revocation
    if (job.tracking_revoked_at) {
      return NextResponse.json({ found: false }, { status: 200 })
    }

    // Minimal payload: no phone, email, prices, internal notes, other ids
    // signature_data and client_consent_gallery removed from public view (sensitive data)
    return NextResponse.json({
      found: true,
      job: {
        id: job.id,
        status: job.status,
        vehicle: job.vehicles ? {
          brand: job.vehicles.brand,
          model: job.vehicles.model,
          plate_number: job.vehicles.plate_number,
        } : null,
        client_name: job.clients?.name,
        inspections: (job.job_inspections || []).map((insp: any) => ({
          type: insp.type,
          zones: insp.zones,
          // signature_data removed from public view (sensitive data)
          // client_consent_gallery removed from public view (sensitive data)
          created_at: insp.created_at,
        })),
      },
    })
  } catch (err: any) {
    return NextResponse.json({ found: false }, { status: 200 })
  }
}