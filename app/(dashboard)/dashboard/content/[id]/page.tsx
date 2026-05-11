import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { CopyVariantButton } from "./copy-variant-button"

const TYPE_LABELS: Record<string, string> = {
  caption_ig: "Caption Instagram", hook_tiktok: "Hook TikTok",
  reel_idea: "Idée de Reel", cta: "Call-to-Action", viral_hook: "Hook viral",
}
const TONE_LABELS: Record<string, string> = {
  motivating: "Motivant", professional: "Professionnel", aggressive: "Agressif", luxury: "Luxe",
}

export default async function ContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const { data: content } = await supabase
    .from("social_contents")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!content) notFound()

  const variants = content.variants as string[]

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/content"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{TYPE_LABELS[content.type] ?? content.type}</Badge>
          <Badge variant="outline">{TONE_LABELS[content.tone] ?? content.tone}</Badge>
        </div>
      </div>

      <div>
        <h1 className="text-xl font-bold">{content.topic}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date(content.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="space-y-4">
        {variants.map((variant, i) => (
          <Card key={i}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">Variante {i + 1}</CardTitle>
              <CopyVariantButton text={variant} />
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{variant}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
