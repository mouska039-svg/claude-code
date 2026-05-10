"use client"

import { useActionState } from "react"
import Link from "next/link"
import { signUp } from "@/server/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUpPage() {
  const [state, action, isPending] = useActionState(signUp, null)

  return (
    <Card className="border-border/50">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Crée ton compte</CardTitle>
        <CardDescription className="text-center">
          Commence à coacher avec l&apos;IA dès aujourd&apos;hui
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          {state && "error" in state && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
              <p className="text-sm text-destructive">{state.error}</p>
            </div>
          )}

          {state && "success" in state && (
            <div className="rounded-md bg-primary/10 border border-primary/20 p-3">
              <p className="text-sm text-primary">{state.success}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName">Nom complet</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Jean Dupont"
              required
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="coach@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Création..." : "Créer mon compte"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            En créant un compte, tu acceptes nos{" "}
            <Link href="/legal/terms" className="text-primary hover:underline">
              conditions d&apos;utilisation
            </Link>
          </p>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link href="/sign-in" className="text-primary hover:underline font-medium">
            Se connecter
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
