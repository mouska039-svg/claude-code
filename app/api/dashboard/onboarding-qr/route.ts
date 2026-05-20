import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import QRCode from "qrcode";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import crypto from "crypto";

const schema = z.object({
  clientId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  const { clientId } = parsed.data;
  const token = crypto.randomUUID();
  const admin = createAdminClient();

  // Upsert onboarding session (one per client, reset if already exists)
  await admin.from("onboarding_sessions").upsert(
    {
      client_id: clientId,
      token,
      step: 0,
      completed: false,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    { onConflict: "client_id" }
  );

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${req.headers.get("host")}`;
  const onboardingUrl = `${baseUrl}/portal/onboarding/${token}`;

  const qrSvg = await QRCode.toString(onboardingUrl, {
    type: "svg",
    width: 200,
    margin: 1,
  });

  return NextResponse.json({ qrSvg, url: onboardingUrl, step: 0 });
}
