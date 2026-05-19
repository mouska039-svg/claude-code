"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
type InvoiceStatus = InvoiceRow["status"];

export async function createInvoice(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const clientId = (formData.get("client_id") as string | null) || null;
  const companyId = (formData.get("company_id") as string | null) || null;
  const vatStr = formData.get("vat") as string | null;
  const itemsJson = formData.get("items_json") as string | null;

  if (!clientId && !companyId) {
    return { error: "Veuillez sélectionner un client ou une entreprise" };
  }

  const vatRate = parseInt(vatStr ?? "0", 10);

  let items: {
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }[] = [];
  try {
    items = itemsJson ? JSON.parse(itemsJson) : [];
  } catch {
    return { error: "Données de prestations invalides" };
  }

  if (items.length === 0) {
    return { error: "Ajoutez au moins une prestation" };
  }

  const amount = parseFloat(items.reduce((sum, it) => sum + it.total, 0).toFixed(2));

  const { error } = await supabase.from("invoices").insert({
    user_id: user.id,
    amount,
    vat: vatRate,
    items: items as unknown as import("@/types/supabase").Json,
    company_id: companyId,
    client_id: clientId,
    status: "draft",
  });

  if (error) {
    return { error: "Erreur lors de la création de la facture" };
  }

  return {};
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
