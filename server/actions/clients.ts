"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

const clientSchema = z.object({
  full_name: z.string().min(2, "Le nom complet est requis (min. 2 caractères)"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  birth_date: z.string().optional().or(z.literal("")),
  primary_concern: z.string().optional().or(z.literal("")),
});

export async function createClient(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { checkQuota } = await import("@/lib/quotas");
  const quota = await checkQuota(user.id, "clients");
  if (!quota.allowed) {
    return {
      error: `Limite de clients atteinte pour votre plan (${quota.limit} clients max). Passez à un plan supérieur.`,
    };
  }

  const parsed = clientSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    birth_date: formData.get("birth_date"),
    primary_concern: formData.get("primary_concern"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const { error } = await supabase.from("clients").insert({
    user_id: user.id,
    full_name: parsed.data.full_name,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    birth_date: parsed.data.birth_date || null,
    primary_concern: parsed.data.primary_concern || null,
    status: "active",
  });

  if (error) {
    return { error: "Erreur lors de la création du client" };
  }

  redirect("/dashboard/clients");
}

export async function updateClient(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const id = formData.get("id") as string;
  if (!id) return { error: "ID client manquant" };

  const parsed = clientSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    birth_date: formData.get("birth_date"),
    primary_concern: formData.get("primary_concern"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const { error } = await supabase
    .from("clients")
    .update({
      full_name: parsed.data.full_name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      birth_date: parsed.data.birth_date || null,
      primary_concern: parsed.data.primary_concern || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Erreur lors de la mise à jour du client" };
  }

  redirect(`/dashboard/clients/${id}`);
}

export async function deleteClient(clientId: string): Promise<{ error?: string }> {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", clientId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Erreur lors de la suppression du client" };
  }

  return { error: undefined };
}

export async function getClients(): Promise<ClientRow[]> {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data ?? []) as ClientRow[];
}
