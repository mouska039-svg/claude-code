"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const MASTER_KEY = Buffer.from(process.env.ANAMNESE_MASTER_KEY ?? "0".repeat(64), "hex");

function encrypt(text: string): { encrypted: string; iv: string } {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", MASTER_KEY, iv);
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    encrypted: Buffer.concat([enc, tag]).toString("base64"),
    iv: iv.toString("hex"),
  };
}

function decrypt(encrypted: string, ivHex: string): string {
  const iv = Buffer.from(ivHex, "hex");
  const buf = Buffer.from(encrypted, "base64");
  const tag = buf.subarray(buf.length - 16);
  const enc = buf.subarray(0, buf.length - 16);
  const decipher = crypto.createDecipheriv("aes-256-gcm", MASTER_KEY, iv);
  decipher.setAuthTag(tag);
  return decipher.update(enc) + decipher.final("utf8");
}

export async function saveAnamnese(
  clientId: string,
  data: Record<string, string>
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { encrypted, iv } = encrypt(JSON.stringify(data));

  const { data: existing } = await supabase
    .from("anamneses")
    .select("id")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("anamneses")
      .update({ data: { encrypted, iv } })
      .eq("id", existing.id);

    if (error) return { error: "Erreur lors de la sauvegarde de l'anamnèse" };
  } else {
    const { error } = await supabase.from("anamneses").insert({
      client_id: clientId,
      data: { encrypted, iv },
    });

    if (error) return { error: "Erreur lors de la sauvegarde de l'anamnèse" };
  }

  return { success: true };
}

export async function getAnamnese(
  clientId: string
): Promise<Record<string, string> | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data } = await supabase
    .from("anamneses")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  const stored = data.data as { encrypted?: string; iv?: string } | null;
  if (!stored || typeof stored !== "object" || !stored.encrypted || !stored.iv) {
    return null;
  }

  try {
    const decrypted = decrypt(stored.encrypted, stored.iv);
    return JSON.parse(decrypted) as Record<string, string>;
  } catch {
    return null;
  }
}
