import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";

const subscribeSchema = z.object({
  email: z.string().email("Adresse email invalide"),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  let email: string;

  // Support both JSON and form-encoded bodies
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body: unknown = await request.json();
    const parsed = subscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Adresse email invalide" }, { status: 400 });
    }
    email = parsed.data.email;
  } else {
    // application/x-www-form-urlencoded (native HTML form POST)
    const formData = await request.formData();
    const raw = { email: formData.get("email") };
    const parsed = subscribeSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.redirect(
        new URL("/ressources/guide-naturopathe?error=email_invalide", request.url),
        303
      );
    }
    email = parsed.data.email;
  }

  const supabase = createAdminClient();

  // Insert — ignore duplicates via ON CONFLICT DO NOTHING
  const { error } = await supabase.from("lead_magnet_subscribers").insert({
    email,
    source: "guide-naturopathe",
  });

  // Conflict on (email, source) is silently ignored by the DB UNIQUE constraint.
  // Any other error is logged but we still redirect to avoid blocking the user.
  if (error && error.code !== "23505") {
    console.error("[lead-magnet/subscribe] Supabase error:", error.message);
  }

  return NextResponse.redirect(
    new URL("/ressources/guide-naturopathe/merci", request.url),
    303
  );
}
