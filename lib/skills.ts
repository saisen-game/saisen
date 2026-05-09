export const SAI_CONTRACT = "0x2b286ce09d09e77c5aaeb05cb73a6d7c6066cba3";
export const SAI_HOLDER_THRESHOLD = 10_000_000; // 10M $SAI

export interface SkillPrice {
  sol?:  number;
  usdc?: number;
  sai?:  number;
}

export interface Skill {
  id:               string;
  name:             string;
  description:      string;
  mechanic:         string;
  icon:             string;
  rarity:           "common" | "rare" | "legendary";
  durationMs:       number;
  cooldownMs:       number;
  price:            SkillPrice;
  freeForHolders:   boolean;
}

export const SKILLS: Skill[] = [
  {
    id:           "time_freeze",
    name:         "Time Freeze",
    description:  "Freezes your time perception — the timer appears stopped while the ball keeps moving internally.",
    mechanic:     "Pauses the visible countdown for the duration. Internally time still passes.",
    icon:         "❄️",
    rarity:       "legendary",
    durationMs:   5_000,
    cooldownMs:   60_000,
    price:        { sol: 0.05, usdc: 5, sai: 500_000 },
    freeForHolders: true,
  },
  {
    id:           "speed_burst",
    name:         "Speed Burst",
    description:  "Doubles target spawn rate for 5 seconds — more targets, more points.",
    mechanic:     "Halves target spawn interval for duration.",
    icon:         "⚡",
    rarity:       "rare",
    durationMs:   5_000,
    cooldownMs:   45_000,
    price:        { sol: 0.02, usdc: 2, sai: 200_000 },
    freeForHolders: true,
  },
  {
    id:           "ghost_vision",
    name:         "Ghost Vision",
    description:  "See target positions 400ms before they fully appear.",
    mechanic:     "Targets render as ghost outlines 400ms before becoming clickable.",
    icon:         "👁️",
    rarity:       "rare",
    durationMs:   8_000,
    cooldownMs:   50_000,
    price:        { sol: 0.03, usdc: 3, sai: 300_000 },
    freeForHolders: true,
  },
  {
    id:           "double_points",
    name:         "Double Points",
    description:  "Every target hit counts as 2 for 5 seconds.",
    mechanic:     "Score increment doubles for duration.",
    icon:         "✖️",
    rarity:       "rare",
    durationMs:   5_000,
    cooldownMs:   55_000,
    price:        { sol: 0.04, usdc: 4, sai: 400_000 },
    freeForHolders: true,
  },
  {
    id:           "score_shield",
    name:         "Score Shield",
    description:  "One free miss — the bot gains 0 points on its next hit.",
    mechanic:     "Blocks the next bot score increment once.",
    icon:         "🛡️",
    rarity:       "common",
    durationMs:   0,
    cooldownMs:   30_000,
    price:        { sol: 0.01, usdc: 1, sai: 100_000 },
    freeForHolders: true,
  },
];

export function getSkillById(id: string): Skill | undefined {
  return SKILLS.find((s) => s.id === id);
}

export const RARITY_COLORS: Record<Skill["rarity"], string> = {
  common:    "#94a3b8",
  rare:      "#3b82f6",
  legendary: "#9f5fff",
};
