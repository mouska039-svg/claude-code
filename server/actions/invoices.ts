"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
type InvoiceStatus = InvoiceRow["status"];

const invoiceSchema = z.object({
  amount: z.string().min(1, "Le montant est requis"),
  vat: z.enum(["0", "10", "20"]),
  description: z.string().min(1, "La description est requise"),
  company_id: z.string().optional().or(z.literal("")),
  client_id: z.string().optional().or(z.literal("")),
});

export async function createInvoice(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const parsed = invoiceSchema.safeParse({
    amount: formData.get("amount"),
    vat: formData.get("vat"),
    description: formData.get("description"),
    company_id: formData.get("company_id"),
    client_id: formData.get("client_id"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const companyId = parsed.data.company_id || null;
  const clientId = parsed.data.client_id || null;

  if (!companyId && !clientId) {
    return { error: "Veuillez sélectionner un client ou une entreprise" };
  }

  const { error } = await supabase.from("invoices").insert({
    user_id: user.id,
    amount: parseFloat(parsed.data.amount),
    vat: parseInt(parsed.data.vat, 10),
    items: [{ description: parsed.data.description }],
    company_id: companyId,
    client_id: clientId,
    status: "draft",
  });

  if (error) {
    return { error: "Erreur lors de la création de la facture" };
  }

  redirect("/dashboard/invoices");
}

export async function getInvoices(): Promise<InvoiceRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data ?? []) as InvoiceRow[];
}

export async function updateInvoiceStatus(
  invoiceId: string,
  status: InvoiceStatus
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const paidAt = status === "paid" ? new Date().toISOString() : null;

  const { error } = await supabase
    .from("invoices")
    .update({ status, paid_at: paidAt })
    .eq("id", invoiceId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Erreur lors de la mise à jour du statut" };
  }

  return {};
}

export async function deleteInvoice(invoiceId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .eq("user_id", user.id)
    .single();

  const row = invoice as InvoiceRow | null;

  if (!row) {
    return { error: "Facture introuvable" };
  }

  if (row.status !== "draft") {
    return { error: "Seules les factures brouillon peuvent être supprimées" };
  }

  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", invoiceId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Erreur lors de la suppression de la facture" };
  }

  return {};
}
