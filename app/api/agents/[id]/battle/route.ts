import { NextRequest, NextResponse } from "next/server";
import { kv }                        from "@vercel/kv";
import {
  canAgentPlay, applyMatchToAgent, simulateAgentMatch,
  getRemainingMatches, type Agent,
} from "@/lib/agentEngine";
import type { Difficulty }           from "@/lib/botEngine";

const AGENTS_KEY = "saisen:agents:v1";
const LB_KEY     = "saisen:lb:v1";
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
    await kv.set(LB_KEY, JSON.stringify(
      await (async () => {
        const raw  = await kv.get<string>(LB_KEY);
        const list = raw ? JSON.parse(raw) : [];
        const id   = `agent:${agent.id}`;
        const idx  = list.findIndex((e: any) => e.id === id);
        const entry = {
          id,
          display:   `🤖 ${agent.name}`,
          elo:       agent.elo,
          wins:      agent.wins,
          losses:    agent.losses,
          score:     agent.bestScore,
          bestScore: agent.bestScore,
          matches:   agent.totalMatches,
          source:    "wallet",
          updatedAt: Date.now(),
        };
        if (idx >= 0) list[idx] = entry;
        else list.push(entry);
        return list.sort((a: any, b: any) => b.elo - a.elo).slice(0, 500);
      })()
    ));
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

  if (body.opponentId) {
    // Agent vs Agent
    const oppIdx = agents.findIndex(a => a.id === body.opponentId);
    if (oppIdx < 0) return NextResponse.json({ error: "Opponent agent not found" }, { status: 404 });
    const opp  = agents[oppIdx];
    const result = simulateAgentMatch(agent, opp.difficulty);
    agentScore    = result.agentScore;
    opponentScore = result.opponentScore;
    win           = result.win;
    opponentName  = opp.name;

    // Update opponent as well
    agents[oppIdx] = applyMatchToAgent(opp, opponentScore, !win);
  } else {
    const diff = body.difficulty ?? "medium";
    const result = simulateAgentMatch(agent, diff);
    agentScore    = result.agentScore;
    opponentScore = result.opponentScore;
    win           = result.win;
    opponentName  = `Bot (${diff})`;
  }

  agents[idx] = applyMatchToAgent(agent, agentScore, win);
  await saveAgents(agents);
  await postToLeaderboard(agents[idx]);

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
