import { NextRequest, NextResponse } from "next/server";
import { kv }                        from "@vercel/kv";

const LB_KEY  = "saisen:lb:v1";
const MAX_CAP = 500;
const MAX_SCORE = 55;
const MAX_RATING = 5000;

interface LBEntry {
  id:        string;
  display:   string;
  pfpUrl?:   string;
  elo:       number;
  wins:      number;
  losses:    number;
  score:     number;
  bestScore: number;
  matches:   number;
  source:    "farcaster" | "wallet" | "both";
  updatedAt: number;
}

interface ScoreBody {
  address?:  string;
  fid?:      number;
  username?: string;
  pfpUrl?:   string;
  win:       boolean;
  score:     number;
  elo:       number;
}

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
  const payload = data.sort((a, b) => b.elo - a.elo).slice(0, MAX_CAP);
  try {
    await kv.set(LB_KEY, JSON.stringify(payload));
  } catch {
    _mem = payload;
  }
}

export async function POST(req: NextRequest) {
  let body: ScoreBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.win   !== "boolean") return NextResponse.json({ error: "Missing win"   }, { status: 400 });
  if (typeof body.score !== "number")  return NextResponse.json({ error: "Missing score" }, { status: 400 });
  if (typeof body.elo   !== "number")  return NextResponse.json({ error: "Missing elo"   }, { status: 400 });
  if (body.score > MAX_SCORE)          return NextResponse.json({ error: "Score too high" }, { status: 400 });
  if (body.elo   > MAX_RATING)         return NextResponse.json({ error: "Rating too high" }, { status: 400 });

  const id = body.fid
    ? String(body.fid)
    : body.address?.toLowerCase();

  if (!id) {
    return NextResponse.json({ error: "Identity required (fid or address)" }, { status: 400 });
  }

  const entries = await getAll();
  const idx     = entries.findIndex(e => e.id === id);

  if (idx >= 0) {
    const prev = entries[idx];
    entries[idx] = {
      ...prev,
      display:   body.username ? `@${body.username}` : prev.display,
      pfpUrl:    body.pfpUrl ?? prev.pfpUrl,
      elo:       body.elo,
      wins:      prev.wins   + (body.win ? 1 : 0),
      losses:    prev.losses + (body.win ? 0 : 1),
      score:     prev.score  + body.score,
      bestScore: Math.max(prev.bestScore ?? 0, body.score),
      matches:   prev.matches + 1,
      source:    body.address
        ? (prev.source === "farcaster" ? "both" : prev.source)
        : prev.source,
      updatedAt: Date.now(),
    };
  } else {
    entries.push({
      id,
      display:   body.username
        ? `@${body.username}`
        : body.address
        ? `${body.address.slice(0, 6)}…${body.address.slice(-4)}`
        : id,
      pfpUrl:    body.pfpUrl,
      elo:       body.elo,
      wins:      body.win ? 1 : 0,
      losses:    body.win ? 0 : 1,
      score:     body.score,
      bestScore: body.score,
      matches:   1,
      source:    body.fid ? "farcaster" : "wallet",
      updatedAt: Date.now(),
    });
  }

  await saveAll(entries);
  return NextResponse.json({ ok: true });
}
