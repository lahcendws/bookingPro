import { createClient } from '@/lib/supabase/server'
import { PlanningClient } from './planning-client'
import { redirect } from 'next/navigation'

export default async function PlanningPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check business access (owner OR employee)
  const { data: ownedBusiness } = await supabase.from('businesses').select('id').eq('owner_id', user.id).maybeSingle()

  let business = ownedBusiness

  // If no owned business, check if user is an employee in a business
  if (!business) {
    const { data: employee } = await supabase.from('employees').select('business_id').eq('user_id', user.id).maybeSingle()
    if (employee?.business_id) {
      business = await supabase.from('businesses').select('id').eq('id', employee.business_id).maybeSingle()
    }
  }

  if (!business) redirect('/onboarding')

  const { data: workstations } = await supabase
    .from('workstations')
    .select('*')
    .eq('business_id', business!.id)
    .order('created_at', { ascending: true })

  const { data: appointments } = await (supabase.from('appointments') as any)
    .select('*, clients(name, email, phone), services(name, price)')
    .eq('business_id', business!.id)
    .order('starts_at', { ascending: true })

  return <PlanningClient workstations={workstations || []} appointments={appointments || []} />
}
