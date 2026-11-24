import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NewQuoteClient } from './new-quote-client'
import { getBusinessForUser } from '@/lib/business'

export default async function NewQuotePage(props: { searchParams: Promise<{ vehicle_id?: string; client_id?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check business access (owner OR employee)
  const business = await getBusinessForUser(user.id)
  if (!business) redirect('/onboarding')

  // Get vehicle and client if provided
  let vehicle = null
  let client = null

  if (searchParams.vehicle_id) {
    const { data } = await supabase
      .from('vehicles')
      .select('*, clients(*)')
      .eq('id', searchParams.vehicle_id)
      .eq('business_id', business.id)
      .single()
    vehicle = data
    if (vehicle?.client_id) {
      client = vehicle.clients
    }
  } else if (searchParams.client_id) {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('id', searchParams.client_id)
      .eq('business_id', business.id)
      .single()
    client = data
  }

  // Get active services for this business
  const { data: services } = await supabase
    .from('services')
    .select('id, name, price, duration_min, category')
    .eq('business_id', business.id)
    .eq('is_active', true)
    .order('name')

  // Get vehicle body types for pricing
  const { data: bodyTypes } = await supabase
    .from('vehicle_body_types')
    .select('id, code, label')
    .order('display_order')

  return <NewQuoteClient
    businessId={business.id}
    vehicle={vehicle}
    client={client}
    services={services || []}
    bodyTypes={bodyTypes || []}
  />
}