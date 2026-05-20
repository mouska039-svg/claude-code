import { NextRequest, NextResponse } from "next/server";
import webPush from "web-push";
import { createAdminClient } from "@/lib/supabase/server";

webPush.setVapidDetails(
  "mailto:noreply@naya.app",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("endpoint, keys_p256dh, keys_auth");

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const payload = JSON.stringify({
    title: "Votre check-in du jour",
    body: "Prenez 2 minutes pour noter comment vous vous sentez aujourd'hui.",
    url: "/",
  });

  let sent = 0;
  const toDelete: string[] = [];

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth },
          },
          payload
        );
        sent++;
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 410 || status === 404) {
          toDelete.push(sub.endpoint);
        }
      }
    })
  );

  if (toDelete.length > 0) {
    await supabase.from("push_subscriptions").delete().in("endpoint", toDelete);
  }

  return NextResponse.json({ sent, removed: toDelete.length });
}
