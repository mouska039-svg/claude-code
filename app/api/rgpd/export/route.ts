export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const userId = user.id;

  const [
    profileResult,
    clientsResult,
    protocolsResult,
    sessionsResult,
    invoicesResult,
    companiesResult,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("clients").select("*").eq("user_id", userId),
    supabase.from("protocols").select("*").eq("practitioner_id", userId),
    supabase.from("sessions").select("*").eq("practitioner_id", userId),
    supabase.from("invoices").select("*").eq("user_id", userId),
    supabase.from("companies").select("*").eq("user_id", userId),
  ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    user_id: userId,
    email: user.email,
    profile: profileResult.data,
    clients: clientsResult.data ?? [],
    protocols: protocolsResult.data ?? [],
    sessions: sessionsResult.data ?? [],
    invoices: invoicesResult.data ?? [],
    companies: companiesResult.data ?? [],
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="mes-donnees-naya.json"',
    },
  });
}
