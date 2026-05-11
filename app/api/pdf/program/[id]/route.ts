import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { renderToBuffer } from "@react-pdf/renderer"
import type { DocumentProps } from "@react-pdf/renderer"
import { ProgramPDF } from "@/lib/pdf/program-pdf"
import type { WorkoutProgramOutput } from "@/lib/ai/schemas/workout"
import type { NextRequest } from "next/server"
import React from "react"

export const runtime = "nodejs"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const [{ data: program }, { data: profile }] = await Promise.all([
    supabase.from("workout_programs").select("*").eq("id", id).eq("user_id", user.id).single(),
    supabase.from("profiles").select("brand_name, brand_color").eq("id", user.id).single(),
  ])

  if (!program) return new Response("Not found", { status: 404 })

  const output = program.output as WorkoutProgramOutput
  const brandName = profile?.brand_name ?? "FitCoach AI"
  const brandColor = profile?.brand_color ?? undefined
  const generatedAt = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const element = React.createElement(ProgramPDF, { program: output, brandName, brandColor, generatedAt }) as React.ReactElement<DocumentProps>
  const buffer = await renderToBuffer(element)

  const filename = `programme-${output.title.toLowerCase().replace(/\s+/g, "-")}.pdf`

  return new Response(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, max-age=3600",
    },
  })
}
