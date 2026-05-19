"use server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const profileSchema = z.object({
  full_name: z.string().min(1, "Le nom est requis").max(100),
  specialty: z
    .enum(["naturopathe", "sophrologue", "hypnotherapeute", "multi"])
    .nullable()
    .optional(),
  siret: z.string().max(14).nullable().optional(),
  rpps_or_adeli: z.string().max(20).nullable().optional(),
});

const brandingSchema = z.object({
  brand_name: z.string().max(100).nullable().optional(),
  brand_logo_url: z.string().url("URL invalide").or(z.literal("")).nullable().optional(),
  brand_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Couleur invalide")
    .nullable()
    .optional(),
  slogan: z.string().max(200).nullable().optional(),
});

export async function updateProfile(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const tab = formData.get("tab") as string | null;

  if (tab === "branding") {
    const raw = {
      brand_name: (formData.get("brand_name") as string | null) ?? null,
      brand_logo_url: (formData.get("brand_logo_url") as string | null) ?? null,
      brand_color: (formData.get("brand_color") as string | null) ?? null,
      slogan: (formData.get("slogan") as string | null) ?? null,
    };

    const parsed = brandingSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        brand_name:
          parsed.data.brand_name !== undefined
            ? (parsed.data.brand_name ?? null)
            : undefined,
        brand_logo_url:
          parsed.data.brand_logo_url !== undefined
            ? parsed.data.brand_logo_url === ""
              ? null
              : (parsed.data.brand_logo_url ?? null)
            : undefined,
        brand_color:
          parsed.data.brand_color !== undefined
            ? (parsed.data.brand_color ?? null)
            : undefined,
        slogan:
          parsed.data.slogan !== undefined ? (parsed.data.slogan ?? null) : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    if (error) return { error: error.message };
    return { success: true };
  }

  // Default: profile tab
  const raw = {
    full_name: formData.get("full_name") as string,
    specialty: (formData.get("specialty") as string | null) || null,
    siret: (formData.get("siret") as string | null) || null,
    rpps_or_adeli: (formData.get("rpps_or_adeli") as string | null) || null,
  };

  const street = (formData.get("address_street") as string | null) || "";
  const postal_code = (formData.get("address_postal_code") as string | null) || "";
  const city = (formData.get("address_city") as string | null) || "";
  const country = (formData.get("address_country") as string | null) || "";
  const address_json =
    street || postal_code || city || country
      ? { street, postal_code, city, country }
      : null;

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      specialty: parsed.data.specialty ?? null,
      siret: parsed.data.siret ?? null,
      rpps_or_adeli: parsed.data.rpps_or_adeli ?? null,
      address_json,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

const passwordSchema = z
  .object({
    new_password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm_password"],
  });

export async function changePassword(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const raw = {
    new_password: formData.get("new_password") as string,
    confirm_password: formData.get("confirm_password") as string,
  };

  const parsed = passwordSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.new_password,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteAccount(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // Sign out first, then delete the profile (DB cascade handles related data)
  await supabase.auth.signOut();
  // Note: actual user deletion from auth requires service role or user-initiated via Supabase.
  // The profile delete triggers cascade on related tables.
  await supabase.from("profiles").delete().eq("id", user.id);

  redirect("/");
}
