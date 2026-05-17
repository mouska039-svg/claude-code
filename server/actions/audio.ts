"use server";

export const runtime = "nodejs";

import { createClient } from "@/lib/supabase/server";
import { checkQuota, incrementQuota } from "@/lib/quotas";
import { redirect } from "next/navigation";

export async function generateAudio(
  sessionId: string,
  text: string,
  title: string
): Promise<{ url?: string; audioId?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const quota = await checkQuota(user.id, "audios");
  if (!quota.allowed) {
    return { error: "Quota audio dépassé pour ce mois. Passez à un plan supérieur." };
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!voiceId || !apiKey) {
    return { error: "Configuration ElevenLabs manquante" };
  }

  let audioBuffer: Buffer;
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!response.ok) {
      return { error: "Erreur ElevenLabs lors de la génération audio" };
    }

    const arrayBuffer = await response.arrayBuffer();
    audioBuffer = Buffer.from(arrayBuffer);
  } catch {
    return { error: "Erreur réseau lors de la génération audio" };
  }

  const fileName = `${sessionId}/${Date.now()}.mp3`;

  const { error: uploadError } = await supabase.storage
    .from("session-audios")
    .upload(fileName, audioBuffer, { contentType: "audio/mpeg", upsert: false });

  if (uploadError) {
    return { error: "Erreur lors de l'enregistrement de l'audio" };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("session-audios").getPublicUrl(fileName);

  const { data: audioRow, error: insertError } = await supabase
    .from("session_audios")
    .insert({
      session_id: sessionId,
      title,
      audio_url: publicUrl,
      transcript: text,
      generated_by: "elevenlabs",
    })
    .select("id")
    .single();

  if (insertError) {
    return { error: "Erreur lors de l'enregistrement des métadonnées" };
  }

  await incrementQuota(user.id, "audios");

  return { url: publicUrl, audioId: audioRow.id };
}
