import { NextRequest, NextResponse } from "next/server";
import { kv }                        from "@vercel/kv";
import {
  createAgent, canAgentPlay, applyMatchToAgent,
  simulateAgentMatch, getRemainingMatches,
  type Agent, type CreateAgentInput,
} from "@/lib/agentEngine";
import type { Difficulty }           from "@/lib/botEngine";

const AGENTS_KEY = "saisen:agents:v1";
let   _mem: Agent[] = [];

async function getAgents(): Promise<Agent[]> {
  try {
    const raw = await kv.get<string>(AGENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return _mem;
  }
}

async function saveAgents(agents: Agent[]): Promise<void> {
  try {
    await kv.set(AGENTS_KEY, JSON.stringify(agents));
  } catch {
    _mem = agents;
  }
}

// GET /api/agents
export async function GET(req: NextRequest) {
  const agents  = await getAgents();
  const { searchParams } = new URL(req.url);
  const owner   = searchParams.get("owner");
  const filtered = owner
    ? agents.filter(a => a.owner.toLowerCase() === owner.toLowerCase())
    : agents;

  return NextResponse.json({
    agents:    filtered.sort((a, b) => b.elo - a.elo),
    count:     filtered.length,
    updatedAt: Date.now(),
  });
}

// POST /api/agents
export async function POST(req: NextRequest) {
  let body: Partial<CreateAgentInput>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.owner || typeof body.owner !== "string") {
    return NextResponse.json({ error: "owner (Solana pubkey) required" }, { status: 400 });
  }
  if (!body.name  || typeof body.name !== "string") {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }
  const validDiffs: Difficulty[] = ["easy", "medium", "hard"];
  if (!body.difficulty || !validDiffs.includes(body.difficulty)) {
    return NextResponse.json({ error: "difficulty must be easy|medium|hard" }, { status: 400 });
  }

  const agents = await getAgents();
  const owned  = agents.filter(a => a.owner.toLowerCase() === body.owner!.toLowerCase());
  if (owned.length >= 5) {
    return NextResponse.json({ error: "Max 5 agents per wallet" }, { status: 400 });
  }

  const agent = createAgent({
    owner:      body.owner,
    name:       body.name,
    difficulty: body.difficulty,
  });

  agents.push(agent);
  await saveAgents(agents);
  return NextResponse.json({ agent }, { status: 201 });
}
