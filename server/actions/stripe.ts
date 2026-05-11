"use server"

import { createClient } from "@/lib/supabase/server"
import { getUserSubscription } from "@/lib/subscription"
import Stripe from "stripe"
import { redirect } from "next/navigation"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PRICE_MAP: Record<string, string> = {
  pro: process.env.STRIPE_PRO_PRICE_ID!,
  premium: process.env.STRIPE_PREMIUM_PRICE_ID!,
}

export async function createCheckoutSession(plan: "pro" | "premium"): Promise<never> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const subscription = await getUserSubscription(user.id)
  const priceId = PRICE_MAP[plan]

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing`,
    customer: subscription?.stripe_customer_id ?? undefined,
    customer_email: subscription?.stripe_customer_id ? undefined : user.email,
    metadata: { user_id: user.id, plan },
  })

  redirect(session.url!)
}

export async function createPortalSession(): Promise<never> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const subscription = await getUserSubscription(user.id)
  if (!subscription?.stripe_customer_id) redirect("/dashboard/billing")

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing`,
  })

  redirect(session.url)
}
