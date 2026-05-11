import { describe, it, expect } from "vitest"
import { workoutInputSchema } from "@/lib/ai/schemas/workout"
import { nutritionInputSchema } from "@/lib/ai/schemas/nutrition"
import { contentInputSchema } from "@/lib/ai/schemas/content"

describe("workoutInputSchema", () => {
  const valid = {
    goal: "hypertrophy",
    level: "intermediate",
    frequency: 4,
    equipment: ["barbell", "dumbbell"],
    sessionDuration: 60,
  }

  it("accepts valid input", () => {
    expect(workoutInputSchema.safeParse(valid).success).toBe(true)
  })

  it("rejects empty equipment", () => {
    expect(workoutInputSchema.safeParse({ ...valid, equipment: [] }).success).toBe(false)
  })

  it("rejects frequency above 7", () => {
    expect(workoutInputSchema.safeParse({ ...valid, frequency: 8 }).success).toBe(false)
  })

  it("coerces frequency string to number", () => {
    const result = workoutInputSchema.safeParse({ ...valid, frequency: "4" })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.frequency).toBe(4)
  })
})

describe("nutritionInputSchema", () => {
  const valid = {
    goal: "muscle_gain",
    preference: "omnivore",
    mealsPerDay: 4,
  }

  it("accepts minimal valid input", () => {
    expect(nutritionInputSchema.safeParse(valid).success).toBe(true)
  })

  it("rejects invalid goal", () => {
    expect(nutritionInputSchema.safeParse({ ...valid, goal: "bulk" }).success).toBe(false)
  })

  it("rejects mealsPerDay above 6", () => {
    expect(nutritionInputSchema.safeParse({ ...valid, mealsPerDay: 7 }).success).toBe(false)
  })
})

describe("contentInputSchema", () => {
  const valid = {
    type: "caption_ig",
    tone: "motivating",
    length: "medium",
    topic: "Comment prendre de la masse musculaire",
  }

  it("accepts valid input", () => {
    expect(contentInputSchema.safeParse(valid).success).toBe(true)
  })

  it("rejects empty topic", () => {
    expect(contentInputSchema.safeParse({ ...valid, topic: "" }).success).toBe(false)
  })

  it("rejects invalid type", () => {
    expect(contentInputSchema.safeParse({ ...valid, type: "tweet" }).success).toBe(false)
  })
})
