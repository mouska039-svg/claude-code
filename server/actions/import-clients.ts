"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type ImportSource = "itiaki" | "jupiterre" | "maddie" | "csv";

export interface ParsedClient {
  full_name: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  primary_concern: string | null;
}

export interface ImportResult {
  inserted: number;
  skipped: number;
  errors: string[];
}

// ── CSV utils ─────────────────────────────────────────────────────────────────

function detectDelimiter(line: string): ";" | "," | "\t" {
  const counts = { ";": 0, ",": 0, "\t": 0 } as Record<string, number>;
  for (const ch of line) {
    if (ch in counts) counts[ch]++;
  }
  if (counts[";"] >= counts[","] && counts[";"] >= counts["\t"]) return ";";
  if (counts["\t"] > counts[","]) return "\t";
  return ",";
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuote = !inQuote;
      }
    } else if (ch === delimiter && !inQuote) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

// ── Column mappings per source ────────────────────────────────────────────────

const COLUMN_MAP: Record<ImportSource, Record<string, keyof ParsedClient>> = {
  itiaki: {
    prenom: "full_name",
    nom: "full_name",
    email: "email",
    telephone: "phone",
    portable: "phone",
    date_de_naissance: "birth_date",
    motif: "primary_concern",
    plainte_principale: "primary_concern",
  },
  jupiterre: {
    firstname: "full_name",
    lastname: "full_name",
    prenom: "full_name",
    nom: "full_name",
    email: "email",
    phone: "phone",
    telephone: "phone",
    birth_date: "birth_date",
    date_naissance: "birth_date",
    concern: "primary_concern",
    motif: "primary_concern",
  },
  maddie: {
    nom_complet: "full_name",
    full_name: "full_name",
    email: "email",
    portable: "phone",
    telephone: "phone",
    date_naissance: "birth_date",
    motif_consultation: "primary_concern",
  },
  csv: {
    nom_complet: "full_name",
    full_name: "full_name",
    nom: "full_name",
    prenom: "full_name",
    name: "full_name",
    email: "email",
    mail: "email",
    telephone: "phone",
    portable: "phone",
    phone: "phone",
    tel: "phone",
    date_naissance: "birth_date",
    birth_date: "birth_date",
    ddn: "birth_date",
    motif: "primary_concern",
    primary_concern: "primary_concern",
    plainte: "primary_concern",
    concern: "primary_concern",
  },
};

// ── Parser ────────────────────────────────────────────────────────────────────

function normalizeDateFr(raw: string): string | null {
  if (!raw) return null;
  const cleaned = raw.trim();
  // DD/MM/YYYY or DD-MM-YYYY
  const frMatch = cleaned.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (frMatch)
    return `${frMatch[3]}-${frMatch[2].padStart(2, "0")}-${frMatch[1].padStart(2, "0")}`;
  // YYYY-MM-DD already
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned;
  return null;
}

function normalizePhone(raw: string): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[\s.\-()]/g, "");
  if (digits.length < 8) return null;
  return digits;
}

export function parseCsvContent(content: string, source: ImportSource): ParsedClient[] {
  // Strip BOM
  const text = content.startsWith("﻿") ? content.slice(1) : content;
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const delimiter = detectDelimiter(lines[0]);
  const rawHeaders = parseCsvLine(lines[0], delimiter);
  const headers = rawHeaders.map(normalizeHeader);

  const map = COLUMN_MAP[source];

  // Build index → field mapping
  const colMapping: Array<{
    index: number;
    field: keyof ParsedClient;
    isSecondName: boolean;
  }> = [];
  headers.forEach((h, i) => {
    const field = map[h];
    if (field) {
      const isSecondName =
        field === "full_name" &&
        colMapping.some((c) => c.field === "full_name" && !c.isSecondName);
      colMapping.push({ index: i, field, isSecondName });
    }
  });

  const parsed: ParsedClient[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i], delimiter);
    const row: Partial<ParsedClient> = {};
    let firstName = "";
    let lastName = "";

    for (const { index, field, isSecondName } of colMapping) {
      const val = cells[index]?.trim() ?? "";
      if (!val) continue;

      if (field === "full_name") {
        if (!isSecondName) firstName = val;
        else lastName = val;
      } else if (field === "email") {
        row.email = val.toLowerCase();
      } else if (field === "phone") {
        row.phone = normalizePhone(val);
      } else if (field === "birth_date") {
        row.birth_date = normalizeDateFr(val);
      } else if (field === "primary_concern") {
        row.primary_concern = val.slice(0, 500) || null;
      }
    }

    const full =
      lastName && firstName ? `${firstName} ${lastName}` : firstName || lastName;

    if (!full) continue;

    parsed.push({
      full_name: full,
      email: row.email ?? null,
      phone: row.phone ?? null,
      birth_date: row.birth_date ?? null,
      primary_concern: row.primary_concern ?? null,
    });
  }

  return parsed;
}

// ── Server Actions ─────────────────────────────────────────────────────────────

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
