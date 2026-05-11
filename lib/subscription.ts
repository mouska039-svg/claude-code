import { createClient } from "@/lib/supabase/server"
import type { Subscription } from "@/types/database"

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single()
  return data
}

export function isPlanActive(subscription: Subscription | null): boolean {
  if (!subscription) return false
  return ["active", "trialing"].includes(subscription.status)
}

export function getPlanFeatures(plan: Subscription["plan"]) {
  const features = {
    free: { generationsPerMonth: 3, maxClients: 1, brandedPdf: false, sharing: false },
    pro: { generationsPerMonth: 50, maxClients: null, brandedPdf: true, sharing: true },
    premium: { generationsPerMonth: null, maxClients: null, brandedPdf: true, sharing: true },
  }
  return features[plan]
}
