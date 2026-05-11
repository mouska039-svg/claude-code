import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getUserSubscription } from "@/lib/subscription"
import { checkQuota } from "@/lib/quotas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { OverviewChart } from "@/components/shared/overview-chart"
import Link from "next/link"
import { Dumbbell, Salad, Megaphone, Users, Plus, ArrowRight } from "lucide-react"
import { Suspense } from "react"

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
}: {
  title: string
  value: string | number
  sub?: string
  icon: React.ElementType
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}

function generateChartData() {
  const data = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    data.push({
      date: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      count: Math.floor(Math.random() * 5),
    })
  }
  return data
}

async function DashboardContent() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const [
    subscription,
    programsQuota,
    { count: programsCount },
    { count: clientsCount },
    { data: recentPrograms },
    { data: recentNutrition },
    { data: recentContent },
  ] = await Promise.all([
    getUserSubscription(user.id),
    checkQuota(user.id, "programs"),
    supabase
      .from("workout_programs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("workout_programs")
      .select("id, title, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("nutrition_plans")
      .select("id, title, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(2),
    supabase
      .from("social_contents")
      .select("id, topic, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(2),
  ])

  const planLabel =
    subscription?.plan === "premium"
      ? "Premium"
      : subscription?.plan === "pro"
        ? "Pro"
        : "Gratuit"

  const quotaLabel =
    programsQuota.limit === null
      ? "Illimité"
      : `${programsQuota.remaining ?? 0}/${programsQuota.limit} restants`

  const chartData = generateChartData()

  const allRecent = [
    ...(recentPrograms ?? []).map((p) => ({
      id: p.id,
      title: p.title,
      type: "Programme",
      href: `/dashboard/programs/${p.id}`,
      date: p.created_at,
    })),
    ...(recentNutrition ?? []).map((n) => ({
      id: n.id,
      title: n.title,
      type: "Nutrition",
      href: `/dashboard/nutrition/${n.id}`,
      date: n.created_at,
    })),
    ...(recentContent ?? []).map((c) => ({
      id: c.id,
      title: c.topic,
      type: "Contenu",
      href: `/dashboard/content/${c.id}`,
      date: c.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vue d&apos;ensemble</h1>
        <p className="text-muted-foreground text-sm mt-1">Bienvenue sur ton dashboard FitCoach AI</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Programmes ce mois"
          value={programsCount ?? 0}
          icon={Dumbbell}
        />
        <StatCard
          title="Clients actifs"
          value={clientsCount ?? 0}
          icon={Users}
        />
        <StatCard
          title="Plan actuel"
          value={planLabel}
          sub={subscription?.current_period_end
            ? `Renouvellement le ${new Date(subscription.current_period_end).toLocaleDateString("fr-FR")}`
            : undefined}
          icon={Megaphone}
        />
        <StatCard
          title="Quota mensuel"
          value={quotaLabel}
          sub={`Plan ${planLabel}`}
          icon={Salad}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Générations — 30 derniers jours</CardTitle>
          </CardHeader>
          <CardContent>
            <OverviewChart data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Accès rapide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { href: "/dashboard/programs/new", label: "Nouveau programme", icon: Dumbbell },
              { href: "/dashboard/nutrition/new", label: "Nouveau plan nutrition", icon: Salad },
              { href: "/dashboard/content/new", label: "Créer du contenu", icon: Megaphone },
              { href: "/dashboard/clients/new", label: "Ajouter un client", icon: Users },
            ].map((item) => (
              <Button key={item.href} variant="outline" className="w-full justify-start gap-2 h-9" asChild>
                <Link href={item.href}>
                  <Plus className="h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Dernières générations</CardTitle>
          <Button variant="ghost" size="sm" className="gap-1 text-xs" asChild>
            <Link href="/dashboard/programs">
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {allRecent.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">Aucune génération pour l&apos;instant</p>
              <Button className="mt-4 gap-2" asChild>
                <Link href="/dashboard/programs/new">
                  <Plus className="h-4 w-4" />
                  Créer ton premier programme
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {allRecent.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={item.href}
                  className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {item.type}
                    </Badge>
                    <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-none">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 ml-4">
                    {new Date(item.date).toLocaleDateString("fr-FR")}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
          <Skeleton className="h-64" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}
