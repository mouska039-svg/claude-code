import { createAdminClient } from "@/lib/supabase/server";
import type { AIFeature } from "./client";

interface TokenUsage {
  inputTokens: number | undefined;
  outputTokens: number | undefined;
}

const COST_PER_TOKEN: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5-20251001": { input: 0.00000025, output: 0.00000125 },
  "claude-sonnet-4-6": { input: 0.000003, output: 0.000015 },
  "claude-opus-4-7": { input: 0.000015, output: 0.000075 },
  "gpt-4o-mini": { input: 0.00000015, output: 0.0000006 },
  "gpt-4o": { input: 0.000005, output: 0.000015 },
};

const DEFAULT_COST = { input: 0.000001, output: 0.000003 };

function computeCostEur(model: string, usage: TokenUsage): number {
  const rates = COST_PER_TOKEN[model] ?? DEFAULT_COST;
  return (
    rates.input * (usage.inputTokens ?? 0) + rates.output * (usage.outputTokens ?? 0)
  );
}

export async function logAIUsage(
  userId: string,
  feature: AIFeature,
  model: string,
  usage: TokenUsage
): Promise<void> {
  const costEur = computeCostEur(model, usage);
  const supabase = createAdminClient();

  await supabase.from("ai_usage_log").insert({
    user_id: userId,
    feature,
    model,
    prompt_tokens: usage.inputTokens ?? 0,
    completion_tokens: usage.outputTokens ?? 0,
    cost_eur: costEur,
  });
}

export { computeCostEur };
export type { TokenUsage };
