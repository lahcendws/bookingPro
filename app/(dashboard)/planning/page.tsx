import { createClient } from '@/lib/supabase/server'
import { PlanningClient } from './planning-client'
import { redirect } from 'next/navigation'

export default async function PlanningPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).maybeSingle()
  if (!business) return <div className="p-8">Aucune entreprise trouvée.</div>

  const { data: workstations } = await supabase
    .from('workstations')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: true })

  const { data: appointments } = await (supabase.from('appointments') as any)
    .select('*, clients(name, email, phone), services(name, price)')
    .eq('business_id', business.id)
    .order('starts_at', { ascending: true })

  return <PlanningClient workstations={workstations || []} appointments={appointments || []} />
}
