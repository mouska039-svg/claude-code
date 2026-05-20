"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

export type ClientConsent = Database["public"]["Tables"]["client_consents"]["Row"];

const consentTypeEnum = z.enum(["data_processing", "health_data", "photo", "marketing"]);

const upsertConsentSchema = z.object({
  clientId: z.string().uuid("Identifiant client invalide"),
  consentType: consentTypeEnum,
  granted: z.boolean(),
});

export async function getClientConsents(clientId: string): Promise<ClientConsent[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data, error } = await supabase
    .from("client_consents")
    .select("*")
    .eq("client_id", clientId)
    .eq("practitioner_id", user.id)
    .order("created_at", { ascending: true });

  if (error) return [];

  return data ?? [];
}

export async function upsertConsent(
  clientId: string,
  consentType: string,
  granted: boolean
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const parsed = upsertConsentSchema.safeParse({ clientId, consentType, granted });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const now = new Date().toISOString();

  const { error } = await supabase.from("client_consents").upsert(
    {
      client_id: parsed.data.clientId,
      practitioner_id: user.id,
      consent_type: parsed.data.consentType,
      granted: parsed.data.granted,
      signed_at: parsed.data.granted ? now : null,
      revoked_at: parsed.data.granted ? null : now,
    },
    {
      onConflict: "client_id,practitioner_id,consent_type",
    }
  );

  if (error) {
    return { error: "Impossible de mettre à jour le consentement." };
  }

  return {};
}

export async function requestClientDeletion(
  clientId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const parsed = z.string().uuid().safeParse(clientId);
  if (!parsed.success) {
    return { error: "Identifiant client invalide." };
  }

  const { error } = await supabase.from("deletion_requests").insert({
    client_id: parsed.data,
    practitioner_id: user.id,
  });

  if (error) {
    return { error: "Impossible d'enregistrer la demande de suppression." };
  }

  return {};
}
