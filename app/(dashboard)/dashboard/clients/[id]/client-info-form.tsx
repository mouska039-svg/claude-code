"use client"

import { useActionState } from "react"
import { updateClientAction } from "@/server/actions/clients"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Save } from "lucide-react"

interface Client {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  goal: string | null
  notes: string | null
  tags: string[] | null
}

export function ClientInfoForm({ client }: { client: Client }) {
  const action = updateClientAction.bind(null, client.id)
  const [state, formAction, isPending] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-4">
      {state && "error" in state && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
          <p className="text-sm text-destructive">{state.error}</p>
        </div>
      )}
      {state && "success" in state && (
        <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3">
          <p className="text-sm text-green-600 dark:text-green-400">{state.success}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nom complet *</Label>
          <Input id="full_name" name="full_name" defaultValue={client.full_name} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={client.email ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" name="phone" defaultValue={client.phone ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="goal">Objectif</Label>
          <Input id="goal" name="goal" defaultValue={client.goal ?? ""} placeholder="Ex: Prise de masse" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
        <Input id="tags" name="tags" defaultValue={client.tags?.join(", ") ?? ""} placeholder="Ex: débutant, cardio, végétarien" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes internes</Label>
        <Textarea id="notes" name="notes" defaultValue={client.notes ?? ""} rows={4} placeholder="Notes privées sur ce client..." className="resize-none" />
      </div>

      <Button type="submit" className="gap-2" disabled={isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Enregistrer
      </Button>
    </form>
  )
}
