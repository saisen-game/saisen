import { NextRequest, NextResponse } from "next/server";
import { kv }                        from "@vercel/kv";

const MATCHES_KEY = "saisen:matches:v1";

export interface MatchEntry {
  id:        string;
  playerA:   string;
  playerB:   string;
  scoreA:    number;
  scoreB:    number;
  winner:    "A" | "B";
  mode:      "human_vs_bot" | "human_vs_agent" | "agent_vs_agent";
  timestamp: number;
}

let _mem: MatchEntry[] = [];

async function getMatches(): Promise<MatchEntry[]> {
  try {
    const raw = await kv.get<string>(MATCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return _mem;
  }
}

// GET /api/matches?limit=20&offset=0
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit  = Math.min(100, parseInt(searchParams.get("limit")  ?? "20", 10));
  const offset = Math.max(0,   parseInt(searchParams.get("offset") ?? "0",  10));

  const all   = await getMatches();
  const slice = all.slice(offset, offset + limit);

  return NextResponse.json({
    matches:   slice,
    total:     all.length,
    limit,
    offset,
    updatedAt: Date.now(),
  });
}
