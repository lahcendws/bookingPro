import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { VehiclesClient } from './vehicles-client'

export default async function VehiclesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).maybeSingle()
  if (!business) redirect('/onboarding')

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
