import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];

export async function getUserSubscription(
  userId: string
): Promise<SubscriptionRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();
  return data as SubscriptionRow | null;
}

export function isPlanActive(subscription: SubscriptionRow | null): boolean {
  if (!subscription) return false;
  return ["active", "trialing"].includes(subscription.status);
}

export function canAccessFeature(
  subscription: SubscriptionRow | null,
  feature: "companies" | "voice_clone" | "unlimited"
): boolean {
  const plan = subscription?.plan ?? "free";
  if (feature === "companies" || feature === "voice_clone" || feature === "unlimited") {
    return plan === "cabinet_plus";
  }
  return false;
}
