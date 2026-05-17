"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Fonctionnalités", href: "#features" },
  { label: "Tarifs", href: "#pricing" },
  { label: "Témoignages", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <span className="font-fraunces text-2xl font-semibold text-ink">
              naya
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-terracotta mb-3 ml-0.5" />
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-mist hover:text-ink transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm text-ink hover:text-sage transition-colors px-3 py-2"
            >
              Se connecter
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage-600 transition-colors"
            >
              Commencer gratuitement
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 text-ink"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-border bg-background/98 backdrop-blur-md py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-sm text-mist hover:text-ink hover:bg-accent rounded-lg transition-colors"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="px-4 pt-3 space-y-2 border-t border-border mt-3">
              <Link
                href="/sign-in"
                className="block text-center py-2 text-sm text-ink border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Se connecter
              </Link>
              <Link
                href="/sign-up"
                className="block text-center py-2 text-sm font-medium text-white bg-sage rounded-lg hover:bg-sage-600 transition-colors"
              >
                Commencer gratuitement
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
