import { describe, it, expect } from "vitest"

// Test the LIMITS logic directly without Supabase
const LIMITS = {
  free: { programs: 3, nutrition: 3, content: 3 },
  pro: { programs: 50, nutrition: 50, content: 50 },
  premium: { programs: null, nutrition: null, content: null },
}

function isAllowed(plan: keyof typeof LIMITS, type: "programs" | "nutrition" | "content", currentCount: number) {
  const limit = LIMITS[plan][type]
  if (limit === null) return true
  return currentCount < limit
}

function getRemaining(plan: keyof typeof LIMITS, type: "programs" | "nutrition" | "content", currentCount: number) {
  const limit = LIMITS[plan][type]
  if (limit === null) return null
  return Math.max(0, limit - currentCount)
}

describe("quota limits", () => {
  it("allows free plan under limit", () => {
    expect(isAllowed("free", "programs", 2)).toBe(true)
  })

  it("blocks free plan at limit", () => {
    expect(isAllowed("free", "programs", 3)).toBe(false)
  })

  it("blocks free plan over limit", () => {
    expect(isAllowed("free", "programs", 5)).toBe(false)
  })

  it("allows pro plan at 49", () => {
    expect(isAllowed("pro", "programs", 49)).toBe(true)
  })

  it("blocks pro plan at 50", () => {
    expect(isAllowed("pro", "programs", 50)).toBe(false)
  })

  it("always allows premium plan", () => {
    expect(isAllowed("premium", "programs", 9999)).toBe(true)
  })

  it("returns correct remaining for free plan", () => {
    expect(getRemaining("free", "content", 1)).toBe(2)
  })

  it("returns 0 remaining when at limit", () => {
    expect(getRemaining("free", "content", 3)).toBe(0)
  })

  it("returns null remaining for premium (unlimited)", () => {
    expect(getRemaining("premium", "programs", 0)).toBeNull()
  })
})
