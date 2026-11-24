import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { JobDetailClient } from './job-detail-client'
import { getBusinessForUser } from '@/lib/business'

export async function generateMetadata() {
  return { title: 'État des Lieux Chantier — BookingPro' }
}

export default async function JobDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const { id } = params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check business access (owner OR employee)
  const business = await getBusinessForUser(user.id)
  if (!business) redirect('/onboarding')

  const { data: job } = await supabase
    .from('jobs' as any)
    .select('*, clients(*), vehicles(*), quotes(*), job_inspections(*)')
    .eq('id', id)
    .eq('business_id', business.id)
    .single()

  if (!job) return <div>Chantier introuvable</div>

  return <JobDetailClient job={job} />
}
