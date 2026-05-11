"use client"

import { useActionState } from "react"
import { updateProfile } from "@/server/actions/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  profile: { full_name: string; locale: "fr" | "en"; avatar_url: string | null }
  email: string
}

export function ProfileForm({ profile, email }: Props) {
  const [state, action, isPending] = useActionState(updateProfile, null)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Informations personnelles</CardTitle>
        <CardDescription>Nom et préférences de langue</CardDescription>
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
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled className="opacity-60" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Nom complet</Label>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={profile.full_name}
              placeholder="Jean Dupont"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="locale">Langue</Label>
            <Select name="locale" defaultValue={profile.locale}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
