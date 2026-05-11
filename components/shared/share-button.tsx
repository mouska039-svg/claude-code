"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Share2, Copy, Check, Loader2, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { ResourceType } from "@/types/database"

interface Props {
  resourceType: ResourceType
  resourceId: string
}

export function ShareButton({ resourceType, resourceId }: Props) {
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  async function generateLink() {
    setLoading(true)
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceType, resourceId }),
      })
      if (!res.ok) throw new Error("Erreur")
      const { token } = await res.json()
      const url = `${window.location.origin}/share/${token}`
      setShareUrl(url)
    } catch {
      toast({ title: "Erreur", description: "Impossible de créer le lien", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function copyLink() {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ title: "Copié !", description: "Lien copié dans le presse-papier" })
  }

  async function revokeLink() {
    if (!shareUrl) return
    const token = shareUrl.split("/").pop()
    try {
      await fetch(`/api/share/${token}`, { method: "DELETE" })
      setShareUrl(null)
      toast({ title: "Lien révoqué", description: "Le lien n'est plus accessible" })
    } catch {
      toast({ title: "Erreur", description: "Impossible de révoquer le lien", variant: "destructive" })
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Partager
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Partager avec un client</DialogTitle>
          <DialogDescription>
            Génère un lien sécurisé valable 30 jours. Ton client peut y accéder sans compte.
          </DialogDescription>
        </DialogHeader>

        {!shareUrl ? (
          <Button onClick={generateLink} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
            Générer un lien de partage
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="text-sm" />
              <Button size="icon" variant="outline" onClick={copyLink}>
                {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">Lien valide 30 jours</p>
              <Button size="sm" variant="ghost" className="gap-1 text-destructive text-xs" onClick={revokeLink}>
                <Trash2 className="h-3 w-3" />
                Révoquer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
