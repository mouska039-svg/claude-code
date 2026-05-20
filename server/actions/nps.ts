"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const npsSchema = z.object({
  score: z.number().int().min(0).max(10),
  comment: z.string().max(500).optional(),
});

export async function submitNps(
  score: number,
  comment?: string
): Promise<{ error?: string; success?: boolean }> {
  const parsed = npsSchema.safeParse({ score, comment });
  if (!parsed.success) {
    return { error: "Données invalides." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { error } = await supabase.from("nps_responses").upsert(
    {
      user_id: user.id,
      score: parsed.data.score,
      comment: parsed.data.comment ?? null,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return { error: "Une erreur est survenue. Veuillez réessayer." };
  }

  return { success: true };
}

export async function getNpsStatus(): Promise<{
  responded: boolean;
  score?: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { responded: false };
  }

  const { data } = await supabase
    .from("nps_responses")
    .select("score")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) {
    return { responded: false };
  }

  return { responded: true, score: data.score };
}
