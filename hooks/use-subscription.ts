"use client";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { Database } from "@/types/supabase";

type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setLoading(false);
        return;
      }
      supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          setSubscription(data as SubscriptionRow | null);
          setLoading(false);
        });
    });
  }, []);

  return { subscription, loading };
}
