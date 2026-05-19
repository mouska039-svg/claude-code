"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  ShoppingBag,
  Building2,
  Receipt,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Aperçu", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Clients", href: "/dashboard/clients", icon: Users },
  { label: "Cures & protocoles", href: "/dashboard/protocols", icon: FileText },
  { label: "Séances", href: "/dashboard/sessions", icon: Calendar },
  { label: "Boutique", href: "/dashboard/shop", icon: ShoppingBag },
  { label: "Entreprises", href: "/dashboard/companies", icon: Building2 },
  { label: "Facturation", href: "/dashboard/billing", icon: Receipt },
  { label: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-sidebar-border">
        <Link href="/dashboard">
          <img src="/logo-naya.svg" alt="Naya" className="h-7 w-auto" />
        </Link>
      </div>

      {/* Nav */}
      <nav
        aria-label="Navigation principale"
        className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50",
                isActive
                  ? "bg-sage/15 text-sage font-semibold before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-0.5 before:bg-sage before:rounded-r"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-mist text-center">Données hébergées en Europe</p>
      </div>
    </aside>
  );
}
