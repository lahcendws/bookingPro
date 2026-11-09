import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params
    const supabase = await createClient()

    const { data: job, error } = await supabase
      .from('jobs' as any)
      .select('*, clients(name), vehicles(brand, model, plate), job_inspections(*)')
      .eq('tracking_token', token)
      .single()

    if (error || !job) {
      return NextResponse.json({ error: 'Job not found or invalid token' }, { status: 404 })
    }

    return NextResponse.json({ job })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Error' }, { status: 500 })
  }
}
