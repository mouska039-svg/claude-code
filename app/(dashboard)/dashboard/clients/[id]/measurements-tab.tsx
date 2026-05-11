"use client"

import { useActionState } from "react"
import { addMeasurement } from "@/server/actions/clients"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, Plus, Scale } from "lucide-react"
import dynamic from "next/dynamic"
import type { ClientMeasurement } from "@/types/database"

const WeightChart = dynamic(
  () =>
    import("recharts").then((m) => {
      const { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } = m
      function Chart({ data }: { data: { date: string; weight: number }[] }) {
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit=" kg" domain={["auto", "auto"]} />
              <Tooltip formatter={(v) => [`${v} kg`, "Poids"]} />
              <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )
      }
      return Chart
    }),
  { ssr: false, loading: () => <Skeleton className="h-[200px] w-full" /> }
)

export function MeasurementsTab({ clientId, measurements }: { clientId: string; measurements: ClientMeasurement[] }) {
  const action = addMeasurement.bind(null, clientId)
  const [state, formAction, isPending] = useActionState(action, null)

  const today = new Date().toISOString().split("T")[0]
  const weightData = measurements
    .filter((m) => m.weight != null)
    .map((m) => ({
      date: new Date(m.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      weight: m.weight as number,
    }))
    .reverse()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Ajouter une mesure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-3">
            {state && "error" in state && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" defaultValue={today} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="weight">Poids (kg)</Label>
                <Input id="weight" name="weight" type="number" step="0.1" min="0" placeholder="75.5" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="body_fat">% Masse grasse</Label>
                <Input id="body_fat" name="body_fat" type="number" step="0.1" min="0" max="100" placeholder="18.0" />
              </div>
            </div>
            <Button type="submit" size="sm" className="gap-2" disabled={isPending}>
              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              Enregistrer
            </Button>
          </form>
        </CardContent>
      </Card>

      {weightData.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Évolution du poids
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WeightChart data={weightData} />
          </CardContent>
        </Card>
      )}

      {measurements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
          <Scale className="h-8 w-8 opacity-30" />
          <p className="text-sm">Aucune mesure enregistrée</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {measurements.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-medium">
                    {new Date(m.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {m.weight != null && <span>{m.weight} kg</span>}
                    {m.body_fat != null && <span>{m.body_fat}% MG</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
