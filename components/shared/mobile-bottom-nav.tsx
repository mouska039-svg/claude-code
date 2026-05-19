"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Receipt,
  CreditCard,
  MoreHorizontal,
  FileText,
  ShoppingBag,
  Building2,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PRIMARY_NAV = [
  { label: "Aperçu", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Clients", href: "/dashboard/clients", icon: Users },
  { label: "Séances", href: "/dashboard/sessions", icon: Calendar },
  { label: "Factures", href: "/dashboard/invoices", icon: Receipt },
];

const SECONDARY_NAV = [
  { label: "Cures & protocoles", href: "/dashboard/protocols", icon: FileText },
  { label: "Boutique", href: "/dashboard/shop", icon: ShoppingBag },
  { label: "Entreprises", href: "/dashboard/companies", icon: Building2 },
  { label: "Abonnement", href: "/dashboard/billing", icon: CreditCard },
  { label: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const isSecondaryActive = SECONDARY_NAV.some((item) => isActive(item.href));

  return (
    <>
      <nav
        aria-label="Navigation mobile"
        className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden bg-card border-t border-border"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {PRIMARY_NAV.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 min-h-[56px] cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sage/50",
                "transition-colors",
                active ? "text-sage" : "text-brume hover:text-ink"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className={cn("text-xs", active ? "font-semibold" : "font-normal")}>
                {item.label}
              </span>
            </Link>
          );
        })}

        <button
          onClick={() => setSheetOpen(true)}
          aria-label="Plus de navigation"
          aria-expanded={sheetOpen}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-0.5 min-h-[56px] cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sage/50",
            "transition-colors",
            isSecondaryActive ? "text-sage" : "text-brume hover:text-ink"
          )}
        >
          <MoreHorizontal className="h-5 w-5 shrink-0" />
          <span
            className={cn("text-xs", isSecondaryActive ? "font-semibold" : "font-normal")}
          >
            Plus
          </span>
        </button>
      </nav>

      {sheetOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm lg:hidden"
            onClick={() => setSheetOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card border-t border-border rounded-t-2xl shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="text-sm font-semibold text-ink">Navigation</span>
              <button
                onClick={() => setSheetOpen(false)}
                aria-label="Fermer le menu"
                className="p-1.5 rounded-lg text-brume hover:text-ink hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav
              aria-label="Navigation secondaire"
              className="py-2"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)" }}
            >
              {SECONDARY_NAV.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setSheetOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-5 py-3.5 min-h-[44px] text-sm transition-colors cursor-pointer",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sage/50",
                      active
                        ? "bg-sage/10 text-sage font-semibold"
                        : "text-ink hover:bg-accent"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
