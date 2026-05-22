import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { Resend } from "resend";

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

  const { error } = await supabase.from("lead_magnet_subscribers").insert({
    email,
    source: "guide-naturopathe",
  });

  if (error && error.code !== "23505") {
    console.error("[lead-magnet/subscribe] Supabase error:", error.message);
  }

  // Send the guide email via Resend
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromAddress = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

    await resend.emails
      .send({
        from: `Naya <${fromAddress}>`,
        to: email,
        subject: "Votre guide gratuit : Structurer une cure naturopathique",
        html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#F5EFE6;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:28px;font-weight:700;color:#2C2C2A;letter-spacing:-0.5px;">naya<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#D4876B;margin-left:2px;vertical-align:super;font-size:10px;"></span></span>
    </div>

    <div style="background:#FDFCFA;border-radius:16px;padding:40px;border:1px solid #DFD1BC;">
      <h1 style="font-size:24px;color:#2C2C2A;margin:0 0 16px;font-weight:700;line-height:1.3;">
        Voici votre guide gratuit 🌿
      </h1>
      <p style="color:#8B8A87;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Merci pour votre intérêt ! Voici votre guide complet pour structurer une cure naturopathique efficace et personnalisée.
      </p>

      <div style="background:#F0F5F2;border-radius:12px;padding:24px;margin-bottom:24px;border-left:4px solid #5C7A6B;">
        <h2 style="font-size:16px;color:#2C2C2A;margin:0 0 12px;font-weight:600;">📋 Les 5 étapes clés d'une cure réussie</h2>
        <ol style="color:#2C2C2A;font-size:14px;line-height:1.8;margin:0;padding-left:20px;">
          <li><strong>Anamnèse complète</strong> — recueillez les antécédents, le mode de vie et les plaintes principales</li>
          <li><strong>Bilan vitalité</strong> — évaluez l'énergie, le sommeil, la digestion et le stress</li>
          <li><strong>Axes prioritaires</strong> — identifiez 2 à 3 axes de travail pour la cure</li>
          <li><strong>Protocole structuré</strong> — définissez durée, compléments, hygiène de vie et suivi</li>
          <li><strong>Réévaluation</strong> — planifiez un point à 3 et 6 semaines pour ajuster</li>
        </ol>
      </div>

      <div style="background:#FDF4EF;border-radius:12px;padding:24px;margin-bottom:32px;border-left:4px solid #D4876B;">
        <h2 style="font-size:16px;color:#2C2C2A;margin:0 0 8px;font-weight:600;">💡 Conseil du mois</h2>
        <p style="color:#2C2C2A;font-size:14px;line-height:1.6;margin:0;">
          Commencez toujours par le drainage avant d'introduire des compléments. Un terrain mal drainé réduit l'efficacité de 60% des protocoles.
        </p>
      </div>

      <div style="text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://naya-praticien.vercel.app"}/sign-up" style="display:inline-block;background:#5C7A6B;color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;letter-spacing:0.2px;">
          Essayer Naya gratuitement →
        </a>
        <p style="color:#8B8A87;font-size:12px;margin:12px 0 0;">
          Structurez vos cures en quelques minutes. Sans engagement.
        </p>
      </div>
    </div>

    <p style="text-align:center;color:#8B8A87;font-size:12px;margin-top:24px;">
      Vous recevez cet email car vous avez demandé ce guide sur naya-praticien.vercel.app<br/>
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://naya-praticien.vercel.app"}" style="color:#5C7A6B;">naya-praticien.vercel.app</a>
    </p>
  </div>
</body>
</html>
      `.trim(),
      })
      .catch((err: unknown) => {
        console.error("[lead-magnet/subscribe] Resend error:", err);
      });
  }

  return NextResponse.redirect(
    new URL("/ressources/guide-naturopathe/merci", request.url),
    303
  );
}
