import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Megaphone, Clock } from "lucide-react"

export const metadata = { title: "Contenus" }

const TYPE_LABELS: Record<string, string> = {
  caption_ig: "Caption IG",
  hook_tiktok: "Hook TikTok",
  reel_idea: "Idée Reel",
  cta: "CTA",
  viral_hook: "Hook viral",
}

const TONE_LABELS: Record<string, string> = {
  motivating: "Motivant",
  professional: "Pro",
  aggressive: "Agressif",
  luxury: "Luxe",
}

export default async function ContentPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const { data: contents } = await supabase
    .from("social_contents")
    .select("id, type, tone, topic, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contenus social media</h1>
          <p className="text-muted-foreground text-sm mt-1">Tes contenus générés par l&apos;IA</p>
        </div>
        <Button className="gap-2" asChild>
          <Link href="/dashboard/content/new"><Plus className="h-4 w-4" />Nouveau contenu</Link>
        </Button>
      </div>

      {(!contents || contents.length === 0) ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <Megaphone className="h-10 w-10 text-muted-foreground/30" />
            <div className="text-center">
              <p className="font-medium">Aucun contenu pour l&apos;instant</p>
              <p className="text-sm text-muted-foreground mt-1">Génère tes premiers contenus en quelques secondes</p>
            </div>
            <Button className="gap-2" asChild>
              <Link href="/dashboard/content/new"><Plus className="h-4 w-4" />Créer du contenu</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {contents.map((content) => (
            <Link key={content.id} href={`/dashboard/content/${content.id}`}>
              <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {TYPE_LABELS[content.type] ?? content.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {TONE_LABELS[content.tone] ?? content.tone}
                      </Badge>
                      <p className="text-sm truncate">{content.topic}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Clock className="h-3 w-3" />
                      {new Date(content.created_at).toLocaleDateString("fr-FR")}
                    </div>
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
