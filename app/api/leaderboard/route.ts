import { NextRequest, NextResponse } from "next/server";
import { kv }                        from "@vercel/kv";

// ─── Types ───────────────────────────────────────────────────
export interface LBEntry {
  id:      string;   // String(fid) for Farcaster users, lowercased wallet address for others
  display: string;   // "@username" or "0x1234…abcd"
  pfpUrl?: string;
  elo:     number;
  wins:    number;
  losses:  number;
  score:   number;
  matches: number;
  source:  "farcaster" | "wallet" | "both";
  updatedAt: number; // unix ms
}

interface PostBody {
  fid?:      number;
  username?: string;
  pfpUrl?:   string;
  address?:  string;
  win:       boolean;
  score:     number;
  elo:       number;
}

// ─── KV key ──────────────────────────────────────────────────
const LB_KEY  = "saisen:lb:v1";
const MAX_CAP = 500;

// ─── In-memory fallback (local dev without KV) ───────────────
let _mem: LBEntry[] = [];

async function getAll(): Promise<LBEntry[]> {
  try {
    const raw = await kv.get<string>(LB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return _mem;
  }
}

async function saveAll(data: LBEntry[]): Promise<void> {
  const payload = data
    .sort((a, b) => b.elo - a.elo)
    .slice(0, MAX_CAP);
  try {
    await kv.set(LB_KEY, JSON.stringify(payload));
  } catch {
    _mem = payload;
  }
}

// ─── GET /api/leaderboard ────────────────────────────────────
export async function GET() {
  const entries = await getAll();
  return NextResponse.json({
    entries: entries.sort((a, b) => b.elo - a.elo),
    count:   entries.length,
    updatedAt: Date.now(),
  });
}

// ─── POST /api/leaderboard ───────────────────────────────────
export async function POST(req: NextRequest) {
  let body: PostBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // ── Basic validation ────────────────────────────────────────
  if (typeof body.win   !== "boolean")   return NextResponse.json({ error: "Missing win"   }, { status: 400 });
  if (typeof body.score !== "number")    return NextResponse.json({ error: "Missing score" }, { status: 400 });
  if (typeof body.elo   !== "number")    return NextResponse.json({ error: "Missing elo"   }, { status: 400 });
  if (body.score > 55)                   return NextResponse.json({ error: "Score too high" }, { status: 400 });
  if (body.elo   > 5000)                 return NextResponse.json({ error: "ELO too high"  }, { status: 400 });

  // ── Resolve identity ────────────────────────────────────────
  const id = body.fid
    ? String(body.fid)
    : body.address?.toLowerCase();

  if (!id) {
    return NextResponse.json({ error: "No identity (fid or address required)" }, { status: 400 });
  }

  // ── Upsert entry ────────────────────────────────────────────
  const entries = await getAll();
  const idx     = entries.findIndex(e => e.id === id);

  if (idx >= 0) {
    const prev = entries[idx];
    entries[idx] = {
      ...prev,
      display:  body.username ? `@${body.username}` : prev.display,
      pfpUrl:   body.pfpUrl   ?? prev.pfpUrl,
      elo:      body.elo,
      wins:     prev.wins    + (body.win ? 1 : 0),
      losses:   prev.losses  + (body.win ? 0 : 1),
      score:    prev.score   + body.score,
      matches:  prev.matches + 1,
      source:   body.address
        ? (prev.source === "farcaster" ? "both" : prev.source)
        : prev.source,
      updatedAt: Date.now(),
    };
  } else {
    const newEntry: LBEntry = {
      id,
      display:  body.username
        ? `@${body.username}`
        : body.address
        ? `${body.address.slice(0, 6)}…${body.address.slice(-4)}`
        : id,
      pfpUrl:    body.pfpUrl,
      elo:       body.elo,
      wins:      body.win ? 1 : 0,
      losses:    body.win ? 0 : 1,
      score:     body.score,
      matches:   1,
      source:    body.fid ? "farcaster" : "wallet",
      updatedAt: Date.now(),
    };
    entries.push(newEntry);
  }

  await saveAll(entries);
  return NextResponse.json({ ok: true });
}