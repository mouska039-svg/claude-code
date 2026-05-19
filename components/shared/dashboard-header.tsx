"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  ShoppingBag,
  Building2,
  Receipt,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { signOut } from "@/server/actions/auth";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface DashboardHeaderProps {
  user: {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
  };
}

const NAV_ITEMS = [
  { label: "Aperçu", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Clients", href: "/dashboard/clients", icon: Users },
  { label: "Cures & protocoles", href: "/dashboard/protocols", icon: FileText },
  { label: "Séances & audios", href: "/dashboard/sessions", icon: Calendar },
  { label: "Boutique", href: "/dashboard/shop", icon: ShoppingBag },
  { label: "Entreprises", href: "/dashboard/companies", icon: Building2 },
  { label: "Facturation", href: "/dashboard/billing", icon: Receipt },
  { label: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <header className="min-h-[56px] h-16 bg-background border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0">
      {/* Mobile: burger + logo */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          aria-label="Ouvrir le menu de navigation"
          aria-expanded={mobileNavOpen}
          className="p-1.5 rounded-lg text-mist hover:text-ink hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/dashboard" className="font-fraunces text-lg font-semibold text-ink">
          naya
          <span className="inline-block w-1 h-1 rounded-full bg-terracotta mb-1.5 ml-0.5" />
        </Link>
      </div>

      {/* Desktop: breadcrumb placeholder */}
      <div className="hidden lg:block" />

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu utilisateur"
          aria-expanded={menuOpen}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 cursor-pointer"
        >
          <div className="h-7 w-7 rounded-full bg-sage flex items-center justify-center text-xs font-semibold text-white shrink-0">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              getInitials(user.full_name || user.email)
            )}
          </div>
          <span className="hidden sm:block text-sm font-medium text-ink max-w-[120px] truncate">
            {user.full_name || user.email}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-mist" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-48 z-20 rounded-xl bg-popover border border-border shadow-lg py-1 text-sm">
              <div className="px-3 py-2 border-b border-border">
                <p className="font-medium text-ink truncate">{user.full_name}</p>
                <p className="text-xs text-mist truncate">{user.email}</p>
              </div>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2 px-3 py-2 text-ink hover:bg-accent transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Settings className="h-3.5 w-3.5 text-mist" />
                Paramètres
              </Link>
              <Link
                href="/dashboard/billing"
                className="flex items-center gap-2 px-3 py-2 text-ink hover:bg-accent transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Receipt className="h-3.5 w-3.5 text-mist" />
                Abonnement
              </Link>
              <div className="border-t border-border mt-1 pt-1">
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-3 py-2 min-h-[44px] text-destructive hover:bg-destructive/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Se déconnecter
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <>
          <div
            className="fixed inset-0 z-20 bg-ink/20 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-30 w-64 bg-sidebar border-r border-sidebar-border lg:hidden flex flex-col">
            <div className="flex items-center h-16 px-6 border-b border-sidebar-border">
              <Link
                href="/dashboard"
                className="font-fraunces text-xl font-semibold text-ink"
                onClick={() => setMobileNavOpen(false)}
              >
                naya
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta mb-2 ml-0.5" />
              </Link>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
