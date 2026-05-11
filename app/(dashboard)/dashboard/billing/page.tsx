import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getUserSubscription } from "@/lib/subscription"
import { createCheckoutSession, createPortalSession } from "@/server/actions/stripe"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Check, ExternalLink } from "lucide-react"

export const metadata = { title: "Facturation" }

const plans = [
  {
    id: "free" as const,
    name: "Gratuit",
    price: "$0",
    features: ["3 générations / mois", "1 client", "Export PDF basique"],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "$29/mois",
    features: ["50 générations / mois", "Clients illimités", "PDF brandé", "Partage clients", "Support prioritaire"],
    popular: true,
  },
  {
    id: "premium" as const,
    name: "Premium",
    price: "$79/mois",
    features: ["Générations illimitées", "Tout Pro", "Branding complet", "Onboarding dédié"],
  },
]

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const subscription = await getUserSubscription(user.id)
  const currentPlan = subscription?.plan ?? "free"
  const params = await searchParams

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Facturation</h1>
        <p className="text-muted-foreground text-sm mt-1">Gère ton abonnement FitCoach AI</p>
      </div>

      {params.success && (
        <div className="rounded-md bg-primary/10 border border-primary/20 p-4">
          <p className="text-sm text-primary font-medium">
            ✓ Abonnement mis à jour avec succès ! Bienvenue dans le plan {currentPlan}.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plan actuel</CardTitle>
          <CardDescription>
            {subscription?.stripe_subscription_id
              ? `Renouvellement le ${subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString("fr-FR") : "—"}`
              : "Plan gratuit sans abonnement"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="default" className="capitalize">
              {currentPlan}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {subscription?.status === "active"
                ? "Actif"
                : subscription?.status === "past_due"
                  ? "Paiement en retard"
                  : "Gratuit"}
            </span>
          </div>
          {subscription?.stripe_customer_id && (
            <form action={createPortalSession}>
              <Button variant="outline" size="sm" type="submit" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Gérer l&apos;abonnement
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4">Changer de plan</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={plan.popular ? "border-primary shadow-md" : ""}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                  {plan.popular && <Badge className="text-xs">Populaire</Badge>}
                </div>
                <p className="text-2xl font-bold">{plan.price}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Separator />
                {plan.id === currentPlan ? (
                  <Button variant="secondary" className="w-full" disabled>
                    Plan actuel
                  </Button>
                ) : plan.id === "free" ? (
                  <Button variant="outline" className="w-full" disabled>
                    Gratuit
                  </Button>
                ) : (
                  <form action={createCheckoutSession.bind(null, plan.id)}>
                    <Button className="w-full" type="submit" variant={plan.popular ? "default" : "outline"}>
                      Passer à {plan.name}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
