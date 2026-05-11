"use client"

import Link from "next/link"
import { Menu, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { signOut } from "@/server/actions/auth"
import { navItems } from "@/components/shared/dashboard-sidebar"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  user: { email: string | null; full_name: string | null; avatar_url: string | null }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname()
  const initials = (user.full_name ?? user.email ?? "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-md px-4 sm:px-6">
      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-60 p-0">
          <SheetHeader className="px-4 py-4 border-b border-border/50">
            <SheetTitle className="text-left text-sm">FitCoach AI</SheetTitle>
          </SheetHeader>
          <nav className="px-3 py-4 space-y-1">
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
        </SheetContent>
      </Sheet>

      <div className="flex-1" />

      <Button variant="ghost" size="icon">
        <Bell className="h-5 w-5" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.full_name ?? ""} />}
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user.full_name ?? "Coach"}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">Paramètres</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/billing">Facturation</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <form action={signOut}>
              <button type="submit" className="w-full text-left text-destructive">
                Se déconnecter
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
