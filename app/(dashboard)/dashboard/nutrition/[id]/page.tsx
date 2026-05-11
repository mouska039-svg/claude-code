import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download } from "lucide-react"
import type { NutritionPlanOutput } from "@/lib/ai/schemas/nutrition"
import { ShareButton } from "@/components/shared/share-button"

export default async function NutritionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const { data: plan } = await supabase
    .from("nutrition_plans")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!plan) notFound()

  const output = plan.output as NutritionPlanOutput

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/nutrition"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">{output.title}</h1>
            <p className="text-sm text-muted-foreground">{output.targetCalories} kcal/jour · 7 jours</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ShareButton resourceType="nutrition" resourceId={id} />
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <a href={`/api/pdf/nutrition/${id}`} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />PDF
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Calories", value: `${output.targetCalories} kcal` },
          { label: "Protéines", value: `${output.targetProtein}g` },
          { label: "Glucides", value: `${output.targetCarbs}g` },
          { label: "Lipides", value: `${output.targetFat}g` },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-xl font-bold mt-1">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {output.tips.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Conseils</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {output.tips.map((tip, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-primary shrink-0">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {output.days.map((day) => (
        <Card key={day.day}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{day.day}</CardTitle>
              <Badge variant="secondary">{day.dailyCalories} kcal</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {day.meals.map((meal) => (
              <div key={meal.name} className="rounded-md bg-muted/40 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{meal.name}</span>
                  <span className="text-xs text-muted-foreground">{meal.time} · {meal.totalCalories} kcal</span>
                </div>
                <div className="space-y-1">
                  {meal.foods.map((food, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{food.food} ({food.quantity})</span>
                      <span>{food.calories} kcal</span>
                    </div>
                  ))}
                </div>
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

      <Card>
        <CardHeader><CardTitle className="text-sm">Liste de courses</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {output.shoppingList.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-primary">•</span>
                {item}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
