import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 1. Fetch business owned by user
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (bizError || !business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  const businessId = business.id

  // 2. Fetch clients
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('business_id', businessId)

  // 3. Fetch appointments
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('business_id', businessId)

  // 4. Fetch transactions / sales
  const { data: transactions } = await supabase
    .from('inventory_sales')
    .select('*')
    .eq('business_id', businessId)

  // 5. Fetch consents
  const { data: consents } = await supabase
    .from('consents')
    .select('*')
    .eq('user_id', user.id)

  // 6. Compile GDPR Export Package
  const exportData = {
    exportVersion: '1.0',
    exportedAt: new Date().toISOString(),
    profile: {
      id: user.id,
      email: user.email,
      createdAt: user.created_at,
    },
    business,
    clients: clients || [],
    appointments: appointments || [],
    transactions: transactions || [],
    consents: consents || [],
  }

  const jsonString = JSON.stringify(exportData, null, 2)

  return new NextResponse(jsonString, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="bookingpro-gdpr-export-${business.slug}-${new Date().toISOString().split('T')[0]}.json"`,
    },
  })
}
