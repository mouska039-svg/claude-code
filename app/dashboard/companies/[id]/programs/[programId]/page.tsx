import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Database } from "@/types/supabase";
import AttendeeSection from "./attendee-section";

type CompanyProgramRow = Database["public"]["Tables"]["company_programs"]["Row"];
type CompanyAttendeeRow = Database["public"]["Tables"]["company_attendees"]["Row"];

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

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string; programId: string }>;
}) {
  const { id, programId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: programData } = await supabase
    .from("company_programs")
    .select("*")
    .eq("id", programId)
    .eq("company_id", id)
    .eq("practitioner_id", user.id)
    .single();

  const program = programData as CompanyProgramRow | null;
  if (!program) notFound();

  const { data: attendeesData } = await supabase
    .from("company_attendees")
    .select("*")
    .eq("program_id", programId)
    .order("created_at", { ascending: true });

  const attendees = (attendeesData ?? []) as CompanyAttendeeRow[];

  const nextStatuses: Partial<
    Record<CompanyProgramRow["status"], CompanyProgramRow["status"]>
  > = {
    draft: "proposal",
    proposal: "signed",
    signed: "in_progress",
    in_progress: "completed",
  };

  const nextStatus = nextStatuses[program.status];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href={`/dashboard/companies/${id}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Entreprise
          </Link>
          <h1 className="font-fraunces text-3xl font-semibold text-ink mt-1">
            {program.title}
          </h1>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusColors[program.status]}`}
        >
          {statusLabels[program.status]}
        </span>
      </div>

      <div className="rounded-xl bg-card border border-border p-6 space-y-3">
        <h2 className="text-base font-semibold text-foreground">Détails</h2>
        <dl className="grid gap-2 sm:grid-cols-2">
          <dt className="text-xs text-muted-foreground">Format</dt>
          <dd className="text-sm text-foreground">{formatLabels[program.format]}</dd>

          <dt className="text-xs text-muted-foreground">Séances</dt>
          <dd className="text-sm text-foreground">{program.sessions_count}</dd>

          {program.price_total !== null && (
            <>
              <dt className="text-xs text-muted-foreground">Prix total</dt>
              <dd className="text-sm text-foreground">
                {program.price_total.toLocaleString("fr-FR")} €
              </dd>
            </>
          )}

          {program.start_date && (
            <>
              <dt className="text-xs text-muted-foreground">Début</dt>
              <dd className="text-sm text-foreground">
                {new Date(program.start_date).toLocaleDateString("fr-FR")}
              </dd>
            </>
          )}

          {program.end_date && (
            <>
              <dt className="text-xs text-muted-foreground">Fin</dt>
              <dd className="text-sm text-foreground">
                {new Date(program.end_date).toLocaleDateString("fr-FR")}
              </dd>
            </>
          )}
        </dl>
      </div>

      {nextStatus && (
        <AttendeeSection
          programId={programId}
          attendees={attendees}
          nextStatus={nextStatus}
          currentStatus={program.status}
          companyId={id}
        />
      )}

      {!nextStatus && (
        <AttendeeSection programId={programId} attendees={attendees} companyId={id} />
      )}
    </div>
  );
}
