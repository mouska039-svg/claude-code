"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkQuota, incrementQuota } from "@/lib/quotas";
import type { Database } from "@/types/supabase";

type CompanyProgramRow = Database["public"]["Tables"]["company_programs"]["Row"];
type CompanyAttendeeRow = Database["public"]["Tables"]["company_attendees"]["Row"];
type CompanyProgramStatus = CompanyProgramRow["status"];

const programSchema = z.object({
  company_id: z.string().min(1, "ID entreprise requis"),
  title: z.string().min(2, "Le titre est requis (min. 2 caractères)"),
  format: z.enum(["workshop", "individual_session", "subscription"]),
  sessions_count: z.string().min(1),
  price_total: z.string().optional().or(z.literal("")),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
});

const attendeeSchema = z.object({
  full_name: z.string().min(2, "Le nom est requis (min. 2 caractères)"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
});

export async function createProgram(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const quota = await checkQuota(user.id, "company_programs");
  if (!quota.allowed) {
    return {
      error: `Quota atteint pour votre plan ${quota.plan}. Passez à un plan supérieur pour créer plus de programmes.`,
    };
  }

  const parsed = programSchema.safeParse({
    company_id: formData.get("company_id"),
    title: formData.get("title"),
    format: formData.get("format"),
    sessions_count: formData.get("sessions_count"),
    price_total: formData.get("price_total"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const sessionsCount = parseInt(parsed.data.sessions_count, 10);
  const priceTotal =
    parsed.data.price_total && parsed.data.price_total !== ""
      ? parseFloat(parsed.data.price_total)
      : null;

  const { error } = await supabase.from("company_programs").insert({
    company_id: parsed.data.company_id,
    practitioner_id: user.id,
    title: parsed.data.title,
    format: parsed.data.format,
    sessions_count: sessionsCount,
    price_total: priceTotal,
    start_date: parsed.data.start_date || null,
    end_date: parsed.data.end_date || null,
    status: "draft",
  });

  if (error) {
    return { error: "Erreur lors de la création du programme" };
  }

  await incrementQuota(user.id, "company_programs");

  redirect(`/dashboard/companies/${parsed.data.company_id}`);
}

export async function getPrograms(companyId?: string): Promise<CompanyProgramRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  let query = supabase
    .from("company_programs")
    .select("*")
    .eq("practitioner_id", user.id)
    .order("created_at", { ascending: false });

  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  const { data } = await query;
  return (data ?? []) as CompanyProgramRow[];
}

export async function updateProgramStatus(
  programId: string,
  status: CompanyProgramStatus
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { error } = await supabase
    .from("company_programs")
    .update({ status })
    .eq("id", programId)
    .eq("practitioner_id", user.id);

  if (error) {
    return { error: "Erreur lors de la mise à jour du statut" };
  }

  return {};
}

export async function addAttendee(
  programId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const parsed = attendeeSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const { error } = await supabase.from("company_attendees").insert({
    program_id: programId,
    full_name: parsed.data.full_name,
    email: parsed.data.email || null,
  });

  if (error) {
    return { error: "Erreur lors de l'ajout du participant" };
  }

  return {};
}

export async function getAttendees(programId: string): Promise<CompanyAttendeeRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data } = await supabase
    .from("company_attendees")
    .select("*")
    .eq("program_id", programId)
    .order("created_at", { ascending: true });

  return (data ?? []) as CompanyAttendeeRow[];
}
