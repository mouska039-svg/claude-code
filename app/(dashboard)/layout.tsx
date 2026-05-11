import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/shared/dashboard-sidebar"
import { DashboardHeader } from "@/components/shared/dashboard-header"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/sign-in")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single()

  const headerUser = {
    email: user.email ?? null,
    full_name: profile?.full_name ?? null,
    avatar_url: profile?.avatar_url ?? null,
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader user={headerUser} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
