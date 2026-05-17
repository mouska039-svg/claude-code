"use server";

import { z } from "zod";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkQuota, incrementQuota } from "@/lib/quotas";
import type { Database } from "@/types/supabase";

type ProtocolRow = Database["public"]["Tables"]["protocols"]["Row"];

const RGPD_DISCLAIMER =
  "Ces recommandations relèvent du conseil en hygiène de vie et ne se substituent pas à un avis médical. Consultez votre médecin avant toute modification de traitement.";

const protocolOutputSchema = z.object({
  title: z.string(),
  summary: z.string(),
  duration_weeks: z.number().int().min(1).max(52),
  steps: z.array(
    z.object({
      week: z.string(),
      recommendations: z.array(z.string()),
    })
  ),
  lifestyle: z.object({
    nutrition: z.array(z.string()),
    sleep: z.array(z.string()),
    movement: z.array(z.string()),
    stress: z.array(z.string()),
  }),
  contraindications: z.array(z.string()),
});

export async function generateProtocol(
  clientId: string,
  specialty: "naturopathe" | "sophrologue" | "hypnotherapeute",
  context: string
): Promise<{ error?: string; success?: boolean; data?: ProtocolRow }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const quota = await checkQuota(user.id, "protocols");
  if (!quota.allowed) {
    return {
      error: `Quota de protocoles atteint pour ce mois (plan ${quota.plan}). Veuillez passer à un plan supérieur.`,
    };
  }

  const specialtyLabels: Record<string, string> = {
    naturopathe: "naturopathie",
    sophrologue: "sophrologie",
    hypnotherapeute: "hypnothérapie",
  };

  const systemPrompt = `Tu es un assistant pour praticien de ${specialtyLabels[specialty]}. Tu génères des protocoles de conseil en hygiène de vie personnalisés. Tu NE poses JAMAIS de diagnostic médical. Tes recommandations sont uniquement des conseils en hygiène de vie. Tu réponds en français.`;

  const userPrompt = `Génère un protocole de conseil en hygiène de vie pour un client avec le contexte suivant : ${context}. Spécialité du praticien : ${specialtyLabels[specialty]}.`;

  let result: z.infer<typeof protocolOutputSchema>;
  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: protocolOutputSchema,
      system: systemPrompt,
      prompt: userPrompt,
    });
    result = object;
  } catch {
    return { error: "Erreur lors de la génération du protocole IA" };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("protocols")
    .insert({
      client_id: clientId,
      practitioner_id: user.id,
      title: result.title,
      inputs: {
        specialty,
        context,
      } as Database["public"]["Tables"]["protocols"]["Insert"]["inputs"],
      output: {
        ...result,
        disclaimer: RGPD_DISCLAIMER,
      } as Database["public"]["Tables"]["protocols"]["Insert"]["output"],
      duration_weeks: result.duration_weeks,
      status: "draft",
    })
    .select("*")
    .single();

  if (insertError) {
    return { error: "Erreur lors de la sauvegarde du protocole" };
  }

  await incrementQuota(user.id, "protocols");

  return { success: true, data: inserted as ProtocolRow };
}

export async function getProtocols(clientId?: string): Promise<ProtocolRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  let query = supabase
    .from("protocols")
    .select("*")
    .eq("practitioner_id", user.id)
    .order("created_at", { ascending: false });

  if (clientId) {
    query = query.eq("client_id", clientId);
  }

  const { data } = await query;
  return (data ?? []) as ProtocolRow[];
}

export async function updateProtocolStatus(
  protocolId: string,
  status: "draft" | "active" | "completed"
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { error } = await supabase
    .from("protocols")
    .update({ status })
    .eq("id", protocolId)
    .eq("practitioner_id", user.id);

  if (error) {
    return { error: "Erreur lors de la mise à jour du statut" };
  }

  return { success: true };
}
