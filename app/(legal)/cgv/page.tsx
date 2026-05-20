export const metadata = {
  title: "Conditions Générales de Vente — Naya",
};

export default function CGVPage() {
  return (
    <article className="prose prose-neutral max-w-none">
      <h1 className="font-fraunces text-3xl font-semibold text-ink mb-8">
        Conditions Générales de Vente
      </h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">1. Objet</h2>
        <p className="text-foreground leading-relaxed">
          Les présentes Conditions Générales de Vente (CGV) régissent les relations
          contractuelles entre Naya SAS et tout professionnel de santé bien-être (ci-après
          « Praticien ») souscrivant à l&apos;un des abonnements proposés sur la
          plateforme Naya.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">2. Offres et tarifs</h2>
        <p className="text-foreground leading-relaxed mb-4">
          Naya propose les plans d&apos;abonnement suivants :
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="text-left p-3 border border-border font-semibold">Plan</th>
                <th className="text-left p-3 border border-border font-semibold">
                  Tarif
                </th>
                <th className="text-left p-3 border border-border font-semibold">
                  Inclus
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border border-border font-medium">Découverte</td>
                <td className="p-3 border border-border">Gratuit</td>
                <td className="p-3 border border-border">
                  3 protocoles/mois, fonctionnalités de base
                </td>
              </tr>
              <tr className="bg-muted/30">
                <td className="p-3 border border-border font-medium">Cabinet</td>
                <td className="p-3 border border-border">39 € HT/mois</td>
                <td className="p-3 border border-border">
                  30 protocoles/mois, facturation, clients illimités
                </td>
              </tr>
              <tr>
                <td className="p-3 border border-border font-medium">Cabinet+</td>
                <td className="p-3 border border-border">79 € HT/mois</td>
                <td className="p-3 border border-border">
                  Protocoles illimités, programmes entreprise, priorité support
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-foreground leading-relaxed mt-4">
          Les tarifs s&apos;entendent hors taxes. La TVA applicable est de 20 % pour les
          praticiens assujettis. Les prix sont susceptibles d&apos;évoluer ; les
          modifications tarifaires sont notifiées par e-mail 30 jours avant leur entrée en
          vigueur.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">3. Paiement</h2>
        <p className="text-foreground leading-relaxed">
          Le paiement est effectué via <strong>Stripe</strong>, prestataire de paiement
          sécurisé certifié PCI-DSS. Les abonnements sont facturés mensuellement par
          prélèvement automatique sur la carte bancaire enregistrée. En cas d&apos;échec
          de paiement, Naya se réserve le droit de suspendre l&apos;accès au service après
          notification.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">
          4. Renouvellement automatique
        </h2>
        <p className="text-foreground leading-relaxed">
          Les abonnements sont à renouvellement automatique mensuel. L&apos;abonnement se
          renouvelle automatiquement à la date anniversaire jusqu&apos;à résiliation
          explicite par le Praticien depuis son espace « Abonnement » ou par e-mail à{" "}
          <a href="mailto:contact@naya.app" className="text-sage hover:underline">
            contact@naya.app
          </a>
          . La résiliation prend effet à la fin de la période en cours.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">5. Droit de rétractation</h2>
        <p className="text-foreground leading-relaxed">
          Conformément à l&apos;article L221-18 du Code de la consommation, le Praticien
          dispose d&apos;un délai de <strong>14 jours calendaires</strong> à compter de la
          date du premier paiement pour exercer son droit de rétractation, sans avoir à
          justifier de motifs ni à payer de pénalités. Pour exercer ce droit, adressez un
          e-mail à{" "}
          <a href="mailto:contact@naya.app" className="text-sage hover:underline">
            contact@naya.app
          </a>{" "}
          avec la mention « Rétractation » en objet. Le remboursement sera effectué sous
          14 jours.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">6. Accès au service</h2>
        <p className="text-foreground leading-relaxed">
          Naya s&apos;engage à mettre tout en œuvre pour assurer la disponibilité du
          service 24h/24 et 7j/7. Des interruptions ponctuelles peuvent survenir pour
          maintenance, sans ouvrir droit à indemnité sauf indisponibilité prolongée
          supérieure à 72 heures consécutives.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">7. Propriété des données</h2>
        <p className="text-foreground leading-relaxed">
          Les données saisies par le Praticien (clients, séances, protocoles) lui
          appartiennent intégralement. Naya agit en qualité de sous-traitant au sens du
          RGPD. En cas de résiliation, le Praticien peut exporter l&apos;intégralité de
          ses données avant clôture du compte.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">8. Responsabilité</h2>
        <p className="text-foreground leading-relaxed">
          Naya est une plateforme de gestion administrative. Les protocoles générés par
          Naya sont fournis à titre indicatif et ne remplacent pas le jugement clinique du
          praticien. Naya ne saurait être tenu responsable de décisions prises sur la base
          de ces recommandations. La responsabilité de Naya est limitée au montant des
          sommes effectivement payées au cours des 3 derniers mois.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">
          9. Droit applicable et litiges
        </h2>
        <p className="text-foreground leading-relaxed">
          Les présentes CGV sont soumises au <strong>droit français</strong>. En cas de
          litige, les parties s&apos;engagent à rechercher une solution amiable avant
          toute action judiciaire. À défaut d&apos;accord, les tribunaux compétents de
          Paris seront seuls habilités.
        </p>
      </section>

      <p className="text-sm text-muted-foreground mt-12">
        Dernière mise à jour : mai 2026
      </p>
    </article>
  );
}
