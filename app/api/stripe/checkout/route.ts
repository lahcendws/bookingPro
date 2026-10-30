import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const CheckoutSchema = z.object({
  planSlug: z.enum(['pro', 'business', 'enterprise']),
  billingCycle: z.enum(['monthly', 'yearly']).default('monthly'),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = CheckoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 422 })
  }

  const { planSlug, billingCycle } = parsed.data

  // Fetch business
  const { data: biz } = await supabase
    .from('businesses')
    .select('id, name, stripe_customer_id, slug')
    .eq('owner_id', user.id)
    .single()

  if (!biz) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  // NOTE: When STRIPE_SECRET_KEY is configured, initialize Stripe:
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-28.acacia' })
  // For now, return checkout session URL or instructions when Stripe is not configured
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({
      error: 'stripe_not_configured',
      message: 'Stripe API keys are not configured. Please set STRIPE_SECRET_KEY.',
      checkoutUrl: `${appUrl}/settings?billing=success&plan=${planSlug}`,
    }, { status: 400 })
  }

  return NextResponse.json({ url: `${appUrl}/settings?billing=success` })
}
