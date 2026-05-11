import { z } from "zod"

export const mealSchema = z.object({
  name: z.string(),
  time: z.string(),
  foods: z.array(
    z.object({
      food: z.string(),
      quantity: z.string(),
      calories: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fat: z.number(),
    })
  ),
  totalCalories: z.number(),
  totalProtein: z.number(),
  totalCarbs: z.number(),
  totalFat: z.number(),
})

export const dayPlanSchema = z.object({
  day: z.string(),
  meals: z.array(mealSchema),
  dailyCalories: z.number(),
  dailyProtein: z.number(),
  dailyCarbs: z.number(),
  dailyFat: z.number(),
})

export const nutritionPlanSchema = z.object({
  title: z.string(),
  targetCalories: z.number(),
  targetProtein: z.number(),
  targetCarbs: z.number(),
  targetFat: z.number(),
  overview: z.string(),
  days: z.array(dayPlanSchema),
  shoppingList: z.array(z.string()),
  tips: z.array(z.string()),
})

export type NutritionPlanOutput = z.infer<typeof nutritionPlanSchema>

export const nutritionInputSchema = z.object({
  goal: z.enum(["weight_loss", "maintenance", "muscle_gain"]),
  targetCalories: z.coerce.number().int().min(1000).max(6000).optional(),
  age: z.coerce.number().int().min(15).max(80).optional(),
  weight: z.coerce.number().min(30).max(300).optional(),
  height: z.coerce.number().min(100).max(250).optional(),
  sex: z.enum(["male", "female"]).optional(),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]).optional(),
  preference: z.enum(["omnivore", "vegetarian", "vegan", "halal", "kosher"]),
  allergies: z.string().optional(),
  mealsPerDay: z.coerce.number().int().min(3).max(6),
})

export type NutritionInput = z.infer<typeof nutritionInputSchema>
