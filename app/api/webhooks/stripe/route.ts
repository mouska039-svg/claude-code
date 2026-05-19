import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-04-22.dahlia",
  });
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  // Idempotence check
  const { data: existing } = await supabase
    .from("stripe_events")
    .select("id")
    .eq("id", event.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ received: true, skipped: true });
  }

  // Mark as processing
  await supabase.from("stripe_events").insert({ id: event.id });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as "cabinet" | "cabinet_plus" | undefined;
        if (!userId || !plan) break;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        const periodEnd = subscription.items.data[0]?.current_period_end;
        await supabase
          .from("subscriptions")
          .update({
            plan,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            status: subscription.status,
            current_period_end: periodEnd
              ? new Date(periodEnd * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const { data: subscriptionData } = await supabase
          .from("subscriptions")
          .select("user_id, plan")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (!subscriptionData) break;

        // Determine plan from price ID
        const priceId = sub.items.data[0]?.price.id;
        let newPlan: "free" | "cabinet" | "cabinet_plus" = subscriptionData.plan as
          | "free"
          | "cabinet"
          | "cabinet_plus";
        if (
          priceId === process.env.STRIPE_PRICE_CABINET_MONTHLY ||
          priceId === process.env.STRIPE_PRICE_CABINET_ANNUAL
        ) {
          newPlan = "cabinet";
        } else if (
          priceId === process.env.STRIPE_PRICE_CABINET_PLUS_MONTHLY ||
          priceId === process.env.STRIPE_PRICE_CABINET_PLUS_ANNUAL
        ) {
          newPlan = "cabinet_plus";
        }

        const subPeriodEnd = sub.items.data[0]?.current_period_end;
        await supabase
          .from("subscriptions")
          .update({
            plan: newPlan,
            status: sub.status,
            current_period_end: subPeriodEnd
              ? new Date(subPeriodEnd * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await supabase
          .from("subscriptions")
          .update({
            plan: "free",
            status: "canceled",
            stripe_subscription_id: null,
            current_period_end: null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", sub.customer as string);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await supabase
          .from("subscriptions")
          .update({ status: "past_due", updated_at: new Date().toISOString() })
          .eq("stripe_customer_id", invoice.customer as string);
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
