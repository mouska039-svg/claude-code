"use client"

import { useActionState } from "react"
import { updateBranding } from "@/server/actions/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  branding: { brand_name: string; brand_color: string; slogan: string }
}

export function BrandingForm({ branding }: Props) {
  const [state, action, isPending] = useActionState(updateBranding, null)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Branding coach</CardTitle>
        <CardDescription>Utilisé sur les PDFs et les liens partagés avec tes clients</CardDescription>
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
            <Label htmlFor="brand_name">Nom de la marque / coach</Label>
            <Input
              id="brand_name"
              name="brand_name"
              defaultValue={branding.brand_name}
              placeholder="Jean Dupont Coaching"
              maxLength={60}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slogan">Slogan</Label>
            <Input
              id="slogan"
              name="slogan"
              defaultValue={branding.slogan}
              placeholder="Transforme ton corps, transforme ta vie"
              maxLength={120}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand_color">Couleur principale</Label>
            <div className="flex items-center gap-3">
              <Input
                id="brand_color"
                name="brand_color"
                type="color"
                defaultValue={branding.brand_color}
                className="h-10 w-20 cursor-pointer p-1"
              />
              <span className="text-sm text-muted-foreground">Couleur utilisée sur tes PDFs</span>
            </div>
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
