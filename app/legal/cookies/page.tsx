import { Navbar } from "@/components/shared/navbar"
import { Footer } from "@/components/shared/footer"

export const metadata = { title: "Politique de cookies" }

export default function CookiesPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Politique de cookies</h1>
        <div className="space-y-6 text-muted-foreground">
          <p className="text-sm mb-8">Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Cookies essentiels</h2>
            <p>Ces cookies sont nécessaires au fonctionnement du service (session d&apos;authentification, préférences). Ils ne peuvent pas être désactivés.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Cookies analytiques</h2>
            <p>Nous utilisons PostHog pour analyser l&apos;utilisation du service et améliorer nos fonctionnalités. Ces cookies ne sont activés qu&apos;avec votre consentement.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Gestion des cookies</h2>
            <p>Vous pouvez gérer vos préférences de cookies à tout moment via la bannière de consentement ou les paramètres de votre navigateur.</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
