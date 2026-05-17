import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Database } from "@/types/supabase";

type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];
type CompanyProgramRow = Database["public"]["Tables"]["company_programs"]["Row"];

const statusLabels: Record<CompanyProgramRow["status"], string> = {
  draft: "Brouillon",
  proposal: "Proposition",
  signed: "Signé",
  in_progress: "En cours",
  completed: "Terminé",
};

const statusColors: Record<CompanyProgramRow["status"], string> = {
  draft: "bg-muted text-muted-foreground",
  proposal: "bg-blue-100 text-blue-700",
  signed: "bg-terracotta/10 text-terracotta",
  in_progress: "bg-sage/10 text-sage",
  completed: "bg-sage/20 text-sage-700",
};

const formatLabels: Record<CompanyProgramRow["format"], string> = {
  workshop: "Atelier",
  individual_session: "Séance individuelle",
  subscription: "Abonnement",
};

export default async function CompanyDetailPage({
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

  const { data: companyData } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const company = companyData as CompanyRow | null;
  if (!company) notFound();

  const { data: programsData } = await supabase
    .from("company_programs")
    .select("*")
    .eq("company_id", id)
    .eq("practitioner_id", user.id)
    .order("created_at", { ascending: false });

  const programs = (programsData ?? []) as CompanyProgramRow[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/companies"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Entreprises
          </Link>
          <h1 className="font-fraunces text-3xl font-semibold text-ink mt-1">
            {company.name}
          </h1>
        </div>
        <Link
          href={`/dashboard/companies/${id}/programs/new`}
          className="inline-flex items-center gap-2 rounded-lg bg-sage text-white px-4 py-2 text-sm font-medium hover:bg-sage/90 transition-colors"
        >
          + Nouveau programme
        </Link>
      </div>

      <div className="rounded-xl bg-card border border-border p-6 space-y-3">
        <h2 className="text-base font-semibold text-foreground">Informations</h2>
        <dl className="grid gap-2 sm:grid-cols-2">
          {company.contact_name && (
            <>
              <dt className="text-xs text-muted-foreground">Contact</dt>
              <dd className="text-sm text-foreground">{company.contact_name}</dd>
            </>
          )}
          {company.contact_email && (
            <>
              <dt className="text-xs text-muted-foreground">Email</dt>
              <dd className="text-sm text-foreground">{company.contact_email}</dd>
            </>
          )}
          {company.siret && (
            <>
              <dt className="text-xs text-muted-foreground">SIRET</dt>
              <dd className="text-sm text-foreground font-mono">{company.siret}</dd>
            </>
          )}
          {company.sector && (
            <>
              <dt className="text-xs text-muted-foreground">Secteur</dt>
              <dd className="text-sm text-foreground">{company.sector}</dd>
            </>
          )}
          {company.employee_count && (
            <>
              <dt className="text-xs text-muted-foreground">Employés</dt>
              <dd className="text-sm text-foreground">{company.employee_count}</dd>
            </>
          )}
        </dl>
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Programmes ({programs.length})
        </h2>

        {programs.length === 0 ? (
          <div className="rounded-xl bg-card border border-border p-8 text-center">
            <p className="text-muted-foreground text-sm">
              Aucun programme pour cette entreprise.
            </p>
            <Link
              href={`/dashboard/companies/${id}/programs/new`}
              className="inline-block mt-3 text-sm text-sage hover:underline"
            >
              Créer le premier programme →
            </Link>
          </div>
        ) : (
          <div className="rounded-xl bg-card border border-border divide-y divide-border overflow-hidden">
            {programs.map((program) => (
              <div
                key={program.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {program.title}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <p className="text-xs text-muted-foreground">
                      {formatLabels[program.format]}
                    </p>
                    {program.start_date && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(program.start_date).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                    {program.price_total !== null && (
                      <p className="text-xs text-muted-foreground">
                        {program.price_total.toLocaleString("fr-FR")} €
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[program.status]}`}
                  >
                    {statusLabels[program.status]}
                  </span>
                  <Link
                    href={`/dashboard/companies/${id}/programs/${program.id}`}
                    className="text-sm text-sage hover:underline font-medium"
                  >
                    Voir
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
