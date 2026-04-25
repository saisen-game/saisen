import { NextRequest, NextResponse } from "next/server";
import { kv }                        from "@vercel/kv";
import { SKILLS }                    from "@/lib/skills";

const PREFIX     = "saisen:skills:v1:";
let   _mem: Record<string, string[]> = {};

async function getOwned(address: string): Promise<string[]> {
  const key = PREFIX + address.toLowerCase();
  try {
    const raw = await kv.get<string>(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return _mem[key] ?? [];
  }
}

async function saveOwned(address: string, ids: string[]): Promise<void> {
  const key = PREFIX + address.toLowerCase();
  const deduped = [...new Set(ids)];
  try {
    await kv.set(key, JSON.stringify(deduped));
  } catch {
    _mem[key] = deduped;
  }
}

// GET /api/skills?address=<pubkey>
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ skills: SKILLS });
  }

  const owned = await getOwned(address);
  return NextResponse.json({
    skills: SKILLS.map(s => ({ ...s, owned: owned.includes(s.id) })),
    owned,
  });
}

// POST /api/skills  — claim / unlock a skill
// body: { address, skillId, claimFree? }
export async function POST(req: NextRequest) {
  let body: { address?: string; skillId?: string; claimFree?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.address) return NextResponse.json({ error: "address required" }, { status: 400 });
  if (!body.skillId) return NextResponse.json({ error: "skillId required" }, { status: 400 });

  const skill = SKILLS.find(s => s.id === body.skillId);
  if (!skill) return NextResponse.json({ error: "Skill not found" }, { status: 404 });

  const owned = await getOwned(body.address);

  if (body.claimFree) {
    // Only allow one free claim per address (first skill only)
    const STARTER_KEY = "saisen:starter:v1:" + body.address.toLowerCase();
    try {
      const claimed = await kv.get<boolean>(STARTER_KEY);
      if (claimed) {
        return NextResponse.json({ error: "Free starter already claimed" }, { status: 400 });
      }
      await kv.set(STARTER_KEY, true);
    } catch {}
  }

  if (owned.includes(body.skillId)) {
    return NextResponse.json({ error: "Already owned" }, { status: 400 });
  }

  owned.push(body.skillId);
  await saveOwned(body.address, owned);
  return NextResponse.json({ ok: true, owned });
}
