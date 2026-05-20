import { getClientPoints } from "@/server/actions/points";

interface JourneyProgressProps {
  clientId: string;
}

const LEVELS = [
  { key: "graine", label: "Graine", emoji: "🌱", min: 0, max: 49 },
  { key: "pousse", label: "Pousse", emoji: "🌿", min: 50, max: 199 },
  { key: "fleur", label: "Fleur", emoji: "🌸", min: 200, max: 499 },
  { key: "arbre", label: "Arbre", emoji: "🌳", min: 500, max: Infinity },
] as const;

export async function JourneyProgress({ clientId }: JourneyProgressProps) {
  const { total, level } = await getClientPoints(clientId);

  const currentLevel = LEVELS.find((l) => l.key === level) ?? LEVELS[0];
  const nextLevel = LEVELS[LEVELS.findIndex((l) => l.key === level) + 1];

  const progressInLevel = total - currentLevel.min;
  const levelRange = nextLevel ? nextLevel.min - currentLevel.min : 1;
  const progressPct = nextLevel
    ? Math.min(100, Math.round((progressInLevel / levelRange) * 100))
    : 100;

  return (
    <div className="rounded-2xl bg-card border border-sage/10 p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Votre cheminement</p>
          <p className="font-fraunces text-lg font-semibold text-ink mt-0.5">
            {currentLevel.emoji} {currentLevel.label}
          </p>
        </div>
        {nextLevel && (
          <p className="text-xs text-muted-foreground text-right">
            Prochain palier
            <br />
            <span className="font-medium text-ink">
              {nextLevel.emoji} {nextLevel.label}
            </span>
          </p>
        )}
        {!nextLevel && <p className="text-xs text-muted-foreground">Palier maximum</p>}
      </div>

      <div className="space-y-1.5">
        <div className="w-full h-2.5 rounded-full bg-muted/30 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sage to-sage/70 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {nextLevel && (
          <p className="text-xs text-muted-foreground">
            {nextLevel.min - total} actions avant {nextLevel.label}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {LEVELS.map((l, i) => {
          const isReached = LEVELS.findIndex((x) => x.key === level) >= i;
          return (
            <div key={l.key} className="flex flex-col items-center gap-1">
              <span
                className={`text-lg ${isReached ? "" : "opacity-30"}`}
                aria-label={l.label}
              >
                {l.emoji}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
