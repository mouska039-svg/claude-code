import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("onboarding_sessions")
    .select("step, completed")
    .eq("token", token)
    .maybeSingle();

  return NextResponse.json({
    step: data?.step ?? 0,
    completed: data?.completed ?? false,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = (await req.json()) as { step: number };
  const supabase = createAdminClient();

  const completed = body.step >= 4;
  await supabase
    .from("onboarding_sessions")
    .update({ step: body.step, completed })
    .eq("token", token);

  return NextResponse.json({ ok: true });
}
