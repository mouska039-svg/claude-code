import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Salad, Clock } from "lucide-react"

export const metadata = { title: "Plans nutrition" }

export default async function NutritionPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const { data: plans } = await supabase
    .from("nutrition_plans")
    .select("id, title, created_at, output")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plans nutrition</h1>
          <p className="text-muted-foreground text-sm mt-1">Tes plans nutritionnels générés par l&apos;IA</p>
        </div>
        <Button className="gap-2" asChild>
          <Link href="/dashboard/nutrition/new">
            <Plus className="h-4 w-4" />
            Nouveau plan
          </Link>
        </Button>
      </div>

      {(!plans || plans.length === 0) ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <Salad className="h-10 w-10 text-muted-foreground/30" />
            <div className="text-center">
              <p className="font-medium">Aucun plan nutrition pour l&apos;instant</p>
              <p className="text-sm text-muted-foreground mt-1">Génère ton premier plan en quelques secondes</p>
            </div>
            <Button className="gap-2" asChild>
              <Link href="/dashboard/nutrition/new"><Plus className="h-4 w-4" />Créer un plan</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {plans.map((plan) => {
            const output = plan.output as { targetCalories?: number; targetProtein?: number; overview?: string } | null
            return (
              <Link key={plan.id} href={`/dashboard/nutrition/${plan.id}`}>
                <Card className="hover:border-primary/30 transition-colors cursor-pointer h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold line-clamp-2">{plan.title}</h3>
                      {output?.targetCalories && (
                        <Badge variant="secondary" className="text-xs shrink-0">{output.targetCalories} kcal</Badge>
                      )}
                    </div>
                    {output?.overview && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{output.overview}</p>
                    )}
                    <div className="flex items-center gap-1 mt-4 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(plan.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
