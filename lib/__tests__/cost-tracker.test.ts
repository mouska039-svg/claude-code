import { describe, it, expect } from "vitest";
import { computeCostEur } from "@/lib/ai/cost-tracker";

describe("computeCostEur", () => {
  it("calculates cost for claude-haiku correctly", () => {
    const cost = computeCostEur("claude-haiku-4-5-20251001", {
      inputTokens: 1000,
      outputTokens: 500,
    });
    // 1000 * 0.00000025 + 500 * 0.00000125
    expect(cost).toBeCloseTo(0.00000025 * 1000 + 0.00000125 * 500, 10);
  });

  it("calculates cost for gpt-4o-mini correctly", () => {
    const cost = computeCostEur("gpt-4o-mini", {
      inputTokens: 2000,
      outputTokens: 1000,
    });
    expect(cost).toBeCloseTo(0.00000015 * 2000 + 0.0000006 * 1000, 10);
  });

  it("uses default rates for unknown models", () => {
    const cost = computeCostEur("unknown-model", {
      inputTokens: 100,
      outputTokens: 100,
    });
    expect(cost).toBeCloseTo(0.000001 * 100 + 0.000003 * 100, 10);
  });

  it("returns 0 for zero tokens", () => {
    const cost = computeCostEur("claude-haiku-4-5-20251001", {
      inputTokens: 0,
      outputTokens: 0,
    });
    expect(cost).toBe(0);
  });

  it("handles undefined token counts gracefully", () => {
    const cost = computeCostEur("claude-haiku-4-5-20251001", {
      inputTokens: undefined,
      outputTokens: undefined,
    });
    expect(cost).toBe(0);
  });
});
