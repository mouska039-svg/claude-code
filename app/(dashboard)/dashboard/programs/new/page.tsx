"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { workoutInputSchema, type WorkoutInput, type WorkoutProgramOutput } from "@/lib/ai/schemas/workout"
import { useGeneration } from "@/hooks/use-generation"
import { QuotaExceededModal } from "@/components/shared/quota-exceeded-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Dumbbell } from "lucide-react"
import { cn } from "@/lib/utils"

const EQUIPMENT_OPTIONS = [
  "Poids du corps",
  "Haltères",
  "Barre + disques",
  "Machines",
  "Élastiques",
  "Kettlebells",
  "Câbles",
  "Barre de traction",
]

export default function NewProgramPage() {
  const router = useRouter()
  const { generate, loading, error, quotaExceeded, reset, data } = useGeneration<WorkoutInput, WorkoutProgramOutput>("/api/generate/workout")
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(["Poids du corps"])

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<WorkoutInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(workoutInputSchema) as any,
    defaultValues: {
      goal: "hypertrophy",
      level: "intermediate",
      frequency: 3,
      equipment: ["Poids du corps"],
      sessionDuration: 60,
    },
  })

  function toggleEquipment(item: string) {
    const next = selectedEquipment.includes(item)
      ? selectedEquipment.filter((e) => e !== item)
      : [...selectedEquipment, item]
    setSelectedEquipment(next)
    setValue("equipment", next)
  }

  async function onSubmit(values: WorkoutInput) {
    const result = await generate({ ...values, equipment: selectedEquipment })
    if (result) {
      router.push(`/dashboard/programs/${result.id}`)
    }
  }

  return (
    <div className="max-w-4xl">
      <QuotaExceededModal open={quotaExceeded} onClose={reset} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Nouveau programme</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Génère un programme d&apos;entraînement personnalisé avec l&apos;IA
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Paramètres du programme
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
                <Select onValueChange={(v) => setValue("goal", v as WorkoutInput["goal"])} defaultValue="hypertrophy">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength">Force</SelectItem>
                    <SelectItem value="hypertrophy">Hypertrophie (masse)</SelectItem>
                    <SelectItem value="weight_loss">Perte de poids</SelectItem>
                    <SelectItem value="endurance">Endurance</SelectItem>
                    <SelectItem value="general">Remise en forme générale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Niveau</Label>
                <Select onValueChange={(v) => setValue("level", v as WorkoutInput["level"])} defaultValue="intermediate">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Débutant</SelectItem>
                    <SelectItem value="intermediate">Intermédiaire</SelectItem>
                    <SelectItem value="advanced">Avancé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Séances / semaine</Label>
                  <Input
                    id="frequency"
                    type="number"
                    min={1}
                    max={7}
                    {...register("frequency")}
                  />
                  {errors.frequency && <p className="text-xs text-destructive">{errors.frequency.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionDuration">Durée (min)</Label>
                  <Input
                    id="sessionDuration"
                    type="number"
                    min={20}
                    max={120}
                    step={5}
                    {...register("sessionDuration")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Équipement disponible</Label>
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT_OPTIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleEquipment(item)}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full border transition-colors",
                        selectedEquipment.includes(item)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                {errors.equipment && <p className="text-xs text-destructive">Sélectionne au moins 1 équipement</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientName">Nom du client (optionnel)</Label>
                <Input id="clientName" {...register("clientName")} placeholder="Marie Dupont" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="injuries">Blessures / restrictions (optionnel)</Label>
                <Textarea
                  id="injuries"
                  {...register("injuries")}
                  placeholder="Douleur genou droit, éviter squats lourds..."
                  className="resize-none"
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full gap-2" disabled={loading || selectedEquipment.length === 0}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  "Générer le programme"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className={cn("transition-opacity", !data && !loading && "opacity-50")}>
          <CardHeader>
            <CardTitle className="text-base">Aperçu en direct</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex flex-col items-center justify-center h-48 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">L&apos;IA génère ton programme...</p>
              </div>
            )}
            {!loading && !data && (
              <div className="flex flex-col items-center justify-center h-48 gap-2">
                <Dumbbell className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground text-center">
                  L&apos;aperçu apparaîtra ici une fois le programme généré
                </p>
              </div>
            )}
            {data && (
              <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
                <div>
                  <h3 className="font-semibold">{data.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{data.durationWeeks} semaines</p>
                  <p className="text-sm mt-2">{data.overview}</p>
                </div>
                {data.weeks.slice(0, 1).map((week) => (
                  <div key={week.weekNumber}>
                    <h4 className="text-sm font-medium mb-2">Semaine {week.weekNumber}</h4>
                    {week.days.map((day) => (
                      <div key={day.name} className="rounded-md border border-border/50 p-3 mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{day.name}</span>
                          <Badge variant="secondary" className="text-xs">{day.focus}</Badge>
                        </div>
                        <div className="space-y-1">
                          {day.exercises.slice(0, 3).map((ex, i) => (
                            <div key={i} className="text-xs text-muted-foreground">
                              {ex.name} — {ex.sets}×{ex.reps}, {ex.rest}
                            </div>
                          ))}
                          {day.exercises.length > 3 && (
                            <div className="text-xs text-primary">+{day.exercises.length - 3} exercices</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                {data.weeks.length > 1 && (
                  <p className="text-xs text-muted-foreground">+{data.weeks.length - 1} semaines supplémentaires...</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
