import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, FileText, TrendingUp, Zap, ArrowRight } from "lucide-react";
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

  const upcomingSessions = (sessionsRaw ?? []).map(
    (s) => s as { id: string; date: string; type: string }
  );

  const STATS = [
    {
      label: "Clients actifs",
      value: data.activeClients,
      icon: Users,
      color: "sage" as const,
      description: "en suivi",
      href: "/dashboard/clients",
    },
    {
      label: "Cures en cours",
      value: data.activeCures,
      icon: FileText,
      color: "terracotta" as const,
      description: "protocoles actifs",
      href: "/dashboard/protocols",
    },
    {
      label: "CA du mois",
      value: formatCurrency(data.monthlyRevenue),
      icon: TrendingUp,
      color: "sage" as const,
      description: "facturé ce mois",
      href: "/dashboard/invoices",
    },
    {
      label: "Quota restant",
      value: data.quotaRemaining,
      icon: Zap,
      color: (data.quotaRemaining === "0" ? "destructive" : "terracotta") as
        | "terracotta"
        | "destructive",
      description: "protocoles ce mois",
      href: "/dashboard/billing",
    },
  ];

  const colorMap = {
    sage: {
      border: "border-l-sage",
      icon: "bg-sage/10 text-sage",
    },
    terracotta: {
      border: "border-l-terracotta",
      icon: "bg-terracotta/10 text-terracotta",
    },
    destructive: {
      border: "border-l-destructive",
      icon: "bg-destructive/10 text-destructive",
    },
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
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
          const colors = colorMap[stat.color];
          return (
            <Link
              key={stat.label}
              href={stat.href}
              aria-label={`${stat.label}: ${stat.value}`}
              className={[
                "group rounded-xl bg-card border border-border border-l-4 p-5",
                "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                colors.border,
              ].join(" ")}
            >
              {/* Icon */}
              <div className={["w-fit p-2.5 rounded-xl mb-4", colors.icon].join(" ")}>
                <Icon className="h-5 w-5" />
              </div>

              {/* Value */}
              <p className="font-fraunces text-3xl font-semibold text-ink tabular-nums leading-none">
                {stat.value}
              </p>

              {/* Label + description */}
              <p className="text-xs font-medium text-muted-foreground mt-2">
                {stat.label}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">
                {stat.description}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Actions rapides</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/clients/new"
            className="inline-flex items-center gap-2 rounded-lg bg-sage/10 border border-sage/20 px-4 py-2.5 text-sm font-medium text-sage hover:bg-sage/15 transition-colors min-h-[44px]"
          >
            + Nouveau client
          </Link>
          <Link
            href="/dashboard/sessions/new"
            className="inline-flex items-center gap-2 rounded-lg bg-terracotta/10 border border-terracotta/20 px-4 py-2.5 text-sm font-medium text-terracotta hover:bg-terracotta/15 transition-colors min-h-[44px]"
          >
            + Nouvelle séance
          </Link>
          <Link
            href="/dashboard/companies/new"
            className="inline-flex items-center gap-2 rounded-lg bg-muted border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors min-h-[44px]"
          >
            + Programme entreprise
          </Link>
        </div>
      </div>

      {/* Upcoming sessions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Prochaines séances</h2>
          {upcomingSessions.length > 0 && (
            <Link
              href="/dashboard/sessions"
              className="text-xs text-sage hover:underline inline-flex items-center gap-1"
            >
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {upcomingSessions.length === 0 ? (
          <div className="rounded-xl bg-card border border-border p-8 text-center">
            <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">Aucune séance à venir</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Planifiez votre prochaine séance pour la voir apparaître ici
            </p>
            <Link
              href="/dashboard/sessions/new"
              className="inline-flex items-center gap-1 text-sm font-medium text-sage border border-sage/30 rounded-lg px-4 py-2.5 bg-sage/5 hover:bg-sage/10 transition-colors min-h-[44px]"
            >
              Planifier une séance →
            </Link>
          </div>
        ) : (
          <div className="rounded-xl bg-card border border-border divide-y divide-border overflow-hidden">
            {upcomingSessions.map((session) => (
              <Link
                key={session.id}
                href={`/dashboard/sessions/${session.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/40 transition-colors min-h-[52px]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={[
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      session.type === "presentiel"
                        ? "bg-sage/10 text-sage"
                        : "bg-terracotta/10 text-terracotta",
                    ].join(" ")}
                  >
                    {session.type === "presentiel" ? "Présentiel" : "Visio"}
                  </span>
                </div>
                <p className="text-xs font-medium text-muted-foreground">
                  {new Intl.DateTimeFormat("fr-FR", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(session.date))}
                </p>
              </Link>
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
