import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Database } from "@/types/supabase";

type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];
type CompanyProgramRow = Database["public"]["Tables"]["company_programs"]["Row"];

async function getCompaniesWithProgramCount(
  userId: string
): Promise<(CompanyRow & { programsCount: number })[]> {
  const { createClient: createSupabase } = await import("@/lib/supabase/server");
  const supabase = await createSupabase();

  const { data: companies } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const rows = (companies ?? []) as CompanyRow[];

  if (rows.length === 0) return [];

  const { data: programs } = await supabase
    .from("company_programs")
    .select("*")
    .eq("practitioner_id", userId);

  const programRows = (programs ?? []) as CompanyProgramRow[];

  return rows.map((company) => ({
    ...company,
    programsCount: programRows.filter((p) => p.company_id === company.id).length,
  }));
}

export default async function CompaniesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const companies = await getCompaniesWithProgramCount(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-fraunces text-3xl font-semibold text-ink">Entreprises</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {companies.length} entreprise{companies.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/companies/new"
          className="inline-flex items-center gap-2 rounded-lg bg-sage text-white px-4 py-2 text-sm font-medium hover:bg-sage/90 transition-colors"
        >
          + Nouvelle entreprise
        </Link>
      </div>

      {companies.length === 0 ? (
        <div className="rounded-xl bg-card border border-border p-12 text-center">
          <p className="text-muted-foreground text-sm">
            Aucune entreprise pour l&apos;instant.
          </p>
          <Link
            href="/dashboard/companies/new"
            className="inline-block mt-3 text-sm text-sage hover:underline"
          >
            Ajouter votre première entreprise →
          </Link>
        </div>
      ) : (
        <div className="rounded-xl bg-card border border-border divide-y divide-border overflow-hidden">
          {companies.map((company) => (
            <div
              key={company.id}
              className="flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {company.name}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  {company.contact_name && (
                    <p className="text-xs text-muted-foreground">
                      {company.contact_name}
                    </p>
                  )}
                  {company.contact_email && (
                    <p className="text-xs text-muted-foreground truncate">
                      {company.contact_email}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span className="inline-flex items-center rounded-full bg-sage/10 text-sage px-2 py-0.5 text-xs font-medium">
                  {company.programsCount} programme
                  {company.programsCount !== 1 ? "s" : ""}
                </span>
                <Link
                  href={`/dashboard/companies/${company.id}`}
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
  );
}
