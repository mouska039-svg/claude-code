"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { nutritionInputSchema, type NutritionInput, type NutritionPlanOutput } from "@/lib/ai/schemas/nutrition"
import { useGeneration } from "@/hooks/use-generation"
import { QuotaExceededModal } from "@/components/shared/quota-exceeded-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Salad } from "lucide-react"
import { cn } from "@/lib/utils"

export default function NewNutritionPage() {
  const router = useRouter()
  const { generate, loading, error, quotaExceeded, reset, data } = useGeneration<NutritionInput, NutritionPlanOutput>("/api/generate/nutrition")
  const [showTdee, setShowTdee] = useState(false)

  const { register, handleSubmit, setValue } = useForm<NutritionInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(nutritionInputSchema) as any,
    defaultValues: {
      goal: "maintenance",
      preference: "omnivore",
      mealsPerDay: 4,
    },
  })

  async function onSubmit(values: NutritionInput) {
    const result = await generate(values)
    if (result) {
      router.push(`/dashboard/nutrition/${result.id}`)
    }
  }

  return (
    <div className="max-w-4xl">
      <QuotaExceededModal open={quotaExceeded} onClose={reset} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Nouveau plan nutrition</h1>
        <p className="text-muted-foreground text-sm mt-1">Génère un plan nutritionnel personnalisé sur 7 jours</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Salad className="h-4 w-4" />
              Paramètres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Objectif</Label>
                <Select onValueChange={(v) => setValue("goal", v as NutritionInput["goal"])} defaultValue="maintenance">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight_loss">Perte de poids</SelectItem>
                    <SelectItem value="maintenance">Maintien</SelectItem>
                    <SelectItem value="muscle_gain">Prise de masse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Préférence alimentaire</Label>
                <Select onValueChange={(v) => setValue("preference", v as NutritionInput["preference"])} defaultValue="omnivore">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="omnivore">Omnivore</SelectItem>
                    <SelectItem value="vegetarian">Végétarien</SelectItem>
                    <SelectItem value="vegan">Végan</SelectItem>
                    <SelectItem value="halal">Halal</SelectItem>
                    <SelectItem value="kosher">Casher</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mealsPerDay">Repas / jour</Label>
                  <Select onValueChange={(v) => setValue("mealsPerDay", Number(v))} defaultValue="4">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[3, 4, 5, 6].map((n) => <SelectItem key={n} value={String(n)}>{n} repas</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetCalories">Calories cibles</Label>
                  <Input id="targetCalories" type="number" placeholder="2000" {...register("targetCalories")} />
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowTdee(!showTdee)}
                  className="text-sm text-primary hover:underline"
                >
                  {showTdee ? "− Masquer" : "+ Calculer le TDEE automatiquement"}
                </button>
                {showTdee && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Âge</Label>
                      <Input type="number" placeholder="30" {...register("age")} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Poids (kg)</Label>
                      <Input type="number" placeholder="75" step="0.1" {...register("weight")} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Taille (cm)</Label>
                      <Input type="number" placeholder="175" {...register("height")} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Sexe</Label>
                      <Select onValueChange={(v) => setValue("sex", v as "male" | "female")}>
                        <SelectTrigger><SelectValue placeholder="Sexe" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Homme</SelectItem>
                          <SelectItem value="female">Femme</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Niveau d&apos;activité</Label>
                      <Select onValueChange={(v) => setValue("activityLevel", v as NutritionInput["activityLevel"])}>
                        <SelectTrigger><SelectValue placeholder="Activité" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sédentaire</SelectItem>
                          <SelectItem value="light">Légèrement actif</SelectItem>
                          <SelectItem value="moderate">Modérément actif</SelectItem>
                          <SelectItem value="active">Actif</SelectItem>
                          <SelectItem value="very_active">Très actif</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies / intolérances (optionnel)</Label>
                <Input id="allergies" {...register("allergies")} placeholder="Gluten, lactose..." />
              </div>

              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Génération en cours...</>
                ) : "Générer le plan nutrition"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className={cn("transition-opacity", !data && !loading && "opacity-50")}>
          <CardHeader>
            <CardTitle className="text-base">Aperçu</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex flex-col items-center justify-center h-48 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">L&apos;IA génère ton plan...</p>
              </div>
            )}
            {!loading && !data && (
              <div className="flex flex-col items-center justify-center h-48 gap-2">
                <Salad className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground text-center">L&apos;aperçu apparaîtra ici</p>
              </div>
            )}
            {data && (
              <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
                <div>
                  <h3 className="font-semibold">{data.title}</h3>
                  <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
                    <span>{data.targetCalories} kcal</span>
                    <span>P: {data.targetProtein}g</span>
                    <span>G: {data.targetCarbs}g</span>
                    <span>L: {data.targetFat}g</span>
                  </div>
                </div>
                {data.days.slice(0, 2).map((day) => (
                  <div key={day.day} className="rounded-md border border-border/50 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{day.day}</span>
                      <Badge variant="secondary" className="text-xs">{day.dailyCalories} kcal</Badge>
                    </div>
                    {day.meals.slice(0, 2).map((meal) => (
                      <div key={meal.name} className="text-xs text-muted-foreground mb-1">
                        {meal.name} — {meal.totalCalories} kcal
                      </div>
                    ))}
                    {day.meals.length > 2 && (
                      <div className="text-xs text-primary">+{day.meals.length - 2} repas</div>
                    )}
                  </div>
                ))}
                {data.days.length > 2 && (
                  <p className="text-xs text-muted-foreground">+{data.days.length - 2} jours supplémentaires...</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
