import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addPoints } from "@/server/actions/points";

const schema = z.object({
  clientId: z.string().uuid(),
  mood: z.number().int().min(1).max(5).optional(),
  note: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { clientId, mood, note } = parsed.data;

  // Save check-in to client_check_ins table
  const { createAdminClient } = await import("@/lib/supabase/server");
  const supabase = createAdminClient();

  await supabase.from("client_check_ins").insert({
    client_id: clientId,
    date: new Date().toISOString().slice(0, 10),
    mood: mood ?? null,
    notes: note ?? null,
  });

  // Award points
  const result = await addPoints(clientId, "checkin");

  return NextResponse.json({ ok: true, points: result });
}
