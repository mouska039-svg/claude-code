import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createAdminClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

async function getOrCreateCustomer(stripeCustomerId: string) {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", stripeCustomerId)
    .single()
  return data?.user_id ?? null
}

async function upsertSubscription(
  userId: string,
  stripeSubscription: Stripe.Subscription,
  stripeCustomerId: string
) {
  const supabase = await createAdminClient()

  const plan = (stripeSubscription.metadata?.plan as "pro" | "premium") ?? "pro"
  const status = stripeSubscription.status as "active" | "canceled" | "past_due" | "trialing" | "incomplete"
  // current_period_end was removed in Stripe v22; derive from first item or trial_end
  const rawPeriodEnd = (stripeSubscription as unknown as { current_period_end?: number }).current_period_end
    ?? stripeSubscription.trial_end
    ?? null
  const periodEnd = rawPeriodEnd ? new Date(rawPeriodEnd * 1000).toISOString() : null

  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      plan,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscription.id,
      status,
      current_period_end: periodEnd,
    },
    { onConflict: "user_id" }
  )
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = await createAdminClient()

  // Idempotence check
  const { data: existing } = await supabase
    .from("stripe_events")
    .select("id")
    .eq("id", event.id)
    .single()

  if (existing) {
    return NextResponse.json({ received: true, skipped: true })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== "subscription") break

        const userId = session.metadata?.user_id
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        if (!userId || !customerId || !subscriptionId) break

        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId)
        await upsertSubscription(userId, stripeSubscription, customerId)
        break
      }

      case "customer.subscription.updated": {
        const stripeSubscription = event.data.object as Stripe.Subscription
        const customerId = stripeSubscription.customer as string
        const userId = await getOrCreateCustomer(customerId)
        if (!userId) break
        await upsertSubscription(userId, stripeSubscription, customerId)
        break
      }

      case "customer.subscription.deleted": {
        const stripeSubscription = event.data.object as Stripe.Subscription
        const customerId = stripeSubscription.customer as string
        const userId = await getOrCreateCustomer(customerId)
        if (!userId) break

        await supabase
          .from("subscriptions")
          .update({ plan: "free", status: "canceled", stripe_subscription_id: null })
          .eq("user_id", userId)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        const userId = await getOrCreateCustomer(customerId)
        if (!userId) break

        await supabase
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("user_id", userId)
        break
      }
    }

    // Mark event as processed
    await supabase.from("stripe_events").insert({ id: event.id })

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Webhook handler error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
