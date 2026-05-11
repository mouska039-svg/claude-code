"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { deleteAccount, exportUserData } from "@/server/actions/settings"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function DangerZone({ email }: { email: string }) {
  const [confirmEmail, setConfirmEmail] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleExport() {
    setIsExporting(true)
    const result = await exportUserData()
    setIsExporting(false)
    if ("error" in result) {
      toast({ title: "Erreur", description: result.error, variant: "destructive" })
      return
    }
    const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `fitcoach-data-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleDelete() {
    if (confirmEmail !== email) return
    setIsDeleting(true)
    const result = await deleteAccount()
    if ("error" in result) {
      toast({ title: "Erreur", description: result.error, variant: "destructive" })
      setIsDeleting(false)
      return
    }
    router.push("/")
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exporter mes données</CardTitle>
          <CardDescription>Télécharge toutes tes données au format JSON (RGPD)</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleExport} disabled={isExporting}>
            {isExporting ? "Export en cours..." : "Exporter mes données"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Supprimer le compte</CardTitle>
          <CardDescription>
            Cette action est irréversible. Toutes tes données seront supprimées et ton abonnement
            Stripe annulé.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Supprimer mon compte
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogDescription>
                  Cette action est irréversible. Écris ton email pour confirmer.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Label htmlFor="confirm-email">Tape {email} pour confirmer</Label>
                <Input
                  id="confirm-email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder={email}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={confirmEmail !== email || isDeleting}
                >
                  {isDeleting ? "Suppression..." : "Supprimer définitivement"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
