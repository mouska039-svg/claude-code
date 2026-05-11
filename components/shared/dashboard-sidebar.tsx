"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Dumbbell, LayoutDashboard, Dumbbell as ProgramIcon, Salad, Megaphone, Users, CreditCard, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/programs", label: "Programmes", icon: ProgramIcon },
  { href: "/dashboard/nutrition", label: "Nutrition", icon: Salad },
  { href: "/dashboard/content", label: "Contenus", icon: Megaphone },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/billing", label: "Facturation", icon: CreditCard },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen border-r border-border/50 bg-card">
      <div className="flex h-14 items-center px-4 border-b border-border/50">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <Dumbbell className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm">FitCoach AI</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export { navItems }
