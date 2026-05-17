export const metadata = {
  title: "Politique de confidentialité — Naya",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <article className="prose prose-neutral max-w-none">
      <h1 className="font-fraunces text-3xl font-semibold text-ink mb-8">
        Politique de confidentialité
      </h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">1. Données collectées</h2>
        <p className="text-foreground leading-relaxed">
          Naya collecte les données suivantes dans le cadre de la fourniture de ses
          services :
        </p>
        <ul className="list-disc pl-6 space-y-1 text-foreground">
          <li>Adresse e-mail et mot de passe (authentification)</li>
          <li>
            Informations de profil : nom complet, spécialité, logo, adresse
            professionnelle, numéros SIRET/RPPS/Adeli
          </li>
          <li>
            Données clients : nom, coordonnées, date de naissance, informations de santé
            saisies par le praticien
          </li>
          <li>Données de séances, protocoles et programmes entreprise</li>
          <li>
            Données de facturation (montants, statuts — numéros de carte gérés par Stripe)
          </li>
          <li>
            Données d&apos;usage anonymisées (pages visitées, fonctionnalités utilisées)
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">
          2. Base légale du traitement
        </h2>
        <ul className="list-disc pl-6 space-y-1 text-foreground">
          <li>
            <strong>Exécution du contrat</strong> : traitement des données nécessaires à
            la fourniture du service Naya (abonnement souscrit)
          </li>
          <li>
            <strong>Consentement</strong> : analytics, communications marketing (opt-in
            explicite)
          </li>
          <li>
            <strong>Obligation légale</strong> : conservation des factures conformément au
            Code de commerce français
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">
          3. Localisation des données
        </h2>
        <p className="text-foreground leading-relaxed">
          Toutes les données sont stockées au sein de l&apos;Union européenne. La base de
          données est hébergée par <strong>Supabase</strong> dans la région{" "}
          <strong>Frankfurt, Allemagne</strong> (AWS eu-central-1), conformément au RGPD.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">4. Partage des données</h2>
        <p className="text-foreground leading-relaxed">
          Naya ne vend pas vos données. Elles peuvent être partagées uniquement avec :
        </p>
        <ul className="list-disc pl-6 space-y-1 text-foreground">
          <li>
            <strong>Stripe</strong> : traitement des paiements (certifié PCI-DSS)
          </li>
          <li>
            <strong>Supabase</strong> : hébergement des données (sous-traitant)
          </li>
          <li>
            <strong>Vercel</strong> : hébergement de l&apos;application
          </li>
          <li>
            <strong>Resend</strong> : envoi d&apos;e-mails transactionnels
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">5. Durée de conservation</h2>
        <p className="text-foreground leading-relaxed">
          Les données sont conservées pendant toute la durée de votre abonnement actif. En
          cas de résiliation, vos données sont supprimées dans un délai de{" "}
          <strong>30 jours</strong> après la date de clôture du compte, sauf obligation
          légale contraire (factures conservées 10 ans conformément au Code de commerce).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">6. Vos droits</h2>
        <p className="text-foreground leading-relaxed">
          Conformément au RGPD, vous disposez des droits suivants :
        </p>
        <ul className="list-disc pl-6 space-y-1 text-foreground">
          <li>
            <strong>Droit d&apos;accès</strong> : obtenir une copie de vos données via{" "}
            <a href="/api/rgpd/export" className="text-sage hover:underline">
              l&apos;export RGPD
            </a>
          </li>
          <li>
            <strong>Droit de rectification</strong> : corriger vos données dans les
            paramètres du compte
          </li>
          <li>
            <strong>Droit à l&apos;effacement</strong> : demander la suppression de votre
            compte
          </li>
          <li>
            <strong>Droit à la portabilité</strong> : recevoir vos données dans un format
            structuré via{" "}
            <a href="/api/rgpd/export" className="text-sage hover:underline">
              l&apos;export JSON
            </a>
          </li>
          <li>
            <strong>Droit d&apos;opposition</strong> : vous opposer à certains traitements
          </li>
        </ul>
        <p className="text-foreground leading-relaxed mt-4">
          Pour exercer ces droits, contactez notre DPO :{" "}
          <a href="mailto:dpo@naya.app" className="text-sage hover:underline">
            dpo@naya.app
          </a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">7. Cookies</h2>
        <p className="text-foreground leading-relaxed">
          Naya utilise des cookies strictement nécessaires au fonctionnement du service
          (authentification, session) ainsi que des cookies analytiques anonymisés
          (PostHog, avec consentement).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">8. Contact DPO</h2>
        <p className="text-foreground leading-relaxed">
          Délégué à la Protection des Données (DPO) :{" "}
          <a href="mailto:dpo@naya.app" className="text-sage hover:underline">
            dpo@naya.app
          </a>
          <br />
          Vous disposez également du droit d&apos;introduire une réclamation auprès de la{" "}
          <a
            href="https://www.cnil.fr"
            className="text-sage hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            CNIL
          </a>
          .
        </p>
      </section>

      <p className="text-sm text-muted-foreground mt-12">
        Dernière mise à jour : mai 2026
      </p>
    </article>
  );
}
