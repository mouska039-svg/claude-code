import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Accord de traitement des données (DPA) | Naya",
};

export default function DPAPage() {
  return (
    <article className="prose prose-neutral max-w-none">
      <h1 className="font-fraunces text-3xl font-semibold text-ink mb-2">
        Accord de traitement des données
      </h1>
      <p className="text-muted-foreground text-base mb-1">
        Conformément au Règlement (UE) 2016/679 (RGPD)
      </p>
      <p className="text-sm text-muted-foreground mb-10">Version du 1er janvier 2025</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">1. Parties</h2>
        <p className="text-foreground leading-relaxed">
          Le présent accord est conclu entre :
        </p>
        <ul className="mt-3 space-y-2 text-foreground leading-relaxed">
          <li>
            <strong>Naya SAS</strong>, société par actions simplifiée immatriculée au
            Registre du Commerce et des Sociétés de Paris, agissant en qualité de{" "}
            <strong>responsable du traitement</strong> au sens de l&apos;article 4 du RGPD
            (ci-après « Naya ») ;
          </li>
          <li>
            Tout professionnel de santé bien-être souscrivant à la plateforme Naya
            (ci-après « le Praticien »), agissant en qualité de{" "}
            <strong>sous-traitant</strong> pour le traitement des données de ses clients.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">2. Objet</h2>
        <p className="text-foreground leading-relaxed">
          Le présent accord a pour objet de définir les conditions dans lesquelles Naya,
          en sa qualité de responsable du traitement, confie au Praticien le traitement
          des données à caractère personnel de ses clients dans le cadre de
          l&apos;utilisation de la plateforme Naya. Il précise les obligations respectives
          des parties en matière de protection des données, conformément aux dispositions
          du RGPD et de la loi n° 78-17 du 6 janvier 1978 relative à l&apos;informatique,
          aux fichiers et aux libertés.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">3. Données traitées</h2>
        <p className="text-foreground leading-relaxed mb-3">
          Dans le cadre de l&apos;utilisation de la plateforme, les catégories de données
          suivantes sont susceptibles d&apos;être traitées :
        </p>
        <ul className="space-y-1 text-foreground leading-relaxed">
          <li>
            <strong>Données d&apos;identité :</strong> nom, prénom, date de naissance ;
          </li>
          <li>
            <strong>Données de contact :</strong> adresse e-mail, numéro de téléphone ;
          </li>
          <li>
            <strong>Données de santé :</strong> anamnèses, symptômes, antécédents
            médicaux, bilans de bien-être (catégorie spéciale au sens de l&apos;article 9
            du RGPD) ;
          </li>
          <li>
            <strong>Données de suivi :</strong> comptes rendus de séances, protocoles,
            check-ins, recommandations ;
          </li>
          <li>
            <strong>Données de facturation :</strong> coordonnées de facturation,
            historique des paiements.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">4. Finalités</h2>
        <p className="text-foreground leading-relaxed mb-3">
          Les traitements réalisés au moyen de la plateforme Naya ont pour finalités :
        </p>
        <ul className="space-y-1 text-foreground leading-relaxed">
          <li>
            Le suivi individuel des clients et la gestion du parcours de bien-être ;
          </li>
          <li>
            La génération de protocoles personnalisés sur la base des informations
            recueillies lors des consultations ;
          </li>
          <li>La facturation et la gestion administrative du cabinet du Praticien ;</li>
          <li>
            L&apos;amélioration continue de la qualité de la plateforme, sur la base de
            données agrégées et anonymisées.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">5. Durée de conservation</h2>
        <p className="text-foreground leading-relaxed">
          Les données sont conservées pendant toute la durée du contrat liant le Praticien
          à Naya. À l&apos;issue du contrat, les données font l&apos;objet d&apos;une
          archivage intermédiaire pendant une durée de <strong>5 ans</strong>,
          conformément aux obligations légales applicables en France. Au-delà de ce délai,
          les données sont définitivement supprimées ou anonymisées.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">
          6. Obligations du sous-traitant
        </h2>
        <p className="text-foreground leading-relaxed mb-3">
          En sa qualité de sous-traitant, le Praticien s&apos;engage à :
        </p>
        <ul className="space-y-2 text-foreground leading-relaxed">
          <li>
            <strong>Confidentialité :</strong> ne traiter les données personnelles que sur
            instruction documentée de Naya, et garantir que les personnes autorisées à
            traiter ces données s&apos;engagent à respecter la confidentialité ou sont
            soumises à une obligation légale appropriée ;
          </li>
          <li>
            <strong>Mesures de sécurité :</strong> mettre en œuvre les mesures techniques
            et organisationnelles appropriées pour protéger les données contre toute
            destruction accidentelle ou illicite, perte accidentelle, altération,
            diffusion ou accès non autorisé ;
          </li>
          <li>
            <strong>Notification des violations :</strong> notifier Naya dans les
            meilleurs délais après avoir pris connaissance d&apos;une violation de données
            à caractère personnel, et ce dans un délai maximum de{" "}
            <strong>72 heures</strong> ;
          </li>
          <li>
            <strong>Sous-traitance ultérieure :</strong> ne pas faire appel à un
            sous-traitant ultérieur sans l&apos;autorisation écrite préalable de Naya ;
          </li>
          <li>
            <strong>Coopération :</strong> apporter son concours à Naya pour répondre aux
            demandes d&apos;exercice des droits des personnes concernées.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">7. Transferts de données</h2>
        <p className="text-foreground leading-relaxed">
          Les données traitées via la plateforme Naya sont hébergées en France, sur des
          infrastructures certifiées ISO 27001 (OVHcloud ou Scaleway). Aucun transfert de
          données à caractère personnel n&apos;est réalisé en dehors de l&apos;Espace
          économique européen (EEE) sans garanties appropriées au sens du Chapitre V du
          RGPD. Les sous-traitants tiers éventuellement utilisés (services de paiement,
          envoi de courriels) sont établis au sein de l&apos;Union européenne ou disposent
          de clauses contractuelles types approuvées par la Commission européenne.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">
          8. Droits des personnes concernées
        </h2>
        <p className="text-foreground leading-relaxed mb-3">
          Conformément aux articles 15 à 22 du RGPD, toute personne dont les données sont
          traitées via la plateforme Naya dispose des droits suivants :
        </p>
        <ul className="space-y-1 text-foreground leading-relaxed">
          <li>
            <strong>Droit d&apos;accès</strong> : obtenir une copie des données la
            concernant ;
          </li>
          <li>
            <strong>Droit de rectification</strong> : demander la correction de données
            inexactes ou incomplètes ;
          </li>
          <li>
            <strong>Droit à l&apos;effacement</strong> (« droit à l&apos;oubli ») :
            demander la suppression de ses données dans les conditions prévues par le RGPD
            ;
          </li>
          <li>
            <strong>Droit à la portabilité</strong> : recevoir ses données dans un format
            structuré, couramment utilisé et lisible par machine ;
          </li>
          <li>
            <strong>Droit d&apos;opposition</strong> : s&apos;opposer à tout moment au
            traitement de ses données pour des raisons tenant à sa situation particulière
            ;
          </li>
          <li>
            <strong>Droit à la limitation</strong> : demander la suspension temporaire du
            traitement de ses données.
          </li>
        </ul>
        <p className="text-foreground leading-relaxed mt-4">
          Ces droits peuvent être exercés directement auprès du Praticien, qui est tenu
          d&apos;y donner suite dans un délai d&apos;un mois, ou auprès de Naya à
          l&apos;adresse{" "}
          <a href="mailto:dpo@naya.app" className="text-sage hover:underline">
            dpo@naya.app
          </a>
          . En cas de désaccord, toute personne dispose du droit d&apos;introduire une
          réclamation auprès de la CNIL.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-ink mb-3">
          9. Contact — Délégué à la protection des données (DPO)
        </h2>
        <p className="text-foreground leading-relaxed">
          Naya a désigné un délégué à la protection des données (DPO) joignable à
          l&apos;adresse suivante :{" "}
          <a href="mailto:dpo@naya.app" className="text-sage hover:underline">
            dpo@naya.app
          </a>
          . Le DPO est chargé de veiller au respect du présent accord, de conseiller les
          équipes de Naya sur les questions relatives à la protection des données et de
          constituer le point de contact avec la CNIL.
        </p>
      </section>

      <div className="border-t border-border pt-8 mt-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Dernière mise à jour : janvier 2025
        </p>
        <Link
          href="/politique-de-confidentialite"
          className="text-sm text-sage hover:underline"
        >
          Politique de confidentialité →
        </Link>
      </div>
    </article>
  );
}
