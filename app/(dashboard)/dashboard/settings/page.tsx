import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "./profile-form"
import { BrandingForm } from "./branding-form"
import { SecurityForm } from "./security-form"
import { DangerZone } from "./danger-zone"

export const metadata = { title: "Paramètres" }

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/sign-in")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground text-sm mt-1">Gère ton profil et tes préférences</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="danger">Compte</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileForm
            profile={{
              full_name: profile?.full_name ?? "",
              locale: (profile?.locale as "fr" | "en") ?? "fr",
              avatar_url: profile?.avatar_url ?? null,
            }}
            email={user.email ?? ""}
          />
        </TabsContent>

        <TabsContent value="branding" className="mt-6">
          <BrandingForm
            branding={{
              brand_name: profile?.brand_name ?? "",
              brand_color: profile?.brand_color ?? "#3b82f6",
              slogan: profile?.slogan ?? "",
            }}
          />
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <SecurityForm />
        </TabsContent>

        <TabsContent value="danger" className="mt-6">
          <DangerZone email={user.email ?? ""} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
