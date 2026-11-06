import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { redirect } from 'next/navigation'
import { FileText, Plus, Send } from 'lucide-react'
import Link from 'next/link'
import { QuotesClient } from './quotes-client'

export default async function QuotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).maybeSingle()
  if (!business) redirect('/onboarding')

  const { data: quotes } = await supabase
    .from('quotes')
    .select('*, clients(name, email, phone), vehicles(brand, model, plate_number), quote_lines(*)')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  return <QuotesClient initialQuotes={quotes || []} />
}
