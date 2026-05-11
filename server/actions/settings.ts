"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import Stripe from "stripe"

const profileSchema = z.object({
  full_name: z.string().min(1, "Nom requis"),
  locale: z.enum(["fr", "en"]),
})

const brandingSchema = z.object({
  brand_name: z.string().max(60),
  brand_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Couleur invalide"),
  slogan: z.string().max(120),
})

const passwordSchema = z
  .object({
    password: z.string().min(8, "Au moins 8 caractères"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

type Result = { error: string } | { success: string }

export async function updateProfile(_prev: Result | null, formData: FormData): Promise<Result> {
  const parsed = profileSchema.safeParse({
    full_name: formData.get("full_name"),
    locale: formData.get("locale"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Données invalides" }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Non authentifié" }

  const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user.id)
  if (error) return { error: error.message }

  revalidatePath("/dashboard/settings")
  return { success: "Profil mis à jour" }
}

export async function updateBranding(_prev: Result | null, formData: FormData): Promise<Result> {
  const parsed = brandingSchema.safeParse({
    brand_name: formData.get("brand_name"),
    brand_color: formData.get("brand_color"),
    slogan: formData.get("slogan"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Données invalides" }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Non authentifié" }

  const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user.id)
  if (error) return { error: error.message }

  revalidatePath("/dashboard/settings")
  return { success: "Branding mis à jour" }
}

export async function updatePassword(_prev: Result | null, formData: FormData): Promise<Result> {
  const parsed = passwordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Données invalides" }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) return { error: error.message }

  return { success: "Mot de passe modifié" }
}

export async function deleteAccount(): Promise<Result> {
  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Non authentifié" }

  // Cancel Stripe subscription
  const { data: subscription } = await adminClient
    .from("subscriptions")
    .select("stripe_subscription_id, stripe_customer_id")
    .eq("user_id", user.id)
    .single()

  if (subscription?.stripe_subscription_id) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
      await stripe.subscriptions.cancel(subscription.stripe_subscription_id)
    } catch {
      // Continue even if Stripe fails
    }
  }

  // Delete user (cascade handles DB cleanup)
  const { error } = await adminClient.auth.admin.deleteUser(user.id)
  if (error) return { error: error.message }

  return { success: "Compte supprimé" }
}

export async function exportUserData(): Promise<{ data: unknown } | { error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Non authentifié" }

  const [profile, programs, nutrition, content, clients] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("workout_programs").select("*").eq("user_id", user.id),
    supabase.from("nutrition_plans").select("*").eq("user_id", user.id),
    supabase.from("social_contents").select("*").eq("user_id", user.id),
    supabase.from("clients").select("*").eq("user_id", user.id),
  ])

  return {
    data: {
      profile: profile.data,
      programs: programs.data,
      nutrition: nutrition.data,
      content: content.data,
      clients: clients.data,
      exportedAt: new Date().toISOString(),
    },
  }
}
