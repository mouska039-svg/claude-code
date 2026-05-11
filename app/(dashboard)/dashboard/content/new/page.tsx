"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { contentInputSchema, type ContentInput, type ContentOutput } from "@/lib/ai/schemas/content"
import { useGeneration } from "@/hooks/use-generation"
import { QuotaExceededModal } from "@/components/shared/quota-exceeded-modal"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Megaphone, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

function VariantCard({ text, index }: { text: string; index: number }) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ title: "Copié !" })
  }

  return (
    <div className="rounded-md border border-border/50 bg-muted/20 p-4 relative group">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={copy}>
          {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <span className="text-xs text-muted-foreground font-medium mb-2 block">Variante {index + 1}</span>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
    </div>
  )
}

export default function NewContentPage() {
  const router = useRouter()
  const { generate, loading, error, quotaExceeded, reset, data } = useGeneration<ContentInput, ContentOutput>("/api/generate/content")

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ContentInput>({
    resolver: zodResolver(contentInputSchema),
    defaultValues: {
      type: "caption_ig",
      tone: "motivating",
      length: "medium",
    },
  })

  async function onSubmit(values: ContentInput) {
    const result = await generate(values)
    if (result) {
      router.push(`/dashboard/content/${result.id}`)
    }
  }

  return (
    <div className="max-w-4xl">
      <QuotaExceededModal open={quotaExceeded} onClose={reset} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Nouveau contenu</h1>
        <p className="text-muted-foreground text-sm mt-1">Génère 5 variantes de contenu social media</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
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
                <Label>Type de contenu</Label>
                <Select onValueChange={(v) => setValue("type", v as ContentInput["type"])} defaultValue="caption_ig">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="caption_ig">Caption Instagram</SelectItem>
                    <SelectItem value="hook_tiktok">Hook TikTok</SelectItem>
                    <SelectItem value="reel_idea">Idée de Reel</SelectItem>
                    <SelectItem value="cta">Call-to-Action</SelectItem>
                    <SelectItem value="viral_hook">Hook viral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ton</Label>
                <Select onValueChange={(v) => setValue("tone", v as ContentInput["tone"])} defaultValue="motivating">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="motivating">Motivant</SelectItem>
                    <SelectItem value="professional">Professionnel</SelectItem>
                    <SelectItem value="aggressive">Agressif (sans filtre)</SelectItem>
                    <SelectItem value="luxury">Luxe / Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Longueur</Label>
                <Select onValueChange={(v) => setValue("length", v as ContentInput["length"])} defaultValue="medium">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Court (1-3 phrases)</SelectItem>
                    <SelectItem value="medium">Moyen (4-8 phrases)</SelectItem>
                    <SelectItem value="long">Long (storytelling)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Sujet</Label>
                <Textarea
                  id="topic"
                  {...register("topic")}
                  placeholder="Ex: Les 3 erreurs qui empêchent ta progression en musculation..."
                  className="resize-none"
                  rows={4}
                />
                {errors.topic && <p className="text-xs text-destructive">{errors.topic.message}</p>}
              </div>

              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Génération...</> : "Générer 5 variantes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className={cn("transition-opacity", !data && !loading && "opacity-50")}>
          <CardHeader>
            <CardTitle className="text-base">5 variantes générées</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex flex-col items-center justify-center h-48 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">L&apos;IA crée tes variantes...</p>
              </div>
            )}
            {!loading && !data && (
              <div className="flex flex-col items-center justify-center h-48 gap-2">
                <Megaphone className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground text-center">Tes 5 variantes apparaîtront ici</p>
              </div>
            )}
            {data && (
              <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
                {data.variants.map((v, i) => <VariantCard key={i} text={v} index={i} />)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
