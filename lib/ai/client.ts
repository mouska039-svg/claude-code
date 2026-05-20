import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";

export type AIFeature = "protocol" | "summary" | "business";

const DEFAULTS: Record<AIFeature, string> = {
  protocol: "claude-haiku-4-5-20251001",
  summary: "claude-haiku-4-5-20251001",
  business: "claude-opus-4-7",
};

function resolveModel(feature: AIFeature): string {
  const envKey = `AI_MODEL_${feature.toUpperCase()}` as
    | "AI_MODEL_PROTOCOL"
    | "AI_MODEL_SUMMARY"
    | "AI_MODEL_BUSINESS";
  return process.env[envKey] ?? DEFAULTS[feature];
}

export function getModelId(feature: AIFeature): string {
  return resolveModel(feature);
}

export function getAIModel(feature: AIFeature) {
  const modelId = resolveModel(feature);
  if (modelId.startsWith("claude-")) {
    return anthropic(modelId);
  }
  return openai(modelId);
}
