import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Database } from "@/types/supabase";

type ProtocolRow = Database["public"]["Tables"]["protocols"]["Row"];

type GeneratedOutput = {
  title: string;
  summary: string;
  duration_weeks: number;
  steps: { week: string; recommendations: string[] }[];
  lifestyle: {
    nutrition: string[];
    sleep: string[];
    movement: string[];
    stress: string[];
  };
  contraindications: string[];
  disclaimer: string;
};

const statusLabel: Record<string, string> = {
  draft: "Brouillon",
  active: "Actif",
  completed: "Terminé",
  archived: "Archivé",
};

const statusClass: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-sage/10 text-sage",
  completed: "bg-blue-50 text-blue-700",
  archived: "bg-muted text-muted-foreground",
};

export default async function ProtocolDetailPage({
  params,
}: {
  params: Promise<{ id: string; protocolId: string }>;
}) {
  const { id, protocolId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: protocolData } = await supabase
    .from("protocols")
    .select("*")
    .eq("id", protocolId)
    .eq("practitioner_id", user.id)
    .maybeSingle();

  if (!protocolData) notFound();

  const protocol = protocolData as ProtocolRow;
  const output = protocol.output as GeneratedOutput | null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <nav aria-label="Fil d'Ariane">
        <Link
          href={`/dashboard/clients/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] py-2"
        >
          <ChevronLeft size={14} aria-hidden="true" />
          Retour au client
        </Link>
      </nav>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-fraunces text-2xl font-semibold text-ink">
            {protocol.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {output?.duration_weeks
              ? `${output.duration_weeks} semaine${output.duration_weeks > 1 ? "s" : ""} · `
              : ""}
            {new Intl.DateTimeFormat("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date(protocol.created_at))}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium shrink-0 ${statusClass[protocol.status] ?? "bg-muted text-muted-foreground"}`}
        >
          {statusLabel[protocol.status] ?? protocol.status}
        </span>
      </div>

      <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3">
        <p className="font-medium mb-0.5">Avertissement médical</p>
        <p>
          Ces recommandations sont des conseils en hygiène de vie générés par IA et ne
          constituent pas un avis médical.
        </p>
      </div>

      {output?.summary && (
        <div className="rounded-xl bg-card border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-2">Résumé</h2>
          <p className="text-sm text-foreground">{output.summary}</p>
        </div>
      )}

      {output?.steps && output.steps.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground">Étapes du protocole</h2>
          <div className="space-y-4">
            {output.steps.map((s, i) => (
              <div key={i} className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">{s.week}</h3>
                <ul className="space-y-1">
                  {s.recommendations.map((r, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sage" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {output?.lifestyle && (
        <div className="rounded-xl bg-card border border-border p-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground">Hygiène de vie</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { label: "Nutrition", items: output.lifestyle.nutrition },
              { label: "Sommeil", items: output.lifestyle.sleep },
              { label: "Mouvement", items: output.lifestyle.movement },
              { label: "Stress", items: output.lifestyle.stress },
            ].map(({ label, items }) =>
              items && items.length > 0 ? (
                <div key={label}>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    {label}
                  </h3>
                  <ul className="space-y-1">
                    {items.map((item, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-terracotta" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}

      {output?.contraindications && output.contraindications.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-6 space-y-3">
          <h2 className="text-base font-semibold text-foreground">Contre-indications</h2>
          <ul className="space-y-1">
            {output.contraindications.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-destructive" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-3 pb-4">
        <Link
          href={`/dashboard/clients/${id}/protocol/new`}
          className="rounded-lg border border-input bg-card px-5 py-2 text-sm font-medium hover:bg-muted transition-colors min-h-[44px] inline-flex items-center"
        >
          Générer un nouveau protocole
        </Link>
      </div>
    </div>
  );
}
