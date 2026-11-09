import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await request.json()

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!business) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  // User instruction: allow assigning workstation and duration_days from planning view
  const updateData: any = {}
  if (body.workstation_id !== undefined) {
    updateData.workstation_id = body.workstation_id || null
  }
  if (body.employee_id !== undefined) {
    updateData.employee_id = body.employee_id || null
  }
  if (body.duration_days !== undefined) {
    updateData.duration_days = Number(body.duration_days) || 1
  }

  const { data, error } = await supabase
    .from('appointments')
    .update(updateData)
    .eq('id', params.id)
    .eq('business_id', business.id)
    .select('id, workstation_id, duration_days, employees(id, name)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
