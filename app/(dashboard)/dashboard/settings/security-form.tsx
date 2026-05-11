"use client"

import { useActionState } from "react"
import { updatePassword } from "@/server/actions/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function SecurityForm() {
  const [state, action, isPending] = useActionState(updatePassword, null)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Changer le mot de passe</CardTitle>
        <CardDescription>Choisis un mot de passe d&apos;au moins 8 caractères</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          {state && "error" in state && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          {state && "success" in state && (
            <p className="text-sm text-primary">{state.success}</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Nouveau mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Modification..." : "Modifier le mot de passe"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
