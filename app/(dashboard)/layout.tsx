import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/sign-in")

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard layout shell — Phase 2 will add sidebar + header */}
      <div className="flex min-h-screen">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
