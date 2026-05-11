import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Dumbbell, Clock } from "lucide-react"

export const metadata = { title: "Programmes" }

export default async function ProgramsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const { data: programs } = await supabase
    .from("workout_programs")
    .select("id, title, created_at, output")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Programmes</h1>
          <p className="text-muted-foreground text-sm mt-1">Tes programmes d&apos;entraînement générés par l&apos;IA</p>
        </div>
        <Button className="gap-2" asChild>
          <Link href="/dashboard/programs/new">
            <Plus className="h-4 w-4" />
            Nouveau programme
          </Link>
        </Button>
      </div>

      {(!programs || programs.length === 0) ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <Dumbbell className="h-10 w-10 text-muted-foreground/30" />
            <div className="text-center">
              <p className="font-medium">Aucun programme pour l&apos;instant</p>
              <p className="text-sm text-muted-foreground mt-1">Génère ton premier programme en quelques secondes</p>
            </div>
            <Button className="gap-2" asChild>
              <Link href="/dashboard/programs/new">
                <Plus className="h-4 w-4" />
                Créer un programme
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {programs.map((program) => {
            const output = program.output as { durationWeeks?: number; overview?: string } | null
            return (
              <Link key={program.id} href={`/dashboard/programs/${program.id}`}>
                <Card className="hover:border-primary/30 transition-colors cursor-pointer h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold line-clamp-2">{program.title}</h3>
                      {output?.durationWeeks && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {output.durationWeeks} sem.
                        </Badge>
                      )}
                    </div>
                    {output?.overview && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{output.overview}</p>
                    )}
                    <div className="flex items-center gap-1 mt-4 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(program.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
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
