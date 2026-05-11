"use client"

import { useActionState } from "react"
import { addNote } from "@/server/actions/clients"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Plus, FileText } from "lucide-react"
import type { ClientNote } from "@/types/database"

export function NotesTab({ clientId, notes }: { clientId: string; notes: ClientNote[] }) {
  const action = addNote.bind(null, clientId)
  const [state, formAction, isPending] = useActionState(action, null)

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4">
          <form action={formAction} className="space-y-3">
            {state && "error" in state && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
            <Textarea
              name="content"
              placeholder="Ajouter une note..."
              rows={3}
              className="resize-none"
              required
            />
            <Button type="submit" size="sm" className="gap-2" disabled={isPending}>
              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              Ajouter une note
            </Button>
          </form>
        </CardContent>
      </Card>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
          <FileText className="h-8 w-8 opacity-30" />
          <p className="text-sm">Aucune note pour l&apos;instant</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardContent className="p-4">
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(note.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
