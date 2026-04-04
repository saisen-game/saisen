export type Difficulty = "easy" | "medium" | "hard";

interface BotConfig {
  minScore:      number;
  maxScore:      number;
  avgIntervalMs: number; // average ms between bot clicks
  varianceFactor: number; // jitter as fraction of avgInterval (0–1)
}

const CONFIGS: Record<Difficulty, BotConfig> = {
  easy:   { minScore: 11, maxScore: 18, avgIntervalMs: 2000, varianceFactor: 0.45 },
  medium: { minScore: 20, maxScore: 27, avgIntervalMs: 1400, varianceFactor: 0.35 },
  hard:   { minScore: 28, maxScore: 38, avgIntervalMs: 1000, varianceFactor: 0.25 },
};

/**
 * Pre-compute the bot's full click timeline before the match starts.
 * Returns an array of millisecond timestamps (from match start).
 * This is sealed in a ref — the bot cannot cheat at runtime.
 */
export function generateBotTimeline(
  difficulty:  Difficulty,
  durationMs:  number = 30_000
): number[] {
  const cfg = CONFIGS[difficulty];

  const targetClicks =
    Math.floor(Math.random() * (cfg.maxScore - cfg.minScore + 1)) +
    cfg.minScore;

  const times: number[] = [];

  // Bot has a realistic reaction delay before first click
  let t = 300 + Math.random() * 600;

  while (times.length < targetClicks && t < durationMs - 400) {
    times.push(Math.round(t));
    const jitter =
      (Math.random() - 0.5) * cfg.avgIntervalMs * cfg.varianceFactor;
    t += cfg.avgIntervalMs + jitter;
  }

  return times;
}

/**
 * Given the sealed timeline and elapsed ms, return current bot score.
 * Pure function — safe to call on every render tick.
 */
export function getBotScoreAt(
  timeline:  number[],
  elapsedMs: number
): number {
  return timeline.filter((t) => t <= elapsedMs).length;
}

// ─── UI helpers ──────────────────────────────────────────────

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy:   "Easy",
  medium: "Medium",
  hard:   "Hard",
};

export const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  easy:   "Chill mode. Great for warming up.",
  medium: "Balanced opponent. Tests real skill.",
  hard:   "Ruthless. Unforgiving. Pure reflex.",
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy:   "#10b981",
  medium: "#f59e0b",
  hard:   "#f43f5e",
};