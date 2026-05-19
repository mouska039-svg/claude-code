import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import type { Database } from "@/types/supabase";
import { EditInvoiceForm } from "./edit-invoice-form";

type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const [{ data: invoiceData }, { data: companiesData }, { data: clientsData }] =
    await Promise.all([
      supabase
        .from("invoices")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase.from("companies").select("*").eq("user_id", user.id).order("name"),
      supabase.from("clients").select("*").eq("user_id", user.id).order("full_name"),
    ]);

  if (!invoiceData) notFound();

  return (
    <EditInvoiceForm
      invoice={invoiceData as InvoiceRow}
      companies={(companiesData ?? []) as CompanyRow[]}
      clients={(clientsData ?? []) as ClientRow[]}
    />
  );
}
