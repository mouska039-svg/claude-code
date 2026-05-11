import { createAdminClient } from "@/lib/supabase/server"

interface TokenUsage {
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
  // legacy aliases kept for callers
  promptTokens?: number
  completionTokens?: number
}

export async function trackUsage(
  userId: string,
  generatorType: string,
  usage: TokenUsage,
  model: string
): Promise<void> {
  const supabase = await createAdminClient()
  await supabase.from("ai_usage_log").insert({
    user_id: userId,
    generator_type: generatorType,
    prompt_tokens: usage.inputTokens ?? usage.promptTokens ?? 0,
    completion_tokens: usage.outputTokens ?? usage.completionTokens ?? 0,
    total_tokens: usage.totalTokens ?? (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0),
    model,
  })
}
