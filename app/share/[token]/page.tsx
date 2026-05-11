import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dumbbell, Salad, Calendar } from "lucide-react"
import type { WorkoutProgramOutput } from "@/lib/ai/schemas/workout"
import type { NutritionPlanOutput } from "@/lib/ai/schemas/nutrition"

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  const { data: shareToken } = await supabase
    .from("share_tokens")
    .select("*")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .single()

  if (!shareToken) notFound()

  const [{ data: profile }] = await Promise.all([
    supabase.from("profiles").select("brand_name, brand_color, brand_logo_url").eq("id", shareToken.user_id).single(),
  ])

  const brandName = profile?.brand_name ?? "FitCoach AI"

  if (shareToken.resource_type === "program") {
    const { data: program } = await supabase
      .from("workout_programs")
      .select("*")
      .eq("id", shareToken.resource_id)
      .single()

    if (!program) notFound()
    const output = program.output as WorkoutProgramOutput

    return (
      <SharedProgramView program={output} brandName={brandName} createdAt={program.created_at} />
    )
  }

  if (shareToken.resource_type === "nutrition") {
    const { data: plan } = await supabase
      .from("nutrition_plans")
      .select("*")
      .eq("id", shareToken.resource_id)
      .single()

    if (!plan) notFound()
    const output = plan.output as NutritionPlanOutput

    return <SharedNutritionView plan={output} brandName={brandName} createdAt={plan.created_at} />
  }

  notFound()
}

function SharedProgramView({ program, brandName, createdAt }: { program: WorkoutProgramOutput; brandName: string; createdAt: string }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-bold text-primary">{brandName}</span>
          <span className="text-xs text-muted-foreground">
            Partagé le {new Date(createdAt).toLocaleDateString("fr-FR")}
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">{program.title}</h1>
          </div>
          <p className="text-muted-foreground text-sm">{program.durationWeeks} semaines · Programme personnalisé</p>
        </div>

        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">{program.overview}</p>
          </CardContent>
        </Card>

        {program.weeks.map((week) => (
          <div key={week.weekNumber}>
            <h2 className="font-semibold mb-3 text-primary">Semaine {week.weekNumber}</h2>
            <div className="space-y-3">
              {week.days.map((day, di) => (
                <Card key={di}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{day.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">{day.focus}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {day.exercises.map((ex, ei) => (
                        <div key={ei} className="grid grid-cols-4 gap-2 text-sm py-1 border-b border-border/50 last:border-0">
                          <span className="col-span-2 font-medium">{ex.name}</span>
                          <span className="text-muted-foreground text-center">{ex.sets} × {ex.reps}</span>
                          <span className="text-muted-foreground text-right">{ex.rest}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {program.progressionNotes && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Notes de progression</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{program.progressionNotes}</p>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground pt-4">
          Programme créé avec {brandName} · Powered by AI
        </p>
      </div>
    </div>
  )
}

function SharedNutritionView({ plan, brandName, createdAt }: { plan: NutritionPlanOutput; brandName: string; createdAt: string }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-bold text-primary">{brandName}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Partagé le {new Date(createdAt).toLocaleDateString("fr-FR")}
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Salad className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">{plan.title}</h1>
          </div>
          <p className="text-muted-foreground text-sm">{plan.targetCalories} kcal/jour · Plan nutritionnel 7 jours</p>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Calories", value: `${plan.targetCalories}` },
            { label: "Protéines", value: `${plan.targetProtein}g` },
            { label: "Glucides", value: `${plan.targetCarbs}g` },
            { label: "Lipides", value: `${plan.targetFat}g` },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold mt-1">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {plan.tips.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Conseils nutritionnels</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-primary shrink-0">•</span>{tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {plan.days.map((day) => (
          <Card key={day.day}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{day.day}</CardTitle>
                <Badge variant="secondary">{day.dailyCalories} kcal</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {day.meals.map((meal) => (
                <div key={meal.name} className="rounded bg-muted/40 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{meal.name}</span>
                    <span className="text-xs text-muted-foreground">{meal.time} · {meal.totalCalories} kcal</span>
                  </div>
                  {meal.foods.map((food, fi) => (
                    <div key={fi} className="flex justify-between text-xs text-muted-foreground">
                      <span>{food.food} ({food.quantity})</span>
                      <span>{food.calories} kcal</span>
                    </div>
                  ))}
                  <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                    <span>P: {meal.totalProtein}g</span>
                    <span>G: {meal.totalCarbs}g</span>
                    <span>L: {meal.totalFat}g</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        <Separator />

        <div>
          <h2 className="font-semibold mb-3">Liste de courses</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {plan.shoppingList.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-primary">•</span>{item}
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground pt-4">
          Plan créé avec {brandName} · Powered by AI
        </p>
      </div>
    </div>
  )
}
