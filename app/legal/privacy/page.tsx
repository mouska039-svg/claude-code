import { Navbar } from "@/components/shared/navbar"
import { Footer } from "@/components/shared/footer"

export const metadata = { title: "Politique de confidentialité" }

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Politique de confidentialité</h1>
        <div className="space-y-6 text-muted-foreground">
          <p className="text-sm mb-8">Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Données collectées</h2>
            <p>Nous collectons les données suivantes : informations de compte (nom, email), données d&apos;utilisation (générations IA, clients), et données de facturation (via Stripe).</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Utilisation des données</h2>
            <p>Vos données sont utilisées pour fournir le service, améliorer nos fonctionnalités et communiquer avec vous. Nous ne vendons jamais vos données à des tiers.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Vos droits (RGPD)</h2>
            <p>Conformément au RGPD, vous avez le droit d&apos;accéder, rectifier, supprimer et exporter vos données. Contactez-nous pour exercer ces droits.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Conservation des données</h2>
            <p>Vos données sont conservées tant que votre compte est actif. Après suppression, les données sont effacées sous 30 jours.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Cookies</h2>
            <p>Nous utilisons des cookies essentiels pour le fonctionnement du service et des cookies analytiques (PostHog) avec votre consentement.</p>
          </section>
          <p className="mt-8 text-sm italic">Cette politique doit être complétée par un avocat avant toute utilisation commerciale.</p>
        </div>
      </main>
      <Footer />
    </>
  )
}
