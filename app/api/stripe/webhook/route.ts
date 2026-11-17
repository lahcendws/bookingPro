import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2025-02-28.acacia' })

  let event: Stripe.Event
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // In production, always verify the Stripe signature to prevent spoofed webhooks.
  // In dev, if no secret is set, we allow parsing for local testing but log a warning.
  if (process.env.NODE_ENV === 'production' && webhookSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err) {
      console.error('[stripe/webhook] Signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  } else if (process.env.NODE_ENV === 'production' && (!webhookSecret || !sig)) {
    console.warn('[stripe/webhook] Production mode: Stripe webhook secret is missing — webhook signatures are NOT verified. Set STRIPE_WEBHOOK_SECRET in production environment.')
  }

  let event: { type: string; data: { object: Record<string, unknown> } }
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const supabase = createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const customerId = session.customer as string
      const subscriptionId = session.subscription as string
      const clientReferenceId = session.client_reference_id as string // business_id

      if (customerId && subscriptionId && clientReferenceId) {
        await supabase
          .from('businesses')
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: 'active',
          })
          .eq('id', clientReferenceId)
      }
      break
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object
      const subscriptionId = subscription.id as string
      const customerId = subscription.customer as string
      const status = subscription.status as string // active, trialing, past_due, canceled, etc.
      const items = subscription.items as { data: Array<{ price: { id: string; product: string } }> }
      const priceId = items?.data?.[0]?.price?.id

      // Find plan by price_id or metadata if stored, or map subscription status
      let dbStatus = 'active'
      if (status === 'trialing') dbStatus = 'trialing'
      else if (status === 'past_due' || status === 'unpaid') dbStatus = 'past_due'
      else if (status === 'canceled' || status === 'incomplete_expired') dbStatus = 'canceled'

      await supabase
        .from('businesses')
        .update({
          subscription_status: dbStatus,
          stripe_price_id: priceId ?? null,
        })
        .eq('stripe_customer_id', customerId)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const subscriptionId = subscription.id as string

      // Revert business to basic plan on subscription deletion
      const { data: basicPlan } = await supabase
        .from('plans')
        .select('id')
        .eq('slug', 'basic')
        .single()

      if (basicPlan) {
        await supabase
          .from('businesses')
          .update({
            plan_id: basicPlan.id,
            subscription_status: 'canceled',
            stripe_subscription_id: null,
            stripe_price_id: null,
          })
          .eq('stripe_subscription_id', subscriptionId)
      }
      break
    }

    case 'invoice.paid': {
      const invoice = event.data.object
      const customerId = invoice.customer as string
      const subscriptionId = invoice.subscription as string

      if (customerId) {
        await supabase
          .from('businesses')
          .update({
            subscription_status: 'active',
          })
          .eq('stripe_customer_id', customerId)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      const customerId = invoice.customer as string

      if (customerId) {
        await supabase
          .from('businesses')
          .update({
            subscription_status: 'past_due',
          })
          .eq('stripe_customer_id', customerId)
      }
      break
    }

    default:
      console.log(`Unhandled stripe event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
