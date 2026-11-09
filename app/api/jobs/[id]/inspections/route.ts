import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, zones, signature_data, client_consent_gallery } = body

    if (!type || !zones) {
      return NextResponse.json({ error: 'Missing type or zones' }, { status: 400 })
    }

    const { data: inspection, error } = await supabase
      .from('job_inspections' as any)
      .insert({
        job_id: id,
        type,
        zones,
        signature_data: signature_data || null,
        client_consent_gallery: !!client_consent_gallery
      } as any)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ inspection })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Error' }, { status: 500 })
  }
}
