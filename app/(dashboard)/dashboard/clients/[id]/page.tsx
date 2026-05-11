import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Dumbbell, Salad } from "lucide-react"
import { ClientInfoForm } from "./client-info-form"
import { MeasurementsTab } from "./measurements-tab"
import { NotesTab } from "./notes-tab"
import type { ClientMeasurement, ClientNote } from "@/types/database"

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const [
    { data: client },
    { data: assignments },
    { data: measurements },
    { data: notes },
  ] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).eq("user_id", user.id).single(),
    supabase
      .from("client_assignments")
      .select("*, workout_programs(id, title), nutrition_plans(id, title)")
      .eq("client_id", id),
    supabase
      .from("client_measurements")
      .select("*")
      .eq("client_id", id)
      .order("date", { ascending: false }),
    supabase
      .from("client_notes")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
  ])

  if (!client) notFound()

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/clients"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <Avatar className="h-10 w-10">
            {client.photo_url && <AvatarImage src={client.photo_url} />}
            <AvatarFallback>{client.full_name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold">{client.full_name}</h1>
            <p className="text-sm text-muted-foreground">{client.email ?? client.goal ?? "Client"}</p>
          </div>
        </div>
        <div className="flex gap-1 flex-wrap">
          {client.tags?.map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList className="grid w-full grid-cols-4 sm:grid-cols-5">
          <TabsTrigger value="info">Infos</TabsTrigger>
          <TabsTrigger value="programs">Programmes</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="measurements">Suivi</TabsTrigger>
          <TabsTrigger value="files" className="hidden sm:inline-flex">Fichiers</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <ClientInfoForm client={client} />
        </TabsContent>

        <TabsContent value="programs" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Dumbbell className="h-4 w-4" />
                Programmes assignés
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignments && assignments.filter(a => a.program_id).length > 0 ? (
                <div className="space-y-2">
                  {assignments.filter(a => a.program_id).map((a) => {
                    const prog = a.workout_programs as { id: string; title: string } | null
                    return prog ? (
                      <Link key={a.id} href={`/dashboard/programs/${prog.id}`}>
                        <div className="flex items-center justify-between p-3 rounded-md border hover:border-primary/30 transition-colors">
                          <span className="text-sm font-medium">{prog.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {new Date(a.assigned_at).toLocaleDateString("fr-FR")}
                          </Badge>
                        </div>
                      </Link>
                    ) : null
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucun programme assigné</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Salad className="h-4 w-4" />
                Plans nutrition assignés
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignments && assignments.filter(a => a.nutrition_id).length > 0 ? (
                <div className="space-y-2">
                  {assignments.filter(a => a.nutrition_id).map((a) => {
                    const plan = a.nutrition_plans as { id: string; title: string } | null
                    return plan ? (
                      <Link key={a.id} href={`/dashboard/nutrition/${plan.id}`}>
                        <div className="flex items-center justify-between p-3 rounded-md border hover:border-primary/30 transition-colors">
                          <span className="text-sm font-medium">{plan.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {new Date(a.assigned_at).toLocaleDateString("fr-FR")}
                          </Badge>
                        </div>
                      </Link>
                    ) : null
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucun plan assigné</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <NotesTab clientId={id} notes={(notes ?? []) as ClientNote[]} />
        </TabsContent>

        <TabsContent value="measurements" className="mt-4">
          <MeasurementsTab clientId={id} measurements={(measurements ?? []) as ClientMeasurement[]} />
        </TabsContent>

        <TabsContent value="files" className="mt-4">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm text-muted-foreground">Upload de fichiers — disponible prochainement</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
