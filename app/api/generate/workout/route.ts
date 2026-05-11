import { NextRequest, NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { getModel } from "@/lib/ai/client"
import { withQuotaCheck, QuotaExceededError } from "@/lib/ai/quota-guard"
import { trackUsage } from "@/lib/ai/cost-tracker"
import { workoutInputSchema, workoutProgramSchema } from "@/lib/ai/schemas/workout"
import { buildWorkoutPrompt } from "@/lib/ai/prompts/workout"
import { generateObject } from "ai"
import { checkAiRateLimit } from "@/lib/rate-limit"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const rateLimitResponse = await checkAiRateLimit(user.id)
  if (rateLimitResponse) return rateLimitResponse

  const body = await req.json()
  const parsed = workoutInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides", issues: parsed.error.issues }, { status: 400 })
  }

  try {
    const result = await withQuotaCheck(user.id, "programs", async () => {
      const { object, usage } = await generateObject({
        model: getModel(),
        schema: workoutProgramSchema,
        prompt: buildWorkoutPrompt(parsed.data),
      })

      await trackUsage(user.id, "programs", {
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
      }, process.env.OPENAI_MODEL ?? "gpt-4o")

      return object
    })

    // Save to database
    const adminClient = await createAdminClient()
    const { data: saved, error: saveError } = await adminClient
      .from("workout_programs")
      .insert({
        user_id: user.id,
        title: result.title,
        inputs: parsed.data,
        output: result,
      })
      .select("id")
      .single()

    if (saveError) {
      return NextResponse.json({ error: "Erreur de sauvegarde" }, { status: 500 })
    }

    return NextResponse.json({ id: saved.id, data: result })
  } catch (err) {
    if (err instanceof QuotaExceededError) {
      return NextResponse.json({ error: "QUOTA_EXCEEDED", message: err.message, plan: err.plan }, { status: 429 })
    }
    console.error("Workout generation error:", err)
    return NextResponse.json({ error: "Erreur de génération" }, { status: 500 })
  }
}
