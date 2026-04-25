import { NextRequest, NextResponse } from "next/server";
import { kv }                        from "@vercel/kv";
import {
  canAgentPlay, applyMatchToAgent, simulateAgentMatch,
  getRemainingMatches, type Agent,
} from "@/lib/agentEngine";
import type { Difficulty }           from "@/lib/botEngine";

const AGENTS_KEY  = "saisen:agents:v1";
const LB_KEY      = "saisen:lb:v1";
const MATCHES_KEY = "saisen:matches:v1";
let   _agentMem: Agent[] = [];

async function getAgents(): Promise<Agent[]> {
  try {
    const raw = await kv.get<string>(AGENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return _agentMem;
  }
}

async function saveAgents(agents: Agent[]): Promise<void> {
  try { await kv.set(AGENTS_KEY, JSON.stringify(agents)); }
  catch { _agentMem = agents; }
}

async function postToLeaderboard(agent: Agent): Promise<void> {
  try {
    const rawLb = await kv.get<string>(LB_KEY);
    const list  = rawLb ? JSON.parse(rawLb) : [];
    const id    = `agent:${agent.id}`;
    const idx   = list.findIndex((e: any) => e.id === id);
    const entry = {
      id,
      display:   `🤖 ${agent.name}`,
      elo:       agent.elo,
      wins:      agent.wins,
      losses:    agent.losses,
      score:     agent.wins * 30, // approximate: agents win by scoring
      bestScore: agent.bestScore,
      matches:   agent.totalMatches,
      source:    "wallet",
      updatedAt: Date.now(),
    };
    if (idx >= 0) list[idx] = entry;
    else list.push(entry);
    await kv.set(LB_KEY, JSON.stringify(list.sort((a: any, b: any) => b.elo - a.elo).slice(0, 500)));
  } catch {}
}

async function logMatch(
  agentA: Agent,
  nameB: string,
  scoreA: number,
  scoreB: number,
  mode: "human_vs_agent" | "agent_vs_agent",
): Promise<void> {
  try {
    const rawMatches = await kv.get<string>(MATCHES_KEY);
    const matches    = rawMatches ? JSON.parse(rawMatches) : [];
    matches.unshift({
      id:        `${agentA.id}:${Date.now()}`,
      playerA:   `🤖 ${agentA.name}`,
      playerB:   nameB,
      scoreA,
      scoreB,
      winner:    scoreA > scoreB ? "A" : "B",
      mode,
      timestamp: Date.now(),
    });
    await kv.set(MATCHES_KEY, JSON.stringify(matches.slice(0, 500)));
  } catch {}
}

// POST /api/agents/[id]/battle
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let body: { opponentId?: string; difficulty?: Difficulty } = {};
  try { body = await req.json(); } catch {}

  const agents = await getAgents();
  const idx    = agents.findIndex(a => a.id === params.id);
  if (idx < 0) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  const agent = agents[idx];

  if (!canAgentPlay(agent)) {
    return NextResponse.json({
      error:     "Daily match limit reached",
      remaining: 0,
      resetAt:   "tomorrow",
    }, { status: 429 });
  }

  let agentScore: number, opponentScore: number, win: boolean;
  let opponentName = "Bot";
  let mode: "human_vs_agent" | "agent_vs_agent" = "human_vs_agent";

  if (body.opponentId) {
    // Agent vs Agent
    const oppIdx = agents.findIndex(a => a.id === body.opponentId);
    if (oppIdx < 0) return NextResponse.json({ error: "Opponent agent not found" }, { status: 404 });
    const opp    = agents[oppIdx];

    if (!canAgentPlay(opp)) {
      return NextResponse.json({ error: "Opponent agent has reached daily limit" }, { status: 429 });
    }

    const result  = simulateAgentMatch(agent, opp.difficulty);
    agentScore    = result.agentScore;
    opponentScore = result.opponentScore;
    win           = result.win;
    opponentName  = `🤖 ${opp.name}`;
    mode          = "agent_vs_agent";

    // Update opponent
    agents[oppIdx] = applyMatchToAgent(opp, opponentScore, !win);
    await postToLeaderboard(agents[oppIdx]);
  } else {
    const diff = body.difficulty ?? agent.difficulty;
    const result = simulateAgentMatch(agent, diff);
    agentScore    = result.agentScore;
    opponentScore = result.opponentScore;
    win           = result.win;
    opponentName  = `Bot (${diff})`;
    mode          = "human_vs_agent";
  }

  agents[idx] = applyMatchToAgent(agent, agentScore, win);
  await saveAgents(agents);
  await postToLeaderboard(agents[idx]);
  await logMatch(agents[idx], opponentName, agentScore, opponentScore, mode);

  return NextResponse.json({
    agentScore,
    opponentScore,
    win,
    opponentName,
    agentElo:   agents[idx].elo,
    remaining:  getRemainingMatches(agents[idx]),
    timestamp:  Date.now(),
  });
}
