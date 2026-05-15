import { z } from "zod"

export const contentOutputSchema = z.object({
  variants: z.array(z.string()).min(5).max(5),
  hashtags: z.array(z.string()).nullable(),
})

export type ContentOutput = z.infer<typeof contentOutputSchema>

export const contentInputSchema = z.object({
  type: z.enum(["caption_ig", "hook_tiktok", "reel_idea", "cta", "viral_hook"]),
  tone: z.enum(["motivating", "professional", "aggressive", "luxury"]),
  topic: z.string().min(3).max(200),
  length: z.enum(["short", "medium", "long"]),
})

export type ContentInput = z.infer<typeof contentInputSchema>
