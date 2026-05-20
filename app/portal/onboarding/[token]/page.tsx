import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { OnboardingFlow } from "./onboarding-flow";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: session } = await supabase
    .from("onboarding_sessions")
    .select("client_id, step, completed, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (!session) notFound();
  if (new Date(session.expires_at) < new Date()) notFound();

  const { data: clientData } = await supabase
    .from("clients")
    .select("full_name, user_id")
    .eq("id", session.client_id)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, brand_name")
    .eq("id", clientData?.user_id ?? "")
    .maybeSingle();

  const practitionerName = profile?.brand_name ?? profile?.full_name ?? "votre praticien";
  const clientFirstName = clientData?.full_name?.split(" ")[0] ?? "vous";

  return (
    <div className="min-h-dvh bg-cream">
      <div className="h-1 w-full bg-gradient-to-r from-sage to-sage/40" />
      <OnboardingFlow
        token={token}
        clientId={session.client_id}
        initialStep={session.completed ? 4 : session.step}
        practitionerName={practitionerName}
        clientFirstName={clientFirstName}
      />
    </div>
  );
}
