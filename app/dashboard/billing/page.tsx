import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUserSubscription, isPlanActive } from "@/lib/subscription";
import type { Database } from "@/types/supabase";
import { UpgradeButton } from "./upgrade-button";
import { PortalButton } from "./portal-button";
import { Check } from "lucide-react";

type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];

const PLAN_LABELS: Record<string, string> = {
  free: "Découverte",
  cabinet: "Cabinet",
  cabinet_plus: "Cabinet + Entreprise",
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  active: { label: "Actif", className: "bg-sage/10 text-sage" },
  trialing: { label: "Essai", className: "bg-blue-50 text-blue-700" },
  past_due: { label: "Paiement en retard", className: "bg-amber-50 text-amber-700" },
  canceled: { label: "Annulé", className: "bg-muted text-muted-foreground" },
  unpaid: { label: "Impayé", className: "bg-red-50 text-red-700" },
};

const FEATURES = [
  { label: "Clients", free: "3 clients", cabinet: "30 clients", plus: "Illimité" },
  { label: "Protocoles IA / mois", free: "3", cabinet: "30", plus: "Illimité" },
  { label: "Séances & agenda", free: true, cabinet: true, plus: true },
  { label: "Devis & factures PDF", free: true, cabinet: true, plus: true },
  { label: "Tunnel client sécurisé", free: false, cabinet: true, plus: true },
  { label: "Signature électronique", free: false, cabinet: true, plus: true },
  { label: "Programme entreprise", free: false, cabinet: false, plus: true },
  { label: "Clonage vocal IA", free: false, cabinet: false, plus: true },
  { label: "Accès multi-praticiens", free: false, cabinet: false, plus: true },
  { label: "Support prioritaire", free: false, cabinet: false, plus: true },
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === "string")
    return <span className="text-sm text-foreground">{value}</span>;
  if (value) return <Check className="h-4 w-4 text-sage mx-auto" />;
  return <span className="text-muted-foreground text-sm">—</span>;
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; cancelled?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const params = await searchParams;
  const subscription = (await getUserSubscription(user.id)) as SubscriptionRow | null;
  const plan = subscription?.plan ?? "free";
  const active = isPlanActive(subscription);
  const statusInfo = STATUS_LABELS[subscription?.status ?? ""] ?? null;

  const periodEnd = subscription?.current_period_end
    ? new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(subscription.current_period_end))
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-fraunces text-3xl font-semibold text-ink">
          Abonnement &amp; facturation
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gérez votre plan et vos informations de paiement
        </p>
      </div>

      {params.success === "1" && (
        <div className="rounded-lg bg-sage/10 border border-sage/20 px-4 py-3 text-sage text-sm font-medium">
          Merci ! Votre abonnement a bien été activé.
        </div>
      )}
      {params.cancelled === "1" && (
        <div className="rounded-lg bg-muted border border-border px-4 py-3 text-muted-foreground text-sm">
          Le paiement a été annulé. Vous pouvez réessayer à tout moment.
        </div>
      )}

      {/* Current plan summary */}
      <div className="rounded-xl bg-card border border-border p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Plan actuel
            </p>
            <div className="flex items-center gap-3">
              <span className="font-fraunces text-2xl font-semibold text-foreground">
                {PLAN_LABELS[plan] ?? plan}
              </span>
              {statusInfo && (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.className}`}
                >
                  {statusInfo.label}
                </span>
              )}
            </div>
            {periodEnd && (
              <p className="text-sm text-muted-foreground">
                {active ? "Renouvellement le" : "Accès jusqu'au"} {periodEnd}
              </p>
            )}
            {plan === "free" && (
              <p className="text-sm text-muted-foreground">
                Gratuit — limites appliquées
              </p>
            )}
          </div>
          {plan !== "free" && <PortalButton />}
        </div>
      </div>

      {/* Plan comparison */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">
          Comparer les plans
        </h2>
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-4 bg-muted/50">
            <div className="p-4" />
            {(["free", "cabinet", "cabinet_plus"] as const).map((p) => (
              <div
                key={p}
                className={`p-4 text-center border-l border-border ${plan === p ? "bg-sage/5" : ""}`}
              >
                <p className="text-sm font-semibold text-foreground">{PLAN_LABELS[p]}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {p === "free"
                    ? "Gratuit"
                    : p === "cabinet"
                      ? "39 € / mois"
                      : "79 € / mois"}
                </p>
                {plan === p && (
                  <span className="inline-block mt-1 text-xs bg-sage/10 text-sage rounded-full px-2 py-0.5">
                    Plan actuel
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Features */}
          {FEATURES.map((feature, idx) => (
            <div
              key={feature.label}
              className={`grid grid-cols-4 border-t border-border ${idx % 2 === 0 ? "" : "bg-muted/20"}`}
            >
              <div className="p-3 px-4">
                <span className="text-sm text-foreground">{feature.label}</span>
              </div>
              <div
                className={`p-3 text-center border-l border-border ${plan === "free" ? "bg-sage/5" : ""}`}
              >
                <FeatureValue value={feature.free} />
              </div>
              <div
                className={`p-3 text-center border-l border-border ${plan === "cabinet" ? "bg-sage/5" : ""}`}
              >
                <FeatureValue value={feature.cabinet} />
              </div>
              <div
                className={`p-3 text-center border-l border-border ${plan === "cabinet_plus" ? "bg-sage/5" : ""}`}
              >
                <FeatureValue value={feature.plus} />
              </div>
            </div>
          ))}

          {/* CTA row */}
          <div className="grid grid-cols-4 border-t border-border bg-muted/30">
            <div className="p-4" />
            {/* Découverte */}
            <div className="p-4 border-l border-border flex items-center justify-center">
              {plan === "free" ? (
                <span className="text-xs text-sage font-medium">Plan actuel</span>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </div>
            {/* Cabinet */}
            <div className="p-4 border-l border-border flex items-center justify-center">
              {plan === "cabinet" ? (
                <span className="text-xs text-sage font-medium">Plan actuel</span>
              ) : plan === "cabinet_plus" ? (
                <span className="text-xs text-muted-foreground">
                  Rétrograder via le portail
                </span>
              ) : (
                <UpgradeButton plan="cabinet" label="Choisir Cabinet" />
              )}
            </div>
            {/* Cabinet Plus */}
            <div className="p-4 border-l border-border flex items-center justify-center">
              {plan === "cabinet_plus" ? (
                <span className="text-xs text-sage font-medium">Plan actuel</span>
              ) : (
                <UpgradeButton
                  plan="cabinet_plus"
                  label="Choisir Cabinet+"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-terracotta text-white px-4 py-2 text-sm font-medium hover:bg-terracotta/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Annual pricing note */}
      <p className="text-xs text-muted-foreground text-center">
        Économisez 20 % avec la facturation annuelle — Cabinet : 374,40 € / an · Cabinet+
        : 758,40 € / an. Configurez la facturation annuelle depuis le portail Stripe après
        votre abonnement.
      </p>
    </div>
  );
}
