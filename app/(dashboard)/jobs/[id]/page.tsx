import { createClient } from '@/lib/supabase/server'
import { JobDetailClient } from './job-detail-client'

export async function generateMetadata() {
  return { title: 'État des Lieux Chantier — BookingPro' }
}

export default async function JobDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const { id } = params
  const supabase = await createClient()

  const { data: job } = await supabase
    .from('jobs' as any)
    .select('*, clients(*), vehicles(*), quotes(*), job_inspections(*)')
    .eq('id', id)
    .single()

  if (!job) return <div>Chantier introuvable</div>

  return <JobDetailClient job={job} />
}
