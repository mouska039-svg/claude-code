import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download } from "lucide-react"
import type { WorkoutProgramOutput } from "@/lib/ai/schemas/workout"
import { ShareButton } from "@/components/shared/share-button"

export default async function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const { data: program } = await supabase
    .from("workout_programs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!program) notFound()

  const output = program.output as WorkoutProgramOutput

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/programs">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">{output.title}</h1>
            <p className="text-sm text-muted-foreground">{output.durationWeeks} semaines</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ShareButton resourceType="program" resourceId={id} />
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <a href={`/api/pdf/program/${id}`} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
              PDF
            </a>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground leading-relaxed">{output.overview}</p>
          {output.progressionNotes && (
            <>
              <Separator className="my-4" />
              <p className="text-sm font-medium mb-1">Progression</p>
              <p className="text-sm text-muted-foreground">{output.progressionNotes}</p>
            </>
          )}
        </CardContent>
      </Card>

      {output.weeks.map((week) => (
        <div key={week.weekNumber}>
          <h2 className="text-lg font-semibold mb-3">Semaine {week.weekNumber}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {week.days.map((day) => (
              <Card key={day.name}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{day.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs">{day.focus}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {day.exercises.map((ex, i) => (
                      <div key={i} className="rounded-md bg-muted/40 p-3">
                        <div className="flex items-start justify-between">
                          <span className="text-sm font-medium">{ex.name}</span>
                          <span className="text-xs text-muted-foreground shrink-0 ml-2">
                            {ex.sets}×{ex.reps}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground">Repos : {ex.rest}</span>
                          {ex.tempo && <span className="text-xs text-muted-foreground">Tempo : {ex.tempo}</span>}
                        </div>
                        {ex.notes && (
                          <p className="text-xs text-muted-foreground/80 mt-1 italic">{ex.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
