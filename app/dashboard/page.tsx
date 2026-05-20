import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, FileText, TrendingUp, Zap } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Database } from "@/types/supabase";

type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];
type UsageQuotaRow = Database["public"]["Tables"]["usage_quotas"]["Row"];

async function getDashboardData(userId: string) {
  const supabase = await createClient();

  const [
    clientsResult,
    protocolsResult,
    invoicesResult,
    quotaResult,
    subscriptionResult,
  ] = await Promise.all([
    supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "active"),
    supabase
      .from("protocols")
      .select("*", { count: "exact", head: true })
      .eq("practitioner_id", userId)
      .eq("status", "active"),
    supabase
      .from("invoices")
      .select("amount, vat")
      .eq("user_id", userId)
      .eq("status", "paid")
      .gte(
        "paid_at",
        new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      ),
    supabase
      .from("usage_quotas")
      .select("*")
      .eq("user_id", userId)
      .eq(
        "year_month",
        `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
      )
      .maybeSingle(),
    supabase.from("subscriptions").select("*").eq("user_id", userId).single(),
  ]);

  const invoices = (invoicesResult.data ?? []) as Pick<InvoiceRow, "amount" | "vat">[];
  const monthlyRevenue = invoices.reduce(
    (sum, inv) => sum + (inv.amount ?? 0) + (inv.vat ?? 0),
    0
  );

  const subscription = subscriptionResult.data as SubscriptionRow | null;
  const plan = subscription?.plan ?? "free";
  const quotaLimits: Record<string, number | null> = {
    free: 3,
    cabinet: 30,
    cabinet_plus: null,
  };
  const limit = quotaLimits[plan] ?? 3;

  const quota = quotaResult.data as UsageQuotaRow | null;
  const protocolsUsed = quota?.protocols_count ?? 0;
  const quotaRemaining =
    limit === null ? "∞" : String(Math.max(0, limit - protocolsUsed));

  return {
    activeClients: clientsResult.count ?? 0,
    activeCures: protocolsResult.count ?? 0,
    monthlyRevenue,
    quotaRemaining,
    limit,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const isAdmin = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .includes(user.id);

  const data = await getDashboardData(user.id);

  const { data: sessionsRaw } = await supabase
    .from("sessions")
    .select("id, date, type")
    .eq("practitioner_id", user.id)
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true })
    .limit(5);

  // Fetch client names separately to avoid join type complexity
  const sessionIds = (sessionsRaw ?? []).map(
    (s) => s as { id: string; date: string; type: string }
  );

  const STATS = [
    {
      label: "Clients actifs",
      value: data.activeClients,
      icon: Users,
      color: "sage",
      description: "en suivi actuellement",
    },
    {
      label: "Cures en cours",
      value: data.activeCures,
      icon: FileText,
      color: "terracotta",
      description: "protocoles actifs",
    },
    {
      label: "CA du mois",
      value: formatCurrency(data.monthlyRevenue),
      icon: TrendingUp,
      color: "sage",
      description: "facturé ce mois",
    },
    {
      label: "Quota Naya restant",
      value: data.quotaRemaining,
      icon: Zap,
      color: data.quotaRemaining === "0" ? "destructive" : "terracotta",
      description: "protocoles ce mois",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-fraunces text-3xl font-semibold text-ink">Aperçu</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Bienvenue sur votre espace Naya
        </p>
      </div>

      {/* Admin shortcut */}
      {isAdmin && (
        <div className="flex gap-3">
          <Link
            href="/admin/ai-costs"
            className="inline-flex items-center gap-2 rounded-lg border border-sage/30 bg-sage/5 px-4 py-2 text-sm font-medium text-sage hover:bg-sage/10 transition-colors"
          >
            Coûts Naya
          </Link>
          <Link
            href="/admin/kanban"
            className="inline-flex items-center gap-2 rounded-lg border border-sage/30 bg-sage/5 px-4 py-2 text-sm font-medium text-sage hover:bg-sage/10 transition-colors"
          >
            Tableau founder
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              aria-label={`${stat.label}: ${stat.value}`}
              className="rounded-xl bg-card border border-border p-5 hover:shadow-sm transition-shadow min-h-[100px]"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                <div
                  className={[
                    "p-1.5 rounded-lg",
                    stat.color === "sage"
                      ? "bg-sage/10 text-sage"
                      : stat.color === "terracotta"
                        ? "bg-terracotta/10 text-terracotta"
                        : "bg-destructive/10 text-destructive",
                  ].join(" ")}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="font-mono text-2xl font-semibold text-foreground tabular-nums">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Actions rapides</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/clients/new"
            className="inline-flex items-center gap-2 rounded-lg bg-sage/10 border border-sage/20 px-4 py-2.5 text-sm font-medium text-sage hover:bg-sage/15 transition-colors cursor-pointer min-h-[44px]"
          >
            + Nouveau client
          </Link>
          <Link
            href="/dashboard/sessions/new"
            className="inline-flex items-center gap-2 rounded-lg bg-terracotta/10 border border-terracotta/20 px-4 py-2.5 text-sm font-medium text-terracotta hover:bg-terracotta/15 transition-colors cursor-pointer min-h-[44px]"
          >
            + Nouvelle séance
          </Link>
          <Link
            href="/dashboard/companies/new"
            className="inline-flex items-center gap-2 rounded-lg bg-muted border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors cursor-pointer min-h-[44px]"
          >
            + Programme entreprise
          </Link>
        </div>
      </div>

      {/* Upcoming sessions */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Prochaines séances</h2>
        {sessionIds.length === 0 ? (
          <div className="rounded-xl bg-card border border-border p-8 text-center">
            <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucune séance à venir</p>
            <Link
              href="/dashboard/sessions/new"
              className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-sage border border-sage/30 rounded-lg px-4 py-2.5 bg-sage/5 hover:bg-sage/10 transition-colors cursor-pointer min-h-[44px]"
            >
              Planifier une séance →
            </Link>
          </div>
        ) : (
          <div className="rounded-xl bg-card border border-border divide-y divide-border overflow-hidden">
            {sessionIds.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between px-5 py-3.5"
              >
                <p className="text-xs text-muted-foreground capitalize">
                  {session.type === "presentiel" ? "Présentiel" : "Visio"}
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  {new Intl.DateTimeFormat("fr-FR", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(session.date))}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}
