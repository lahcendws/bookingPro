import { createClient } from '@/lib/supabase/server'
import { JobsClient } from './jobs-client'

export async function generateMetadata() {
  return { title: 'Chantiers — BookingPro' }
}

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!business) return <div>Business not found</div>

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, clients(name, phone), vehicles(brand, model, plate_number, plate), job_inspections(*)')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name')
    .eq('business_id', business.id)

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id, brand, model, plate_number, plate, client_id, clients(name)')
    .eq('business_id', business.id)

  return (
    <JobsClient
      initialJobs={jobs || []}
      clients={clients || []}
      vehicles={vehicles || []}
    />
  )
}
