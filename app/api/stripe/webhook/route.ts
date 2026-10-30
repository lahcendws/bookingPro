import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret || !sig) {
    return NextResponse.json({ error: 'Webhook secret or signature missing' }, { status: 400 })
  }

  // NOTE: Verify Stripe webhook signature using stripe library when STRIPE_SECRET_KEY is active.
  // const event = stripe.webhooks.constructEvent(body, sig, webhookSecret)

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

      await supabase
        .from('businesses')
        .update({
          subscription_status: 'active',
          stripe_subscription_id: subscriptionId,
        })
        .eq('stripe_customer_id', customerId)
      break
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const subscriptionId = subscription.id as string

      // Revert business to free plan on cancellation
      const freePlanId = await supabase
        .from('plans')
        .select('id')
        .eq('slug', 'free')
        .single()
        .then(({ data }) => data?.id)

      if (freePlanId) {
        await supabase
          .from('businesses')
          .update({
            plan_id: freePlanId,
            subscription_status: 'canceled',
            stripe_subscription_id: null,
          })
          .eq('stripe_subscription_id', subscriptionId)
      }
      break
    }
    default:
      console.log(`Unhandled stripe event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
