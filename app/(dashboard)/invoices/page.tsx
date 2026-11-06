import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { redirect } from 'next/navigation'
import { InvoicesClient } from './invoices-client'

// Called by Next.js App Router for route /invoices.
// No existing file serves this specific Phase 2 invoicing dashboard.
// Reads public.invoices, public.quotes, public.clients, public.invoice_lines, public.payments.
// User instruction: "utilise superpowers pour planifier, implementer et faire revue de code et skill playright pour tester en direct dans le navigateur pour developper ce ci: Phase 2 : facturation conforme et acompte"

export default async function InvoicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).maybeSingle()
  if (!business) redirect('/onboarding')

  const [{ data: invoices }, { data: quotes }, { data: clients }] = await Promise.all([
    supabase
      .from('invoices')
      .select('*, clients(name, phone), invoice_lines(*), payments(*)')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('quotes')
      .select('*, clients(name, phone), quote_lines(*)')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('clients')
      .select('id, name, phone')
      .eq('business_id', business.id)
      .order('name')
  ])

  return (
    <InvoicesClient
      initialInvoices={invoices || []}
      quotes={quotes || []}
      clients={clients || []}
      businessId={business.id}
    />
  )
}
