import type { PlanType, QuotaResult, QuotaType } from "@/types";
import { getCurrentYearMonth } from "@/lib/utils";
import type { Database } from "@/types/supabase";

type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];
type UsageQuotaRow = Database["public"]["Tables"]["usage_quotas"]["Row"];

const PLAN_LIMITS: Record<PlanType, Record<QuotaType, number | null>> = {
  free: { protocols: 3, audios: 2, company_programs: 0 },
  cabinet: { protocols: 30, audios: 20, company_programs: 0 },
  cabinet_plus: { protocols: null, audios: null, company_programs: null },
};

export async function checkQuota(userId: string, type: QuotaType): Promise<QuotaResult> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data: subData } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  const subscription = subData as SubscriptionRow | null;
  const plan = (subscription?.plan as PlanType) ?? "free";
  const limit = PLAN_LIMITS[plan][type];

  if (limit === null) {
    return { allowed: true, remaining: Infinity, limit: null, plan };
  }

  if (limit === 0) {
    return { allowed: false, remaining: 0, limit: 0, plan };
  }

  const yearMonth = getCurrentYearMonth();

  const { data: quotaData } = await supabase
    .from("usage_quotas")
    .select("*")
    .eq("user_id", userId)
    .eq("year_month", yearMonth)
    .maybeSingle();

  const quota = quotaData as UsageQuotaRow | null;

  const countField =
    type === "protocols"
      ? "protocols_count"
      : type === "audios"
        ? "audios_count"
        : "company_programs_count";

  const used = quota?.[countField] ?? 0;
  const remaining = Math.max(0, limit - (used as number));

  return { allowed: remaining > 0, remaining, limit, plan };
}

export async function incrementQuota(userId: string, type: QuotaType): Promise<void> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const yearMonth = getCurrentYearMonth();
  const countField =
    type === "protocols"
      ? "protocols_count"
      : type === "audios"
        ? "audios_count"
        : "company_programs_count";

  const { data: existing } = await supabase
    .from("usage_quotas")
    .select("id")
    .eq("user_id", userId)
    .eq("year_month", yearMonth)
    .maybeSingle();

  if (existing) {
    // Increment using a raw update with current value
    const { data: currentQuota } = await supabase
      .from("usage_quotas")
      .select("*")
      .eq("user_id", userId)
      .eq("year_month", yearMonth)
      .single();

    const current = currentQuota as UsageQuotaRow | null;
    const currentVal = (current?.[countField] ?? 0) as number;

    const updateData: {
      protocols_count?: number;
      audios_count?: number;
      company_programs_count?: number;
    } = {};
    if (type === "protocols") updateData.protocols_count = currentVal + 1;
    else if (type === "audios") updateData.audios_count = currentVal + 1;
    else updateData.company_programs_count = currentVal + 1;

    await supabase
      .from("usage_quotas")
      .update(updateData)
      .eq("user_id", userId)
      .eq("year_month", yearMonth);
  } else {
    const insertData: {
      user_id: string;
      year_month: string;
      protocols_count?: number;
      audios_count?: number;
      company_programs_count?: number;
    } = { user_id: userId, year_month: yearMonth };
    if (type === "protocols") insertData.protocols_count = 1;
    else if (type === "audios") insertData.audios_count = 1;
    else insertData.company_programs_count = 1;

    await supabase.from("usage_quotas").insert(insertData);
  }
}
