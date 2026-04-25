import { generateBotTimeline, getBotScoreAt, type Difficulty } from "./botEngine";
import { applyElo, DEFAULT_ELO } from "./elo";

export const AGENT_DAILY_LIMIT = 15;
export const AGENT_VERSION     = "v1";

export interface Agent {
  id:           string;
  owner:        string;   // Solana pubkey
  name:         string;
  difficulty:   Difficulty;
  elo:          number;
  wins:         number;
  losses:       number;
  bestScore:    number;
  totalMatches: number;
  dailyMatches: number;
  dailyDate:    string;   // YYYY-MM-DD
  createdAt:    number;
  updatedAt:    number;
}

export interface MatchResult {
  agentId:    string;
  agentScore: number;
  oppScore:   number;
  win:        boolean;
  timestamp:  number;
  duration:   number;
  mode:       "human_vs_agent" | "agent_vs_agent";
}

export type CreateAgentInput = Pick<Agent, "owner" | "name" | "difficulty">;

export function createAgent(input: CreateAgentInput): Agent {
  const today = todayStr();
  return {
    id:           crypto.randomUUID(),
    owner:        input.owner,
    name:         input.name.slice(0, 32).trim(),
    difficulty:   input.difficulty,
    elo:          DEFAULT_ELO,
    wins:         0,
    losses:       0,
    bestScore:    0,
    totalMatches: 0,
    dailyMatches: 0,
    dailyDate:    today,
    createdAt:    Date.now(),
    updatedAt:    Date.now(),
  };
}

export function simulateAgentMatch(
  agent: Agent,
  opponentDifficulty: Difficulty = "medium",
  durationMs = 30_000
): { agentScore: number; opponentScore: number; win: boolean } {
  const agentTL    = generateBotTimeline(agent.difficulty, durationMs);
  const oppTL      = generateBotTimeline(opponentDifficulty, durationMs);
  const agentScore = getBotScoreAt(agentTL, durationMs);
  const opScore    = getBotScoreAt(oppTL, durationMs);
  return { agentScore, opponentScore: opScore, win: agentScore > opScore };
}

export function applyMatchToAgent(
  agent: Agent,
  agentScore: number,
  win: boolean
): Agent {
  const today = todayStr();
  const dailyMatches = agent.dailyDate === today
    ? agent.dailyMatches + 1
    : 1;

  return {
    ...agent,
    elo:          applyElo(agent.elo, win),
    wins:         agent.wins   + (win ? 1 : 0),
    losses:       agent.losses + (win ? 0 : 1),
    bestScore:    Math.max(agent.bestScore, agentScore),
    totalMatches: agent.totalMatches + 1,
    dailyMatches,
    dailyDate:    today,
    updatedAt:    Date.now(),
  };
}

export function canAgentPlay(agent: Agent): boolean {
  const today = todayStr();
  if (agent.dailyDate !== today) return true;
  return agent.dailyMatches < AGENT_DAILY_LIMIT;
}

export function getRemainingMatches(agent: Agent): number {
  const today = todayStr();
  if (agent.dailyDate !== today) return AGENT_DAILY_LIMIT;
  return Math.max(0, AGENT_DAILY_LIMIT - agent.dailyMatches);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}
