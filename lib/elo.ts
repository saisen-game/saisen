export const DEFAULT_ELO  = 1000;
export const WIN_DELTA    = 20;
export const LOSS_DELTA   = 15;
export const RATING_LABEL = "$SAI";

export function applyElo(current: number, win: boolean): number {
  if (win) return current + WIN_DELTA;
  return Math.max(1, current - LOSS_DELTA);
}

export interface RankTier {
  name:  string;
  color: string;
  emoji: string;
  min:   number;
  next:  number | null;
}

const TIERS: RankTier[] = [
  { name: "Bronze",   color: "#cd7f32", emoji: "🥉", min: 0,    next: 1300 },
  { name: "Silver",   color: "#94a3b8", emoji: "🥈", min: 1300, next: 1500 },
  { name: "Gold",     color: "#fbbf24", emoji: "🥇", min: 1500, next: 1700 },
  { name: "Platinum", color: "#38bdf8", emoji: "💎", min: 1700, next: 1900 },
  { name: "Diamond",  color: "#9f5fff", emoji: "👑", min: 1900, next: null  },
];

export function getRankTier(elo: number): RankTier {
  return (
    [...TIERS].reverse().find((t) => elo >= t.min) ?? TIERS[0]
  );
}

export function getTierProgress(elo: number): number {
  const tier = getRankTier(elo);
  if (!tier.next) return 100;
  return Math.min(100, Math.round(((elo - tier.min) / (tier.next - tier.min)) * 100));
}
