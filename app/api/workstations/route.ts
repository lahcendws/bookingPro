import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logActivity } from '@/lib/audit'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).maybeSingle()
    if (!business) return NextResponse.json({ error: 'business not found' }, { status: 404 })

    const { data, error } = await supabase.from('workstations').select('*').eq('business_id', business.id).order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data || [])
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {}
    try {
      body = await req.json()
    } catch {
      // empty body
    }

    const name = body?.name
    const description = body?.description

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'missing or invalid name' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'unauthorized: ' + (authErr?.message || 'no user') }, { status: 401 })
    }

    const { data: business, error: bizErr } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (bizErr || !business) {
      return NextResponse.json({ error: 'business not found: ' + (bizErr?.message || '') }, { status: 404 })
    }

    const { data, error } = await (supabase.from('workstations') as any)
      .insert({
        business_id: business.id,
        name: name.trim(),
        description: description ? String(description).trim() : null
      })
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'insert failed' }, { status: 500 })
    }

    await logActivity({
      businessId: business.id,
      userId: user.id,
      action: 'CREATE_WORKSTATION',
      entityType: 'workstation',
      entityId: data.id,
      details: { name: name.trim() }
    })

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).maybeSingle()
    if (!business) return NextResponse.json({ error: 'business not found' }, { status: 404 })

    const { error } = await supabase.from('workstations').delete().eq('id', id).eq('business_id', business.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await logActivity({
      businessId: business.id,
      userId: user.id,
      action: 'DELETE_WORKSTATION',
      entityType: 'workstation',
      entityId: id
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'internal error' }, { status: 500 })
  }
}
