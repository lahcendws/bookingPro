import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
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

    // First, find the job and verify it belongs to a business owned by the user
    const { data: job, error: jobError } = await supabase
      .from('jobs' as any)
      .select('id, business_id')
      .eq('id', id)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Verify the user owns the business this job belongs to
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id, owner_id')
      .eq('id', job.business_id)
      .eq('owner_id', user.id)
      .single()

    if (bizError || !business) {
      return NextResponse.json({ error: 'Forbidden: you do not own the business this job belongs to' }, { status: 403 })
    }

    // Now fetch the full job details (RLS will further restrict based on policies)
    const { data: fullJob, error: fullError } = await supabase
      .from('jobs' as any)
      .select('*, clients(name, email, phone), vehicles(brand, model, plate_number), quotes(id, total_amount, status), job_inspections(type, zones, signature_data, client_consent_gallery, created_at)')
      .eq('id', id)
      .single()

    if (fullError || !fullJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({ job: fullJob })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Error' }, { status: 500 })
  }
}

export async function PATCH(
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

    // Verify the job belongs to a business owned by the user before allowing updates
    const { data: job, error: jobError } = await supabase
      .from('jobs' as any)
      .select('id, business_id')
      .eq('id', id)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Verify the user owns the business this job belongs to
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id, owner_id')
      .eq('id', job.business_id)
      .eq('owner_id', user.id)
      .single()

    if (bizError || !business) {
      return NextResponse.json({ error: 'Forbidden: you do not own the business this job belongs to' }, { status: 403 })
    }

    const body = await request.json()
    const { status, notes } = body

    const updateData: any = { updated_at: new Date().toISOString() }
    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes

    const { data: updatedJob, error } = await supabase
      .from('jobs' as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ job: updatedJob })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Error' }, { status: 500 })
  }
}
