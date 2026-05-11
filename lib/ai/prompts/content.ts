import type { ContentInput } from "@/lib/ai/schemas/content"

const TYPE_MAP: Record<ContentInput["type"], string> = {
  caption_ig: "caption Instagram (description de post)",
  hook_tiktok: "hook TikTok (accroche vidéo, 1-2 phrases percutantes)",
  reel_idea: "idée complète de Reel (concept + script + CTA)",
  cta: "call-to-action (appel à l'action)",
  viral_hook: "hook viral (phrase d'accroche virale pour n'importe quel format)",
}

const TONE_MAP: Record<ContentInput["tone"], string> = {
  motivating: "motivant, énergique, qui inspire à l'action",
  professional: "professionnel, expert, crédible",
  aggressive: "direct, agressif (dans le bon sens), sans filtre",
  luxury: "luxe, exclusif, premium",
}

const LENGTH_MAP: Record<ContentInput["length"], string> = {
  short: "court (1-3 phrases max)",
  medium: "moyen (4-8 phrases)",
  long: "long (8+ phrases, storytelling)",
}

export function buildContentPrompt(input: ContentInput): string {
  return `Tu es un expert en création de contenu pour coachs fitness sur les réseaux sociaux.

TYPE : ${TYPE_MAP[input.type]}
TON : ${TONE_MAP[input.tone]}
LONGUEUR : ${LENGTH_MAP[input.length]}
SUJET : ${input.topic}

CONSIGNES :
- Génère exactement 5 variantes DIFFÉRENTES
- Chaque variante doit avoir une approche unique (angle différent)
- Adapté à un coach fitness francophone
- Naturel, authentique, pas générique
- Emojis si pertinent pour le format
- Pour les hooks : commencer par un mot/phrase qui arrête le scroll
- Pas de hashtags dans les variantes (optionnel séparé)

FORMAT : JSON avec array "variants" de 5 strings.`
}
