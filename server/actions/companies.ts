"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];

const companySchema = z.object({
  name: z.string().min(2, "Le nom de l'entreprise est requis (min. 2 caractères)"),
  contact_name: z.string().optional().or(z.literal("")),
  contact_email: z.string().email("Email invalide").optional().or(z.literal("")),
  siret: z.string().optional().or(z.literal("")),
  sector: z.string().optional().or(z.literal("")),
  employee_count: z.string().optional().or(z.literal("")),
});

export async function createCompany(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const parsed = companySchema.safeParse({
    name: formData.get("name"),
    contact_name: formData.get("contact_name"),
    contact_email: formData.get("contact_email"),
    siret: formData.get("siret"),
    sector: formData.get("sector"),
    employee_count: formData.get("employee_count"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const employeeCountRaw = parsed.data.employee_count;
  const employeeCount =
    employeeCountRaw && employeeCountRaw !== "" ? parseInt(employeeCountRaw, 10) : null;

  const { error } = await supabase.from("companies").insert({
    user_id: user.id,
    name: parsed.data.name,
    contact_name: parsed.data.contact_name || null,
    contact_email: parsed.data.contact_email || null,
    siret: parsed.data.siret || null,
    sector: parsed.data.sector || null,
    employee_count: employeeCount,
  });

  if (error) {
    return { error: "Erreur lors de la création de l'entreprise" };
  }

  redirect("/dashboard/companies");
}

export async function getCompanies(): Promise<CompanyRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data ?? []) as CompanyRow[];
}

export async function updateCompany(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const id = formData.get("id") as string;
  if (!id) return { error: "ID entreprise manquant" };

  const parsed = companySchema.safeParse({
    name: formData.get("name"),
    contact_name: formData.get("contact_name"),
    contact_email: formData.get("contact_email"),
    siret: formData.get("siret"),
    sector: formData.get("sector"),
    employee_count: formData.get("employee_count"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const employeeCountRaw = parsed.data.employee_count;
  const employeeCount =
    employeeCountRaw && employeeCountRaw !== "" ? parseInt(employeeCountRaw, 10) : null;

  const { error } = await supabase
    .from("companies")
    .update({
      name: parsed.data.name,
      contact_name: parsed.data.contact_name || null,
      contact_email: parsed.data.contact_email || null,
      siret: parsed.data.siret || null,
      sector: parsed.data.sector || null,
      employee_count: employeeCount,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Erreur lors de la mise à jour de l'entreprise" };
  }

  redirect(`/dashboard/companies/${id}`);
}

export async function deleteCompany(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { error } = await supabase
    .from("companies")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Erreur lors de la suppression de l'entreprise" };
  }

  return {};
}
