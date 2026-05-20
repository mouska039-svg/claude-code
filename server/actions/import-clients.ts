"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { parseCsvContent } from "@/lib/csv-parser";
import type { ImportSource, ParsedClient, ImportResult } from "@/lib/import-clients";

export type { ImportSource, ParsedClient, ImportResult };

const parseSchema = z.object({
  source: z.enum(["itiaki", "jupiterre", "maddie", "csv"]),
  content: z.string().min(1).max(5_000_000),
});

export async function previewImport(
  formData: FormData
): Promise<{ error?: string; rows?: ParsedClient[] }> {
  const raw = {
    source: formData.get("source"),
    content: formData.get("content"),
  };
  const parsed = parseSchema.safeParse(raw);
  if (!parsed.success) return { error: "Données invalides" };

  const rows = parseCsvContent(parsed.data.content, parsed.data.source);
  if (rows.length === 0) return { error: "Aucun client trouvé dans ce fichier." };

  return { rows: rows.slice(0, 200) };
}

const importSchema = z.object({
  rows: z
    .array(
      z.object({
        full_name: z.string().min(1).max(200),
        email: z.string().email().nullable(),
        phone: z.string().max(30).nullable(),
        birth_date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .nullable(),
        primary_concern: z.string().max(500).nullable(),
      })
    )
    .min(1)
    .max(200),
});

export async function importClients(
  rows: ParsedClient[]
): Promise<{ error?: string; result?: ImportResult }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const parsed = importSchema.safeParse({ rows });
  if (!parsed.success) return { error: "Données invalides" };

  const { data: existing } = await supabase
    .from("clients")
    .select("email")
    .eq("user_id", user.id)
    .not("email", "is", null);

  const existingEmails = new Set(
    (existing ?? []).map((c) => c.email?.toLowerCase()).filter(Boolean)
  );

  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of parsed.data.rows) {
    const emailLower = row.email?.toLowerCase() ?? null;
    if (emailLower && existingEmails.has(emailLower)) {
      skipped++;
      continue;
    }

    const { error } = await supabase.from("clients").insert({
      user_id: user.id,
      full_name: row.full_name,
      email: emailLower,
      phone: row.phone,
      birth_date: row.birth_date,
      primary_concern: row.primary_concern,
      status: "active",
    });

    if (error) {
      errors.push(row.full_name);
    } else {
      inserted++;
      if (emailLower) existingEmails.add(emailLower);
    }
  }

  return { result: { inserted, skipped, errors } };
}
