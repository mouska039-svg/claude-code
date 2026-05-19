import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/shared/dashboard-sidebar";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav";
import type { Database } from "@/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  const profile = data as ProfileRow | null;

  return (
    <div className="flex min-h-dvh bg-background">
      <DashboardSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardHeader
          user={{
            id: user.id,
            email: user.email ?? "",
            full_name: profile?.full_name ?? "",
            avatar_url: profile?.avatar_url ?? null,
          }}
        />
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">{children}</div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
