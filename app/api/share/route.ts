import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { randomBytes } from "crypto"

const bodySchema = z.object({
  resourceType: z.enum(["program", "nutrition", "content"]),
  resourceId: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

  const { resourceType, resourceId } = parsed.data

  // Verify ownership
  const table =
    resourceType === "program" ? "workout_programs" : resourceType === "nutrition" ? "nutrition_plans" : "social_contents"

  const { data: resource } = await supabase.from(table).select("id").eq("id", resourceId).eq("user_id", user.id).single()
  if (!resource) return NextResponse.json({ error: "Resource not found" }, { status: 404 })

  const token = randomBytes(24).toString("base64url")
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase.from("share_tokens").insert({
    token,
    resource_type: resourceType,
    resource_id: resourceId,
    user_id: user.id,
    expires_at: expiresAt,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ token })
}
