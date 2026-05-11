import { describe, it, expect } from "vitest"
import { isPlanActive, getPlanFeatures } from "@/lib/subscription"
import type { Subscription } from "@/types/database"

function makeSubscription(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: "sub_test",
    user_id: "user_test",
    plan: "free",
    stripe_customer_id: null,
    stripe_subscription_id: null,
    status: "active",
    current_period_end: new Date(Date.now() + 86400000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

describe("isPlanActive", () => {
  it("returns true for active subscription", () => {
    expect(isPlanActive(makeSubscription({ status: "active" }))).toBe(true)
  })

  it("returns true for trialing subscription", () => {
    expect(isPlanActive(makeSubscription({ status: "trialing" }))).toBe(true)
  })

  it("returns false for canceled subscription", () => {
    expect(isPlanActive(makeSubscription({ status: "canceled" }))).toBe(false)
  })

  it("returns false for null", () => {
    expect(isPlanActive(null)).toBe(false)
  })
})

describe("getPlanFeatures", () => {
  it("free plan has limited generations", () => {
    const features = getPlanFeatures("free")
    expect(features.generationsPerMonth).toBe(3)
  })

  it("premium plan has unlimited generations", () => {
    const features = getPlanFeatures("premium")
    expect(features.generationsPerMonth).toBeNull()
  })

  it("pro plan is between free and premium", () => {
    const features = getPlanFeatures("pro")
    expect(features.generationsPerMonth).toBe(50)
  })
})
