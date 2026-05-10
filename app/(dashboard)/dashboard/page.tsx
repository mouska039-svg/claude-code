import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/sign-in")

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground mt-2">Bienvenue, {user.email}</p>
      <p className="text-sm text-muted-foreground mt-4">
        Phase 2 en cours de développement — Le dashboard complet sera disponible prochainement.
      </p>
    </div>
  )
}
