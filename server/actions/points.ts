"use server";

import { createAdminClient } from "@/lib/supabase/server";

export type PointEventType = "checkin" | "audio_complete" | "streak_7d" | "cure_complete";

const POINT_VALUES: Record<PointEventType, number> = {
  checkin: 5,
  audio_complete: 10,
  streak_7d: 20,
  cure_complete: 50,
};

function computeLevel(total: number): "graine" | "pousse" | "fleur" | "arbre" {
  if (total >= 500) return "arbre";
  if (total >= 200) return "fleur";
  if (total >= 50) return "pousse";
  return "graine";
}

export async function addPoints(
  clientId: string,
  eventType: PointEventType
): Promise<{ total: number; level: string; gained: number }> {
  const gained = POINT_VALUES[eventType];
  const supabase = createAdminClient();

  // Get or create the client_points row
  const { data: existing } = await supabase
    .from("client_points")
    .select("total_points")
    .eq("client_id", clientId)
    .maybeSingle();

  const newTotal = (existing?.total_points ?? 0) + gained;
  const newLevel = computeLevel(newTotal);

  await supabase
    .from("client_points")
    .upsert(
      {
        client_id: clientId,
        total_points: newTotal,
        level: newLevel,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "client_id" }
    );

  await supabase.from("client_point_events").insert({
    client_id: clientId,
    event_type: eventType,
    points: gained,
  });

  return { total: newTotal, level: newLevel, gained };
}

export async function getClientPoints(
  clientId: string
): Promise<{ total: number; level: "graine" | "pousse" | "fleur" | "arbre" }> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("client_points")
    .select("total_points, level")
    .eq("client_id", clientId)
    .maybeSingle();

  return {
    total: data?.total_points ?? 0,
    level: (data?.level ?? "graine") as "graine" | "pousse" | "fleur" | "arbre",
  };
}
