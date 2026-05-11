import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Users } from "lucide-react"

export const metadata = { title: "Clients" }

export default async function ClientsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const { data: clients } = await supabase
    .from("clients")
    .select("id, full_name, email, goal, tags, photo_url, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground text-sm mt-1">{clients?.length ?? 0} client(s) au total</p>
        </div>
        <Button className="gap-2" asChild>
          <Link href="/dashboard/clients/new"><Plus className="h-4 w-4" />Ajouter un client</Link>
        </Button>
      </div>

      {(!clients || clients.length === 0) ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <Users className="h-10 w-10 text-muted-foreground/30" />
            <div className="text-center">
              <p className="font-medium">Aucun client pour l&apos;instant</p>
              <p className="text-sm text-muted-foreground mt-1">Commence par ajouter ton premier client</p>
            </div>
            <Button className="gap-2" asChild>
              <Link href="/dashboard/clients/new"><Plus className="h-4 w-4" />Ajouter un client</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {clients.map((client) => (
            <Link key={client.id} href={`/dashboard/clients/${client.id}`}>
              <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar className="h-10 w-10 shrink-0">
                    {client.photo_url && <AvatarImage src={client.photo_url} />}
                    <AvatarFallback className="text-sm">
                      {client.full_name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{client.full_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {client.email && <p className="text-sm text-muted-foreground truncate">{client.email}</p>}
                      {client.goal && <p className="text-sm text-muted-foreground">· {client.goal}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {client.tags?.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
