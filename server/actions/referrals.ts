"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type ReferralCodeRow = Database["public"]["Tables"]["referral_codes"]["Row"];
type ReferralRow = Database["public"]["Tables"]["referrals"]["Row"];

// Schéma de validation pour l'enregistrement d'un parrainage
const recordReferralSchema = z.object({
  referredUserId: z.string().uuid(),
  code: z.string().min(1).max(20),
});

/**
 * Récupère le code de parrainage existant de l'utilisateur connecté,
 * ou en génère un nouveau s'il n'en a pas encore.
 */
export async function getOrCreateReferralCode(): Promise<{ code: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  // Recherche d'un code existant pour cet utilisateur
  const { data: existing } = await supabase
    .from("referral_codes")
    .select("code")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return { code: (existing as Pick<ReferralCodeRow, "code">).code };
  }

  // Génération du code : 6 premiers caractères de l'UUID en majuscules + "-" + 4 caractères hexadécimaux aléatoires
  const prefix = user.id.replace(/-/g, "").slice(0, 6).toUpperCase();
  const suffix = Math.floor(Math.random() * 0x10000)
    .toString(16)
    .toUpperCase()
    .padStart(4, "0");
  const code = `${prefix}-${suffix}`;

  const { data: inserted, error: insertError } = await supabase
    .from("referral_codes")
    .insert({ user_id: user.id, code })
    .select("code")
    .single();

  if (insertError || !inserted) {
    // En cas de conflit de concurrence (rare), on relit le code déjà créé
    const { data: retry } = await supabase
      .from("referral_codes")
      .select("code")
      .eq("user_id", user.id)
      .single();

    if (!retry) {
      throw new Error("Impossible de créer le code de parrainage");
    }

    return { code: (retry as Pick<ReferralCodeRow, "code">).code };
  }

  return { code: (inserted as Pick<ReferralCodeRow, "code">).code };
}

/**
 * Retourne les statistiques de parrainage de l'utilisateur connecté.
 */
export async function getReferralStats(): Promise<{
  total: number;
  converted: number;
  pending: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data } = await supabase
    .from("referrals")
    .select("status")
    .eq("referrer_id", user.id);

  const rows = (data ?? []) as Pick<ReferralRow, "status">[];

  const total = rows.length;
  const converted = rows.filter(
    (r) => r.status === "converted" || r.status === "rewarded"
  ).length;
  const pending = rows.filter((r) => r.status === "pending").length;

  return { total, converted, pending };
}

/**
 * Enregistre un parrainage lorsqu'un nouvel utilisateur s'inscrit avec un code.
 * Utilise le client admin pour contourner les RLS (l'utilisateur parrainé vient de s'inscrire).
 */
export async function recordReferral(
  referredUserId: string,
  code: string
): Promise<{ error?: string }> {
  // Validation des entrées
  const parsed = recordReferralSchema.safeParse({ referredUserId, code });
  if (!parsed.success) {
    return { error: "Paramètres invalides" };
  }

  const { referredUserId: validReferredId, code: validCode } = parsed.data;

  // Utilisation du client admin pour bypasser les RLS
  const adminClient = createAdminClient();

  // Recherche du code de parrainage (insensible à la casse)
  const { data: codeRow } = await adminClient
    .from("referral_codes")
    .select("user_id, code")
    .ilike("code", validCode)
    .maybeSingle();

  if (!codeRow) {
    return { error: "Code invalide" };
  }

  const referrerId = (codeRow as Pick<ReferralCodeRow, "user_id" | "code">).user_id;
  const normalizedCode = (codeRow as Pick<ReferralCodeRow, "user_id" | "code">).code;

  // Vérification anti-auto-parrainage
  if (referrerId === validReferredId) {
    return { error: "Auto-parrainage non autorisé" };
  }

  // Insertion du parrainage — on ignore silencieusement les conflits
  // (referred_id a une contrainte UNIQUE : un seul parrain possible)
  const { error: insertError } = await adminClient.from("referrals").insert({
    referrer_id: referrerId,
    referred_id: validReferredId,
    code: normalizedCode,
    status: "pending",
  });

  // Code 23505 = violation de contrainte unique (already has a referrer) → ignorer
  if (insertError && insertError.code !== "23505") {
    return { error: "Erreur lors de l'enregistrement du parrainage" };
  }

  return {};
}
