import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Database } from "@/types/supabase";
import NewInvoiceForm from "./new-invoice-form";

type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

export default async function NewInvoicePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const [{ data: companiesData }, { data: clientsData }] = await Promise.all([
    supabase.from("companies").select("*").eq("user_id", user.id).order("name"),
    supabase.from("clients").select("*").eq("user_id", user.id).order("full_name"),
  ]);

  const companies = (companiesData ?? []) as CompanyRow[];
  const clients = (clientsData ?? []) as ClientRow[];

  return <NewInvoiceForm companies={companies} clients={clients} />;
}
