import crypto from "crypto";
import type { Json } from "@/types/supabase";
import { createAdminClient } from "@/lib/supabase/server";

export function buildCacheKey(
  specialty: string,
  context: string,
  durationWeeks?: number
): string {
  const normalized = [
    specialty.toLowerCase().trim(),
    context.toLowerCase().trim().replace(/\s+/g, " "),
    String(durationWeeks ?? ""),
  ].join("|");
  return crypto.createHash("md5").update(normalized).digest("hex");
}

export async function getCachedProtocol(
  cacheKey: string
): Promise<Record<string, unknown> | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("protocol_cache")
    .select("protocol_output, expires_at")
    .eq("cache_key", cacheKey)
    .maybeSingle();

  if (!data) return null;
  if (new Date(data.expires_at as string) < new Date()) {
    await supabase.from("protocol_cache").delete().eq("cache_key", cacheKey);
    return null;
  }

  const { data: current } = await supabase
    .from("protocol_cache")
    .select("hit_count")
    .eq("cache_key", cacheKey)
    .single();

  await supabase
    .from("protocol_cache")
    .update({ hit_count: ((current?.hit_count as number | null) ?? 0) + 1 })
    .eq("cache_key", cacheKey);

  return data.protocol_output as Record<string, unknown>;
}

export async function setCachedProtocol(
  cacheKey: string,
  output: Record<string, unknown>
): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from("protocol_cache")
    .upsert(
      { cache_key: cacheKey, protocol_output: output as Json },
      { onConflict: "cache_key" }
    );
}
