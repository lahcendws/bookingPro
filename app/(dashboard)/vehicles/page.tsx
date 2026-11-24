import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { VehiclesClient } from './vehicles-client'
import { getAuthUser } from '@/lib/auth-user'
import { getBusinessForUser } from '@/lib/business'

export default async function VehiclesPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  // Check business access (owner OR employee)
  const business = await getBusinessForUser(user.id)
  if (!business) redirect('/onboarding')

  const supabase = await createClient()

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*, clients(name, phone), vehicle_body_types(code, label)')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, phone')
    .eq('business_id', business.id)

  return <VehiclesClient initialVehicles={vehicles || []} clients={clients || []} businessId={business.id} />
}
