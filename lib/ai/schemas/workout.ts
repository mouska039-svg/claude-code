import { z } from "zod"

export const exerciseSchema = z.object({
  name: z.string(),
  sets: z.number().int().min(1).max(10),
  reps: z.string(), // "8-12" or "AMRAP" etc.
  rest: z.string(), // "60s", "2min"
  tempo: z.string().nullable(),
  notes: z.string().nullable(),
})

export const daySchema = z.object({
  name: z.string(),
  focus: z.string(),
  exercises: z.array(exerciseSchema),
})

export const weekSchema = z.object({
  weekNumber: z.number().int().min(1),
  days: z.array(daySchema),
})

export const workoutProgramSchema = z.object({
  title: z.string(),
  durationWeeks: z.number().int().min(1).max(52),
  overview: z.string(),
  weeks: z.array(weekSchema),
  progressionNotes: z.string().nullable(),
})

export type WorkoutProgramOutput = z.infer<typeof workoutProgramSchema>

export const workoutInputSchema = z.object({
  goal: z.enum(["strength", "hypertrophy", "weight_loss", "endurance", "general"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  frequency: z.coerce.number().int().min(1).max(7),
  equipment: z.array(z.string()).min(1),
  sessionDuration: z.coerce.number().int().min(20).max(120),
  injuries: z.string().optional(),
  clientName: z.string().optional(),
})

export type WorkoutInput = z.infer<typeof workoutInputSchema>
