"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const STORAGE_KEY = "cookie-consent"

function hasConsent(): boolean {
  if (typeof window === "undefined") return true
  return !!localStorage.getItem(STORAGE_KEY)
}

export function CookieBanner() {
  const [dismissed, setDismissed] = useState(hasConsent)

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted")
    setDismissed(true)
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined")
    setDismissed(true)
  }

  if (dismissed) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card border-t border-border shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-muted-foreground flex-1">
          Nous utilisons des cookies d&apos;analyse (PostHog) pour améliorer l&apos;application. Aucune donnée personnelle n&apos;est vendue.{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">
            Politique de confidentialité
          </Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={decline}>
            Refuser
          </Button>
          <Button size="sm" onClick={accept}>
            Accepter
          </Button>
        </div>
      </div>
    </div>
  )
}
