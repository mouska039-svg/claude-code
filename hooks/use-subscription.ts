"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Subscription } from "@/types/database"

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single()
      setSubscription(data)
      setLoading(false)
    }

    load()
  }, [])

  const isPro = subscription?.plan === "pro" || subscription?.plan === "premium"
  const isPremium = subscription?.plan === "premium"
  const plan = subscription?.plan ?? "free"

  return { subscription, loading, isPro, isPremium, plan }
}
