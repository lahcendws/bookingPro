import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WarrantiesClient } from './warranties-client'

export default async function WarrantiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).maybeSingle()
  if (!business) redirect('/onboarding')

  const { data: warranties } = await supabase.from('warranties').select('*, clients(name), vehicles(brand, model, plate_number)').eq('business_id', business.id).order('created_at', { ascending: false })
  const { data: vehicles } = await supabase.from('vehicles').select('id, brand, model, plate_number').eq('business_id', business.id)
  const { data: clients } = await supabase.from('clients').select('id, name').eq('business_id', business.id)

  return <WarrantiesClient initialWarranties={warranties || []} vehicles={vehicles || []} clients={clients || []} businessId={business.id} />
}
