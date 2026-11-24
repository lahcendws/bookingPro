import { createClient } from '@/lib/supabase/server'
import { JobsClient } from './jobs-client'
import { redirect } from 'next/navigation'
import { getBusinessForUser } from '@/lib/business'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return { title: 'Chantiers — BookingPro' }
}

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check business access (owner OR employee)
  const business = await getBusinessForUser(user.id)
  if (!business) redirect('/onboarding')

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, clients(name, phone), vehicles(brand, model, plate_number), job_inspections(*)')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name')
    .eq('business_id', business.id)

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id, brand, model, plate_number, client_id')
    .eq('business_id', business.id)

  return (
    <JobsClient
      initialJobs={jobs || []}
      clients={clients || []}
      vehicles={vehicles || []}
    />
  )
}
