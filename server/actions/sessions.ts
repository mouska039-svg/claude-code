"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];

const sessionSchema = z.object({
  client_id: z.string().uuid("Client invalide"),
  date: z.string().min(1, "La date est requise"),
  duration_min: z.coerce.number().int().positive().nullable().optional(),
  type: z.enum(["presentiel", "visio"], { error: "Type invalide" }),
  notes_practitioner: z.string().optional().or(z.literal("")),
});

export async function createSession(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const parsed = sessionSchema.safeParse({
    client_id: formData.get("client_id"),
    date: formData.get("date"),
    duration_min: formData.get("duration_min") || null,
    type: formData.get("type"),
    notes_practitioner: formData.get("notes_practitioner"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const { error } = await supabase.from("sessions").insert({
    practitioner_id: user.id,
    client_id: parsed.data.client_id,
    date: parsed.data.date,
    duration_min: parsed.data.duration_min ?? null,
    type: parsed.data.type,
    notes_practitioner: parsed.data.notes_practitioner || null,
    next_steps: [],
  });

  if (error) {
    return { error: "Erreur lors de la création de la séance" };
  }

  redirect("/dashboard/sessions");
}

export async function getSessions(clientId?: string): Promise<SessionRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  let query = supabase
    .from("sessions")
    .select("*")
    .eq("practitioner_id", user.id)
    .order("date", { ascending: false });

  if (clientId) {
    query = query.eq("client_id", clientId);
  }

  const { data } = await query;
  return (data ?? []) as SessionRow[];
}

export async function updateSession(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const id = formData.get("id") as string;
  if (!id) return { error: "ID séance manquant" };

  const parsed = sessionSchema.safeParse({
    client_id: formData.get("client_id"),
    date: formData.get("date"),
    duration_min: formData.get("duration_min") || null,
    type: formData.get("type"),
    notes_practitioner: formData.get("notes_practitioner"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const { error } = await supabase
    .from("sessions")
    .update({
      client_id: parsed.data.client_id,
      date: parsed.data.date,
      duration_min: parsed.data.duration_min ?? null,
      type: parsed.data.type,
      notes_practitioner: parsed.data.notes_practitioner || null,
    })
    .eq("id", id)
    .eq("practitioner_id", user.id);

  if (error) {
    return { error: "Erreur lors de la mise à jour de la séance" };
  }

  redirect(`/dashboard/sessions/${id}`);
}

export async function deleteSession(sessionId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", sessionId)
    .eq("practitioner_id", user.id);

  if (error) {
    return { error: "Erreur lors de la suppression de la séance" };
  }

  return {};
}
