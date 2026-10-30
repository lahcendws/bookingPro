import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const PlanSelectionSchema = z.object({
  planSlug: z.enum(['free', 'pro', 'business', 'enterprise']),
  billingCycle: z.enum(['monthly', 'yearly']).default('monthly'),
  startTrial: z.boolean().default(false),
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

  const parsed = PlanSelectionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 422 })
  }

  const { planSlug, startTrial } = parsed.data

  // Fetch plan id
  const { data: plan, error: planErr } = await supabase
    .from('plans')
    .select('id, slug, price_monthly')
    .eq('slug', planSlug)
    .single()

  if (planErr || !plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  // Find user's business
  const { data: biz, error: bizErr } = await supabase
    .from('businesses')
    .select('id, owner_id')
    .eq('owner_id', user.id)
    .single()

  if (bizErr || !biz) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  // Calculate 14-day trial ends at if requested and plan is paid
  let trialEndsAt: string | null = null
  let subscriptionStatus = 'active'

  if (startTrial && plan.price_monthly > 0) {
    const trialDate = new Date()
    trialDate.setDate(trialDate.getDate() + 14)
    trialEndsAt = trialDate.toISOString()
    subscriptionStatus = 'trialing'
  } else if (plan.price_monthly > 0) {
    // If paid plan without trial chosen directly here (before Stripe checkout integration), mark as trialing or pending
    const trialDate = new Date()
    trialDate.setDate(trialDate.getDate() + 14)
    trialEndsAt = trialDate.toISOString()
    subscriptionStatus = 'trialing'
  }

  const { error: updateErr } = await supabase
    .from('businesses')
    .update({
      plan_id: plan.id,
      subscription_status: subscriptionStatus,
      trial_ends_at: trialEndsAt,
    })
    .eq('id', biz.id)

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, plan: plan.slug, subscriptionStatus, trialEndsAt })
}
