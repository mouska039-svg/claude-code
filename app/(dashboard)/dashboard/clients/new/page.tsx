"use client"

import { useActionState } from "react"
import Link from "next/link"
import { createClientAction } from "@/server/actions/clients"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function NewClientPage() {
  const [state, action, isPending] = useActionState(createClientAction, null)

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/clients"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Nouveau client</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations du client</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            {state && "error" in state && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <div className="space-y-2">
              <Label htmlFor="full_name">Nom complet *</Label>
              <Input id="full_name" name="full_name" placeholder="Marie Dupont" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="marie@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" name="phone" placeholder="+33 6 12 34 56 78" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Objectif</Label>
              <Input id="goal" name="goal" placeholder="Perte de poids, prise de masse..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes initiales</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Informations importantes, historique sportif..."
                className="resize-none"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
              <Input id="tags" name="tags" placeholder="débutant, prise de masse, présentiel" />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Création..." : "Créer le client"}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/clients">Annuler</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
