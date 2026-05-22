import type { Metadata } from "next";
import Link from "next/link";
import { DownloadGuideButton } from "./download-button";

export const metadata: Metadata = {
  title: "Votre guide gratuit | Naya",
  description: "Téléchargez votre guide pour structurer une cure naturopathique.",
  robots: { index: false },
};

export default function GuideMerciPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="py-5 px-6 border-b border-cream-300 print:hidden">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="font-fraunces text-2xl font-semibold text-ink">
              naya
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta mb-3 ml-0.5" />
            </span>
          </Link>
          <DownloadGuideButton />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        {/* Guide content */}
        <div id="guide-content">
          {/* Title */}
          <div className="mb-10 print:mb-8">
            <p className="text-xs font-medium text-sage uppercase tracking-widest mb-2">
              Guide gratuit Naya
            </p>
            <h1 className="font-fraunces text-4xl font-semibold text-ink leading-tight mb-3">
              Structurer une cure naturopathique efficace
            </h1>
            <p className="text-mist text-lg leading-relaxed">
              5 étapes pour accompagner vos clients avec clarté et cohérence.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-6">
            {[
              {
                num: "01",
                title: "Anamnèse complète",
                color: "sage",
                content:
                  "Recueillez les antécédents familiaux, le mode de vie (alimentation, sommeil, activité physique, stress), les plaintes principales et les traitements en cours. Une anamnèse approfondie prend 45 à 90 minutes et conditionne la qualité de toute la cure.",
                tips: [
                  "Utilisez un questionnaire structuré envoyé avant la consultation",
                  "Notez les médicaments pour éviter les interactions",
                  "Explorez les antécédents digestifs — souvent sous-estimés",
                ],
              },
              {
                num: "02",
                title: "Bilan vitalité",
                color: "terracotta",
                content:
                  "Évaluez l'énergie globale du client sur une échelle de 1 à 10, la qualité du sommeil, la régularité digestive, le niveau de stress perçu et la vitalité émotionnelle. Ce bilan donne le point de départ pour mesurer les progrès.",
                tips: [
                  "Faites remplir un bilan vitalité avant chaque séance de suivi",
                  "Distinguez fatigue chronique et fatigue situationnelle",
                  "Le transit est souvent le premier indicateur d'amélioration",
                ],
              },
              {
                num: "03",
                title: "Axes prioritaires",
                color: "sage",
                content:
                  "Identifiez 2 à 3 axes de travail maximum pour la cure. Trop d'axes simultanés dilue l'efficacité et décourage le client. Hiérarchisez : drainage en premier, puis terrain, puis symptômes.",
                tips: [
                  "Commencez toujours par le drainage avant tout autre protocole",
                  "Un axe = une intention claire et mesurable",
                  "Impliquez le client dans le choix des priorités",
                ],
              },
              {
                num: "04",
                title: "Protocole structuré",
                color: "terracotta",
                content:
                  "Définissez la durée (généralement 4 à 12 semaines), les compléments avec dosages et horaires de prise, les conseils d'hygiène de vie spécifiques, et les indicateurs de suivi. Rédigez le protocole de façon simple et lisible pour le client.",
                tips: [
                  "Limitez à 3-4 compléments maximum pour favoriser l'observance",
                  "Précisez systématiquement les horaires de prise",
                  "Ajoutez un tableau de suivi hebdomadaire simple",
                ],
              },
              {
                num: "05",
                title: "Réévaluation & ajustement",
                color: "sage",
                content:
                  "Planifiez un point à 3 semaines (message ou appel court) et une consultation de suivi à 6 semaines. La réévaluation permet d'ajuster les dosages, remplacer un complément mal toléré et célébrer les premiers résultats.",
                tips: [
                  "Réévaluez le bilan vitalité à chaque suivi",
                  "Notez les changements même mineurs — ils motivent le client",
                  "Adaptez le protocole, ne l'abandonnez pas au premier obstacle",
                ],
              },
            ].map((step) => (
              <div
                key={step.num}
                className={`rounded-2xl p-6 border ${
                  step.color === "sage"
                    ? "bg-sage/5 border-sage/20"
                    : "bg-terracotta/5 border-terracotta/20"
                }`}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`font-fraunces text-3xl font-bold leading-none shrink-0 ${
                      step.color === "sage" ? "text-sage/40" : "text-terracotta/40"
                    }`}
                  >
                    {step.num}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-fraunces text-xl font-semibold text-ink mb-2">
                      {step.title}
                    </h2>
                    <p className="text-sm text-ink/80 leading-relaxed mb-4">
                      {step.content}
                    </p>
                    <ul className="space-y-1.5">
                      {step.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-mist">
                          <span
                            className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                              step.color === "sage" ? "bg-sage" : "bg-terracotta"
                            }`}
                          />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tip box */}
          <div className="mt-8 rounded-2xl bg-ink/5 border border-ink/10 p-6">
            <p className="font-fraunces text-lg font-semibold text-ink mb-2">
              💡 Le conseil le plus important
            </p>
            <p className="text-sm text-ink/80 leading-relaxed">
              Commencez toujours par le drainage avant d&rsquo;introduire des compléments.
              Un terrain mal drainé réduit l&rsquo;efficacité de la majorité des
              protocoles. Foie, reins, intestin : les trois émonctoires à soutenir en
              priorité.
            </p>
          </div>
        </div>

        {/* CTA — hidden on print */}
        <div className="mt-12 rounded-2xl border-2 border-sage/30 bg-white p-8 text-center print:hidden">
          <p className="font-fraunces text-2xl font-semibold text-ink mb-2">
            Structurez vos cures en quelques minutes
          </p>
          <p className="text-mist text-sm leading-relaxed mb-6 max-w-sm mx-auto">
            Naya génère vos protocoles personnalisés et les envoie directement à vos
            clients. Gratuit pour commencer.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center rounded-xl bg-sage text-white px-8 py-3 text-sm font-medium min-h-[48px] hover:bg-sage/90 transition-colors"
          >
            Créer mon espace Naya →
          </Link>
        </div>

        <p className="text-center text-xs text-mist mt-8 print:hidden">
          <Link href="/" className="hover:text-ink transition-colors">
            ← Retour à l&rsquo;accueil
          </Link>
        </p>
      </main>
    </div>
  );
}
