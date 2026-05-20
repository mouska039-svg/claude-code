import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentYearMonth, formatCurrency } from "@/lib/utils";
import type { Database } from "@/types/supabase";

type AILog = Database["public"]["Tables"]["ai_usage_log"]["Row"];
type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

interface FeatureCost {
  feature: string;
  total: number;
  count: number;
}

interface UserCost {
  user_id: string;
  total: number;
  plan: string;
}

async function getAdminData() {
  const supabase = createAdminClient();
  const yearMonth = getCurrentYearMonth(); // "YYYY-MM"
  const [year, month] = yearMonth.split("-").map(Number);
  const startDate = `${yearMonth}-01T00:00:00Z`;
  const nextMonth =
    month === 12
      ? `${year + 1}-01-01T00:00:00Z`
      : `${year}-${String(month + 1).padStart(2, "0")}-01T00:00:00Z`;

  const { data: logs } = await supabase
    .from("ai_usage_log")
    .select("*")
    .gte("created_at", startDate)
    .lt("created_at", nextMonth);

  const allLogs = (logs ?? []) as AILog[];

  // Coût total
  const totalCost = allLogs.reduce((sum, l) => sum + Number(l.cost_eur), 0);

  // Par feature
  const featureMap = new Map<string, FeatureCost>();
  for (const log of allLogs) {
    const existing = featureMap.get(log.feature) ?? {
      feature: log.feature,
      total: 0,
      count: 0,
    };
    existing.total += Number(log.cost_eur);
    existing.count += 1;
    featureMap.set(log.feature, existing);
  }
  const byCost = Array.from(featureMap.values()).sort((a, b) => b.total - a.total);

  // Par utilisateur
  const userMap = new Map<string, number>();
  for (const log of allLogs) {
    userMap.set(log.user_id, (userMap.get(log.user_id) ?? 0) + Number(log.cost_eur));
  }
  const topUsers: UserCost[] = Array.from(userMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([user_id, total]) => ({ user_id, total, plan: "?" }));

  // Enrichir avec le plan
  if (topUsers.length > 0) {
    const userIds = topUsers.map((u) => u.user_id);
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("user_id, plan")
      .in("user_id", userIds);
    const subMap = new Map(
      (subs ?? []).map((s: Pick<Subscription, "user_id" | "plan">) => [s.user_id, s.plan])
    );
    for (const u of topUsers) {
      u.plan = subMap.get(u.user_id) ?? "free";
    }
  }

  // Alertes free > 5€
  const freeAlerts = topUsers.filter((u) => u.plan === "free" && u.total > 5);

  return { totalCost, byCost, topUsers, freeAlerts };
}

export default async function AICostsPage() {
  const { totalCost, byCost, topUsers, freeAlerts } = await getAdminData();
  const yearMonth = getCurrentYearMonth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-fraunces text-2xl font-semibold text-foreground">
          Coûts Naya — {yearMonth}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dashboard réservé aux administrateurs
        </p>
      </div>

      {/* Alerte utilisateurs free coûteux */}
      {freeAlerts.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">
            ⚠ {freeAlerts.length} utilisateur(s) gratuit(s) dépassent 5 €/mois
          </p>
          <ul className="mt-2 space-y-1">
            {freeAlerts.map((u) => (
              <li key={u.user_id} className="text-xs text-red-600">
                {u.user_id} — {formatCurrency(u.total)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Coût total */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-sage/20 bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Coût total du mois</p>
          <p className="mt-2 font-geist-mono text-3xl font-semibold text-foreground">
            {formatCurrency(totalCost)}
          </p>
        </div>
        <div className="rounded-xl border border-sage/20 bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Appels Naya</p>
          <p className="mt-2 font-geist-mono text-3xl font-semibold text-foreground">
            {byCost.reduce((s, f) => s + f.count, 0)}
          </p>
        </div>
        <div className="rounded-xl border border-sage/20 bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Utilisateurs actifs</p>
          <p className="mt-2 font-geist-mono text-3xl font-semibold text-foreground">
            {topUsers.length}
          </p>
        </div>
      </div>

      {/* Par feature */}
      <div className="rounded-xl border border-sage/20 bg-card p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-foreground">Coût par fonctionnalité</h2>
        <div className="space-y-3">
          {byCost.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucun appel ce mois-ci.</p>
          )}
          {byCost.map((f) => (
            <div key={f.feature} className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-foreground capitalize">
                  {f.feature}
                </span>
                <span className="ml-2 text-xs text-muted-foreground">
                  ({f.count} appels)
                </span>
              </div>
              <span className="font-geist-mono text-sm text-foreground">
                {formatCurrency(f.total)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top utilisateurs */}
      <div className="rounded-xl border border-sage/20 bg-card p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-foreground">Top 10 utilisateurs</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-muted/20 text-left text-muted-foreground">
                <th className="pb-2 font-medium">User ID</th>
                <th className="pb-2 font-medium">Plan</th>
                <th className="pb-2 text-right font-medium">Coût</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/10">
              {topUsers.map((u) => (
                <tr
                  key={u.user_id}
                  className={u.plan === "free" && u.total > 5 ? "bg-red-50" : ""}
                >
                  <td className="py-2 font-geist-mono text-xs text-muted-foreground">
                    {u.user_id.slice(0, 8)}…
                  </td>
                  <td className="py-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.plan === "cabinet_plus"
                          ? "bg-sage/10 text-sage"
                          : u.plan === "cabinet"
                            ? "bg-terracotta/10 text-terracotta"
                            : "bg-muted/20 text-muted-foreground"
                      }`}
                    >
                      {u.plan}
                    </span>
                  </td>
                  <td className="py-2 text-right font-geist-mono">
                    {formatCurrency(u.total)}
                  </td>
                </tr>
              ))}
              {topUsers.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-muted-foreground">
                    Aucune donnée ce mois-ci.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
