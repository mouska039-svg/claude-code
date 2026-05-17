"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const signUpSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  specialty: z.enum(["naturopathe", "sophrologue", "hypnotherapeute", "multi"]),
});

const forgotSchema = z.object({
  email: z.string().email(),
});

const resetSchema = z.object({
  password: z.string().min(8),
});

export async function signIn(
  input: z.infer<typeof signInSchema>
): Promise<{ error?: string }> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) return { error: "Données invalides" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (
      error.message.includes("Invalid login credentials") ||
      error.message.includes("invalid_credentials")
    ) {
      return { error: "Email ou mot de passe incorrect" };
    }
    return { error: "Une erreur est survenue. Veuillez réessayer." };
  }

  return {};
}

export async function signUp(
  input: z.infer<typeof signUpSchema>
): Promise<{ error?: string }> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) return { error: "Données invalides" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.full_name,
        specialty: parsed.data.specialty,
        locale: "fr",
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "Cet email est déjà utilisé" };
    }
    return { error: "Une erreur est survenue. Veuillez réessayer." };
  }

  return {};
}

export async function forgotPassword(
  input: z.infer<typeof forgotSchema>
): Promise<{ error?: string }> {
  const parsed = forgotSchema.safeParse(input);
  if (!parsed.success) return { error: "Email invalide" };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  if (error) {
    return { error: "Une erreur est survenue. Veuillez réessayer." };
  }

  return {};
}

export async function resetPassword(
  input: z.infer<typeof resetSchema>
): Promise<{ error?: string }> {
  const parsed = resetSchema.safeParse(input);
  if (!parsed.success) return { error: "Mot de passe invalide (8 caractères minimum)" };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Une erreur est survenue. Veuillez réessayer." };
  }

  return {};
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
