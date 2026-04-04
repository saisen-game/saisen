export interface MatchMetrics {
  clickTimestamps: number[]; // ms elapsed from match start for each click
  startEpoch:      number;   // Date.now() when match started
  endEpoch:        number;   // Date.now() when match ended
  playerScore:     number;
}

export interface ValidationResult {
  valid:  boolean;
  reason: string | null;
}

// ─── Thresholds (client-side — contract has its own) ─────────
const MAX_SCORE            = 50;   // contract allows 55; client is stricter
const MIN_DURATION_MS      = 28_000;
const MAX_DURATION_MS      = 35_000;
const MAX_CLICKS_PER_SECOND = 7;   // human cap: realistic is ~3–4/s
const MAX_CONSECUTIVE_FAST = 5;    // max consecutive clicks under 120 ms

export function validateMatch(m: MatchMetrics): ValidationResult {
  const duration = m.endEpoch - m.startEpoch;

  if (duration < MIN_DURATION_MS)
    return { valid: false, reason: `Match too short (${Math.round(duration / 1000)}s)` };

  if (duration > MAX_DURATION_MS)
    return { valid: false, reason: `Match too long (${Math.round(duration / 1000)}s)` };

  if (m.playerScore > MAX_SCORE)
    return { valid: false, reason: `Score ${m.playerScore} exceeds ceiling ${MAX_SCORE}` };

  if (m.clickTimestamps.length !== m.playerScore)
    return { valid: false, reason: "Click count does not match score" };

  // Sliding 1-second window
  for (let i = 0; i < m.clickTimestamps.length; i++) {
    const windowEnd = m.clickTimestamps[i] + 1000;
    const inWindow  = m.clickTimestamps.filter(
      (t) => t >= m.clickTimestamps[i] && t <= windowEnd
    ).length;

    if (inWindow > MAX_CLICKS_PER_SECOND)
      return { valid: false, reason: `Burst rate: ${inWindow} clicks/s detected` };
  }

  // Consecutive ultra-fast click streak
  let fastStreak = 0;
  for (let i = 1; i < m.clickTimestamps.length; i++) {
    const gap = m.clickTimestamps[i] - m.clickTimestamps[i - 1];
    fastStreak = gap < 120 ? fastStreak + 1 : 0;

    if (fastStreak > MAX_CONSECUTIVE_FAST)
      return { valid: false, reason: "Inhuman click pattern detected" };
  }

  return { valid: true, reason: null };
}

/**
 * Call this inside the game loop on every player click.
 * Returns a new array (immutable update).
 */
export function recordClick(
  timestamps:   number[],
  matchStartMs: number
): number[] {
  return [...timestamps, Date.now() - matchStartMs];
}