import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { QuotesClient } from './quotes-client'

export default async function QuotesPage(props: { searchParams: Promise<{ vehicle_id?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).maybeSingle()
  if (!business) redirect('/onboarding')

  // If vehicle_id is provided, redirect to new quote page
  if (searchParams.vehicle_id) {
    redirect(`/quotes/new?vehicle_id=${searchParams.vehicle_id}`)
  }

  const { data: quotes } = await supabase
    .from('quotes')
    .select('*, clients(name, email, phone), vehicles(brand, model, plate_number), quote_lines(*)')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  return <QuotesClient initialQuotes={quotes || []} />
}
