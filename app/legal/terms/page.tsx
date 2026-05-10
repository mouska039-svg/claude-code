import { Navbar } from "@/components/shared/navbar"
import { Footer } from "@/components/shared/footer"

export const metadata = { title: "Conditions d'utilisation" }

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Conditions d&apos;utilisation</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptation des conditions</h2>
            <p>En utilisant FitCoach AI, vous acceptez les présentes conditions d&apos;utilisation. Ces conditions constituent un accord juridiquement contraignant entre vous et FitCoach AI.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Description du service</h2>
            <p>FitCoach AI est une plateforme SaaS permettant aux coachs fitness de générer des programmes d&apos;entraînement, des plans nutrition et des contenus social media à l&apos;aide de l&apos;intelligence artificielle.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Utilisation acceptable</h2>
            <p>Vous vous engagez à utiliser le service de manière légale et éthique. Toute utilisation abusive, frauduleuse ou contraire à nos politiques peut entraîner la suspension de votre compte.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Abonnements et paiements</h2>
            <p>Les abonnements sont facturés mensuellement. Vous pouvez annuler à tout moment. Les remboursements ne sont pas garantis sauf disposition légale contraire.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Propriété intellectuelle</h2>
            <p>Le contenu généré par l&apos;IA vous appartient. FitCoach AI conserve les droits sur la plateforme et ses technologies.</p>
          </section>
          <p className="mt-8 text-sm italic">Ces conditions doivent être complétées par un avocat avant toute utilisation commerciale.</p>
        </div>
      </main>
      <Footer />
    </>
  )
}
