import { createAdminClient } from "@/lib/supabase/server"
import { getUserSubscription } from "@/lib/subscription"

type QuotaType = "programs" | "nutrition" | "content"

const LIMITS: Record<string, Record<QuotaType, number | null>> = {
  free: { programs: 3, nutrition: 3, content: 3 },
  pro: { programs: 50, nutrition: 50, content: 50 },
  premium: { programs: null, nutrition: null, content: null },
}

function currentYearMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

export async function checkQuota(
  userId: string,
  type: QuotaType
): Promise<{ allowed: boolean; remaining: number | null; limit: number | null; plan: string }> {
  const subscription = await getUserSubscription(userId)
  const plan = subscription?.plan ?? "free"
  const limit = LIMITS[plan]?.[type] ?? 3

  if (limit === null) {
    return { allowed: true, remaining: null, limit: null, plan }
  }

  const supabase = await createAdminClient()
  const yearMonth = currentYearMonth()

  const { data: quota } = await supabase
    .from("usage_quotas")
    .select("*")
    .eq("user_id", userId)
    .eq("year_month", yearMonth)
    .single()

  const count = quota ? quota[`${type}_count` as keyof typeof quota] as number : 0
  const remaining = Math.max(0, limit - count)

  return { allowed: remaining > 0, remaining, limit, plan }
}

export async function incrementQuota(userId: string, type: QuotaType): Promise<void> {
  const supabase = await createAdminClient()
  const yearMonth = currentYearMonth()
  const countCol = `${type}_count`

  const { data: existing } = await supabase
    .from("usage_quotas")
    .select("id")
    .eq("user_id", userId)
    .eq("year_month", yearMonth)
    .single()

  if (existing) {
    await supabase.rpc("increment_quota", {
      p_user_id: userId,
      p_year_month: yearMonth,
      p_column: countCol,
    })
  } else {
    await supabase.from("usage_quotas").insert({
      user_id: userId,
      year_month: yearMonth,
      programs_count: type === "programs" ? 1 : 0,
      nutrition_count: type === "nutrition" ? 1 : 0,
      content_count: type === "content" ? 1 : 0,
    })
  }
}
