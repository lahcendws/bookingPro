import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RollsClient } from './rolls-client'

export default async function InventoryRollsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).maybeSingle()
  if (!business) redirect('/onboarding')

  const { data: rolls } = await supabase.from('inventory_rolls').select('*').eq('business_id', business.id).order('created_at', { ascending: false })

  return <RollsClient initialRolls={rolls || []} businessId={business.id} />
}
