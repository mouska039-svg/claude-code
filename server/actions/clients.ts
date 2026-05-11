"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { redirect } from "next/navigation"
import { sanitizeHtml } from "@/lib/sanitize"

const clientSchema = z.object({
  full_name: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  goal: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
})

const measurementSchema = z.object({
  date: z.string(),
  weight: z.coerce.number().optional(),
  body_fat: z.coerce.number().optional(),
})

const noteSchema = z.object({
  content: z.string().min(1, "Note requise"),
})

type Result = { error: string } | { success: string }

export async function createClientAction(_prev: Result | null, formData: FormData): Promise<Result> {
  const parsed = clientSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    goal: formData.get("goal"),
    notes: formData.get("notes"),
    tags: formData.get("tags"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Données invalides" }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Non authentifié" }

  const tags = parsed.data.tags
    ? parsed.data.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : []

  const { data: client, error } = await supabase
    .from("clients")
    .insert({
      user_id: user.id,
      full_name: parsed.data.full_name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      goal: parsed.data.goal || null,
      notes: parsed.data.notes || null,
      tags,
    })
    .select("id")
    .single()

  if (error) return { error: error.message }

  redirect(`/dashboard/clients/${client.id}`)
}

export async function updateClientAction(clientId: string, _prev: Result | null, formData: FormData): Promise<Result> {
  const parsed = clientSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    goal: formData.get("goal"),
    notes: formData.get("notes"),
    tags: formData.get("tags"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Données invalides" }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Non authentifié" }

  const tags = parsed.data.tags
    ? parsed.data.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : []

  const { error } = await supabase
    .from("clients")
    .update({ ...parsed.data, tags, email: parsed.data.email || null })
    .eq("id", clientId)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/clients/${clientId}`)
  return { success: "Client mis à jour" }
}

export async function addMeasurement(clientId: string, _prev: Result | null, formData: FormData): Promise<Result> {
  const parsed = measurementSchema.safeParse({
    date: formData.get("date"),
    weight: formData.get("weight"),
    body_fat: formData.get("body_fat"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Données invalides" }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Non authentifié" }

  const { error } = await supabase.from("client_measurements").insert({
    client_id: clientId,
    date: parsed.data.date,
    weight: parsed.data.weight ?? null,
    body_fat: parsed.data.body_fat ?? null,
    measurements: {},
  })

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/clients/${clientId}`)
  return { success: "Mesure ajoutée" }
}

export async function addNote(clientId: string, _prev: Result | null, formData: FormData): Promise<Result> {
  const parsed = noteSchema.safeParse({ content: formData.get("content") })
  if (!parsed.success) return { error: "Note invalide" }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Non authentifié" }

  const { error } = await supabase.from("client_notes").insert({
    client_id: clientId,
    content: sanitizeHtml(parsed.data.content),
  })

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/clients/${clientId}`)
  return { success: "Note ajoutée" }
}

export async function assignProgram(clientId: string, programId: string): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("client_assignments").insert({
    client_id: clientId,
    program_id: programId,
  })
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/clients/${clientId}`)
  return { success: "Programme assigné" }
}

export async function assignNutrition(clientId: string, nutritionId: string): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase.from("client_assignments").insert({
    client_id: clientId,
    nutrition_id: nutritionId,
  })
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/clients/${clientId}`)
  return { success: "Plan nutrition assigné" }
}
