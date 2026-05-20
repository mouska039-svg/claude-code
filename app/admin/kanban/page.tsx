import { createAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type FeatureRequest = Database["public"]["Tables"]["feature_requests"]["Row"];
type NpsRow = Database["public"]["Tables"]["nps_responses"]["Row"];

type KanbanStatus = FeatureRequest["status"];

const COLUMNS: { status: KanbanStatus; label: string }[] = [
  { status: "backlog", label: "Backlog" },
  { status: "in_progress", label: "En cours" },
  { status: "done", label: "Terminé" },
  { status: "cancelled", label: "Annulé" },
];

interface NpsMetrics {
  avg: number | null;
  count: number;
  promotersPct: number;
  passifsPct: number;
  detractorsPct: number;
  npsScore: number;
}

function computeNpsMetrics(rows: NpsRow[]): NpsMetrics {
  const count = rows.length;
  if (count === 0) {
    return {
      avg: null,
      count: 0,
      promotersPct: 0,
      passifsPct: 0,
      detractorsPct: 0,
      npsScore: 0,
    };
  }

  const sum = rows.reduce((acc, r) => acc + r.score, 0);
  const avg = sum / count;

  const promoters = rows.filter((r) => r.score >= 9).length;
  const passifs = rows.filter((r) => r.score >= 7 && r.score <= 8).length;
  const detractors = rows.filter((r) => r.score <= 6).length;

  const promotersPct = Math.round((promoters / count) * 100);
  const passifsPct = Math.round((passifs / count) * 100);
  const detractorsPct = Math.round((detractors / count) * 100);
  const npsScore = promotersPct - detractorsPct;

  return { avg, count, promotersPct, passifsPct, detractorsPct, npsScore };
}

function npsScoreColor(score: number): string {
  if (score >= 8) return "text-green-600";
  if (score >= 6) return "text-yellow-600";
  return "text-red-600";
}

function npsAvgColor(avg: number): string {
  if (avg >= 8) return "text-green-600";
  if (avg >= 6) return "text-yellow-600";
  return "text-red-600";
}

async function getPageData() {
  const supabase = createAdminClient();

  const [{ data: features }, { data: npsRows }] = await Promise.all([
    supabase
      .from("feature_requests")
      .select("*")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true }),
    supabase.from("nps_responses").select("*"),
  ]);

  return {
    features: (features ?? []) as FeatureRequest[],
    npsMetrics: computeNpsMetrics((npsRows ?? []) as NpsRow[]),
  };
}

export default async function KanbanPage() {
  const { features, npsMetrics } = await getPageData();

  const cardsByStatus = (status: KanbanStatus): FeatureRequest[] =>
    features.filter((f) => f.status === status);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-fraunces text-2xl font-semibold text-foreground">
          Tableau de bord founder
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          NPS utilisateurs et feuille de route produit
        </p>
      </div>

      {/* NPS section */}
      <section className="space-y-4">
        <h2 className="font-semibold text-foreground text-lg">Net Promoter Score</h2>

        {npsMetrics.count === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune réponse NPS pour l&apos;instant.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {/* Average score */}
              <div className="rounded-xl border border-sage/20 bg-card p-6 shadow-sm">
                <p className="text-sm text-muted-foreground">Score moyen</p>
                <p
                  className={`mt-2 font-geist-mono text-3xl font-semibold ${npsAvgColor(npsMetrics.avg ?? 0)}`}
                >
                  {npsMetrics.avg !== null ? npsMetrics.avg.toFixed(1) : "—"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  sur {npsMetrics.count} réponse{npsMetrics.count > 1 ? "s" : ""}
                </p>
              </div>

              {/* Promoters */}
              <div className="rounded-xl border border-green-200 bg-green-50 p-6 shadow-sm">
                <p className="text-sm text-green-700">Promoteurs (9–10)</p>
                <p className="mt-2 font-geist-mono text-3xl font-semibold text-green-700">
                  {npsMetrics.promotersPct}%
                </p>
              </div>

              {/* Passifs */}
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
                <p className="text-sm text-yellow-700">Passifs (7–8)</p>
                <p className="mt-2 font-geist-mono text-3xl font-semibold text-yellow-700">
                  {npsMetrics.passifsPct}%
                </p>
              </div>

              {/* Detractors */}
              <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
                <p className="text-sm text-red-700">Détracteurs (0–6)</p>
                <p className="mt-2 font-geist-mono text-3xl font-semibold text-red-700">
                  {npsMetrics.detractorsPct}%
                </p>
              </div>
            </div>

            {/* NPS formula */}
            <div className="rounded-xl border border-sage/20 bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">Score NPS =</span>
                <span className="font-medium text-green-700">
                  {npsMetrics.promotersPct}% promoteurs
                </span>
                <span className="text-muted-foreground">−</span>
                <span className="font-medium text-red-700">
                  {npsMetrics.detractorsPct}% détracteurs
                </span>
                <span className="text-muted-foreground">=</span>
                <span
                  className={`font-geist-mono text-2xl font-bold ${npsScoreColor(npsMetrics.npsScore)}`}
                >
                  {npsMetrics.npsScore > 0 ? "+" : ""}
                  {npsMetrics.npsScore}
                </span>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Kanban section */}
      <section className="space-y-4">
        <h2 className="font-semibold text-foreground text-lg">
          Demandes de fonctionnalités
        </h2>

        {features.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune demande de fonctionnalité pour l&apos;instant.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COLUMNS.map(({ status, label }) => {
              const cards = cardsByStatus(status);
              return (
                <div key={status} className="flex flex-col gap-3">
                  {/* Column header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">{label}</h3>
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted/30 px-1.5 text-xs font-medium text-muted-foreground">
                      {cards.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="flex flex-col gap-2">
                    {cards.length === 0 && (
                      <p className="rounded-lg border border-dashed border-muted/30 p-3 text-xs text-muted-foreground">
                        Aucune carte
                      </p>
                    )}
                    {cards.map((card) => (
                      <div
                        key={card.id}
                        className="rounded-xl border border-sage/20 bg-card p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground leading-snug">
                            {card.title}
                          </p>
                          {card.votes > 0 && (
                            <span className="inline-flex flex-shrink-0 items-center gap-0.5 rounded-full border border-terracotta/30 bg-terracotta/10 px-2 py-0.5 text-xs font-medium text-terracotta">
                              ↑ {card.votes}
                            </span>
                          )}
                        </div>
                        {card.description && (
                          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                            {card.description}
                          </p>
                        )}
                        {card.priority > 0 && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Priorité : {card.priority}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
