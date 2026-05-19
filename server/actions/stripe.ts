"use server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";
import type { Database } from "@/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-04-22.dahlia",
  });
}

export async function createCheckoutSession(
  plan: "cabinet" | "cabinet_plus"
): Promise<{ url?: string; error?: string }> {
  const stripe = getStripe();
  const planPriceMap: Record<string, string> = {
    cabinet: process.env.STRIPE_PRICE_CABINET_MONTHLY!,
    cabinet_plus: process.env.STRIPE_PRICE_CABINET_PLUS_MONTHLY!,
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const subscription = await getUserSubscription(user.id);
  let customerId = subscription?.stripe_customer_id;

  if (!customerId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    const customer = await stripe.customers.create({
      email: user.email,
      name: (profile as ProfileRow | null)?.full_name ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("subscriptions")
      .update({ stripe_customer_id: customerId })
      .eq("user_id", user.id);
  }

  const priceId = planPriceMap[plan];
  if (!priceId) return { error: "Plan invalide" };

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?cancelled=1`,
    metadata: { userId: user.id, plan },
    allow_promotion_codes: true,
  });

  return { url: session.url ?? undefined };
}

export async function createPortalSession(): Promise<{ url?: string; error?: string }> {
  const stripe = getStripe();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const subscription = await getUserSubscription(user.id);
  if (!subscription?.stripe_customer_id)
    return { error: "Aucun abonnement Stripe trouvé" };

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
  });

  return { url: session.url };
}
