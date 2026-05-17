"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Database } from "@/types/supabase";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type ShareTokenRow = Database["public"]["Tables"]["share_tokens"]["Row"];

export async function createShareToken(
  clientId: string
): Promise<{ token?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from("share_tokens").insert({
    token,
    resource_type: "client_portal",
    resource_id: clientId,
    expires_at: expiresAt,
  });

  if (error) {
    return { error: "Erreur lors de la création du lien de partage" };
  }

  return { token };
}

export async function getShareToken(token: string): Promise<{
  shareToken?: ShareTokenRow;
  client?: ClientRow;
  error?: string;
}> {
  const supabase = await createClient();

  const { data: shareToken } = await supabase
    .from("share_tokens")
    .select("*")
    .eq("token", token)
    .eq("resource_type", "client_portal")
    .maybeSingle();

  if (!shareToken) {
    return { error: "Lien invalide ou introuvable" };
  }

  if (new Date(shareToken.expires_at) < new Date()) {
    return { error: "Ce lien a expiré. Demandez un nouveau lien à votre praticien." };
  }

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", shareToken.resource_id)
    .maybeSingle();

  if (!client) {
    return { error: "Client introuvable" };
  }

  return {
    shareToken: shareToken as ShareTokenRow,
    client: client as ClientRow,
  };
}
