import { createClient } from '@/lib/supabase/server'
import { WorkstationsClient } from './workstations-client'
import { redirect } from 'next/navigation'

export default async function WorkstationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).maybeSingle()
  if (!business) return <div className="p-8">Aucune entreprise trouvée.</div>

  const { data: workstations } = await supabase
    .from('workstations')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  return <WorkstationsClient initialWorkstations={workstations || []} />
}
