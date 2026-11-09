import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const { data: jobs, error } = await supabase
      .from('jobs' as any)
      .select('*, clients(name, email, phone), vehicles(brand, model, plate), quotes(quote_number, total_ttc)')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ jobs })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const body = await request.json()
    const { quote_id, appointment_id, client_id, vehicle_id, status, notes } = body

    if (!client_id || !vehicle_id) {
      return NextResponse.json({ error: 'Missing client_id or vehicle_id' }, { status: 400 })
    }

    const { data: job, error } = await supabase
      .from('jobs' as any)
      .insert({
        business_id: business.id,
        quote_id: quote_id || null,
        appointment_id: appointment_id || null,
        client_id,
        vehicle_id,
        status: status || 'reception',
        notes: notes || null
      } as any)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ job })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Error' }, { status: 500 })
  }
}
