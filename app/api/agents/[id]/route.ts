import { NextRequest, NextResponse } from "next/server";
import { kv }                        from "@vercel/kv";
import {
  canAgentPlay, applyMatchToAgent, simulateAgentMatch,
  getRemainingMatches, type Agent,
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

// GET /api/agents/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const agents = await getAgents();
  const agent  = agents.find(a => a.id === params.id);
  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ agent, remaining: getRemainingMatches(agent) });
}

// POST /api/agents/[id]/battle is handled in the sub-route.
// DELETE /api/agents/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { owner } = await req.json().catch(() => ({})) as { owner?: string };
  if (!owner) return NextResponse.json({ error: "owner required" }, { status: 400 });

  const agents = await getAgents();
  const idx    = agents.findIndex(a => a.id === params.id);
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (agents[idx].owner.toLowerCase() !== owner.toLowerCase()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  agents.splice(idx, 1);
  await saveAgents(agents);
  return NextResponse.json({ ok: true });
}
