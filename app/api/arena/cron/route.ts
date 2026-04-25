import { NextRequest, NextResponse } from "next/server";
import { kv }                        from "@vercel/kv";
import {
  canAgentPlay, applyMatchToAgent, simulateAgentMatch,
  type Agent,
} from "@/lib/agentEngine";

const AGENTS_KEY  = "saisen:agents:v1";
const LB_KEY      = "saisen:lb:v1";
const MATCHES_KEY = "saisen:matches:v1";

// Must match CRON_SECRET in environment
const CRON_SECRET = process.env.CRON_SECRET ?? "";

async function getAgents(): Promise<Agent[]> {
  try {
    const raw = await kv.get<string>(AGENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

async function saveAgents(agents: Agent[]): Promise<void> {
  try { await kv.set(AGENTS_KEY, JSON.stringify(agents)); } catch {}
}

async function updateLeaderboard(agent: Agent): Promise<void> {
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
      score:     agent.wins * 30,
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

async function appendMatch(entry: object): Promise<void> {
  try {
    const raw = await kv.get<string>(MATCHES_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    arr.unshift(entry);
    await kv.set(MATCHES_KEY, JSON.stringify(arr.slice(0, 500)));
  } catch {}
}

// GET /api/arena/cron — called by Vercel Cron
// Also supports POST for manual triggering with secret header
export async function GET(req: NextRequest) {
  // Vercel Cron passes Authorization: Bearer <CRON_SECRET>
  const auth = req.headers.get("authorization") ?? "";
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agents = await getAgents();
  const eligible = agents.filter(a => canAgentPlay(a));

  if (eligible.length < 2) {
    return NextResponse.json({ ok: true, battled: 0, reason: "Not enough eligible agents" });
  }

  // Shuffle eligible agents
  const shuffled = [...eligible].sort(() => Math.random() - 0.5);

  // Pair them up (take up to 10 pairs per run to avoid timeout)
  const pairs: [Agent, Agent][] = [];
  for (let i = 0; i + 1 < shuffled.length && pairs.length < 10; i += 2) {
    pairs.push([shuffled[i], shuffled[i + 1]]);
  }

  const updatedMap = new Map<string, Agent>();

  for (const [agentA, agentB] of pairs) {
    const result = simulateAgentMatch(agentA, agentB.difficulty);
    const { agentScore, opponentScore, win } = result;

    const updatedA = applyMatchToAgent(agentA, agentScore, win);
    const updatedB = applyMatchToAgent(agentB, opponentScore, !win);

    updatedMap.set(updatedA.id, updatedA);
    updatedMap.set(updatedB.id, updatedB);

    await appendMatch({
      id:        `arena:${agentA.id}:${agentB.id}:${Date.now()}`,
      playerA:   `🤖 ${agentA.name}`,
      playerB:   `🤖 ${agentB.name}`,
      scoreA:    agentScore,
      scoreB:    opponentScore,
      winner:    win ? "A" : "B",
      mode:      "agent_vs_agent",
      timestamp: Date.now(),
    });
  }

  // Merge updates back into master list
  const finalAgents = agents.map(a =>
    updatedMap.has(a.id) ? updatedMap.get(a.id)! : a
  );
  await saveAgents(finalAgents);

  // Update leaderboard for all modified agents
  for (const agent of updatedMap.values()) {
    await updateLeaderboard(agent);
  }

  return NextResponse.json({
    ok:      true,
    battled: pairs.length * 2,
    pairs:   pairs.length,
  });
}

// Allow manual trigger too
export { GET as POST };
