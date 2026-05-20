import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateReferralCode, getReferralStats } from "@/server/actions/referrals";
import { CopyLinkButton } from "./copy-link-button";

const REWARD_TIERS = [
  { threshold: 1, reward: "1 mois offert sur votre abonnement" },
  { threshold: 3, reward: "3 mois offerts" },
  { threshold: 5, reward: "6 mois offerts" },
  { threshold: 10, reward: "1 an offert" },
] as const;

export default async function AmbassadorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const [{ code }, stats] = await Promise.all([
    getOrCreateReferralCode(),
    getReferralStats(),
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://naya.app";
  const referralUrl = `${baseUrl}/sign-up?ref=${code}`;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-fraunces text-3xl font-semibold text-ink">
          Programme ambassadrice
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Partagez Naya avec vos collègues et gagnez des mois offerts.
        </p>
      </div>

      {/* Section 1 — Votre lien de parrainage */}
      <section className="space-y-3">
        <h2 className="font-fraunces text-xl font-semibold text-ink">
          Votre lien de parrainage
        </h2>
        <div className="rounded-xl bg-card border border-border p-6 space-y-5">
          {/* Code display */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Votre code unique
            </p>
            <p className="font-mono text-2xl font-bold text-sage tracking-widest">
              {code}
            </p>
          </div>

          {/* Full URL */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Lien de parrainage
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <code className="flex-1 rounded-lg bg-cream border border-border px-3 py-2.5 text-sm text-ink font-mono break-all">
                {referralUrl}
              </code>
              <CopyLinkButton url={referralUrl} />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Partagez ce lien avec vos collègues naturopathes, sophrologues ou
            hypnothérapeutes.
          </p>
        </div>
      </section>

      {/* Section 2 — Vos filleul·es */}
      <section className="space-y-3">
        <h2 className="font-fraunces text-xl font-semibold text-ink">Vos filleul·es</h2>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-card border border-border p-5 space-y-1 text-center">
            <p className="text-3xl font-bold text-sage">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total parrainages</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-5 space-y-1 text-center">
            <p className="text-3xl font-bold text-terracotta">{stats.converted}</p>
            <p className="text-sm text-muted-foreground">Convertis (abonnés)</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-5 space-y-1 text-center">
            <p className="text-3xl font-bold text-mist">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">En attente</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Un parrainage est converti dès que votre filleul·e souscrit à un abonnement
          payant.
        </p>
      </section>

      {/* Section 3 — Récompenses */}
      <section className="space-y-3">
        <h2 className="font-fraunces text-xl font-semibold text-ink">Récompenses</h2>
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-cream/50">
                <th className="px-5 py-3 text-left font-semibold text-ink">
                  Filleul·es convertis
                </th>
                <th className="px-5 py-3 text-left font-semibold text-ink">Récompense</th>
              </tr>
            </thead>
            <tbody>
              {REWARD_TIERS.map((tier, index) => (
                <tr
                  key={tier.threshold}
                  className={
                    index < REWARD_TIERS.length - 1 ? "border-b border-border" : ""
                  }
                >
                  <td className="px-5 py-3.5 font-mono font-semibold text-sage">
                    {tier.threshold}
                  </td>
                  <td className="px-5 py-3.5 text-ink">{tier.reward}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground">
          Les récompenses sont appliquées manuellement par notre équipe dans un délai de 7
          jours.
        </p>
      </section>

      {/* Section 4 — Comment ça marche */}
      <section className="space-y-3">
        <h2 className="font-fraunces text-xl font-semibold text-ink">
          Comment ça marche
        </h2>
        <div className="rounded-xl bg-card border border-border p-6">
          <ol className="space-y-5">
            {[
              "Partagez votre lien unique avec un·e collègue",
              "Elle s'inscrit sur Naya via votre lien",
              "Dès qu'elle souscrit à un abonnement, vous gagnez votre récompense",
            ].map((step, index) => (
              <li key={index} className="flex items-start gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage/10 text-sage text-sm font-bold">
                  {index + 1}
                </span>
                <p className="text-sm text-ink pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
