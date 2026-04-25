import { NextRequest, NextResponse } from "next/server";
import { kv }                        from "@vercel/kv";
import { Connection, PublicKey }     from "@solana/web3.js";
import { SKILLS }                    from "@/lib/skills";
import { verifyPaymentTx, type PaymentToken } from "@/lib/solanaPayment";
import { getSaiBalance, isHolder as checkHolder } from "@/lib/walletAuth";

const PREFIX       = "saisen:skills:v1:";
const STARTER_PFX  = "saisen:starter:v1:";
const USED_TX_PFX  = "saisen:usedtx:v1:";
const SOLANA_RPC   = process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";

let _mem:     Record<string, string[]>  = {};
let _starter: Record<string, boolean>  = {};
let _usedTx:  Record<string, boolean>  = {};

function conn() {
  return new Connection(SOLANA_RPC, "confirmed");
}

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
  const key    = PREFIX + address.toLowerCase();
  const deduped = [...new Set(ids)];
  try {
    await kv.set(key, JSON.stringify(deduped));
  } catch {
    _mem[key] = deduped;
  }
}

async function getStarterClaimed(address: string): Promise<boolean> {
  const key = STARTER_PFX + address.toLowerCase();
  try {
    return !!(await kv.get<boolean>(key));
  } catch {
    return _starter[key] ?? false;
  }
}

async function setStarterClaimed(address: string): Promise<void> {
  const key = STARTER_PFX + address.toLowerCase();
  try {
    await kv.set(key, true);
  } catch {
    _starter[key] = true;
  }
}

async function isTxUsed(txHash: string): Promise<boolean> {
  const key = USED_TX_PFX + txHash;
  try {
    return !!(await kv.get<boolean>(key));
  } catch {
    return _usedTx[key] ?? false;
  }
}

async function markTxUsed(txHash: string): Promise<void> {
  const key = USED_TX_PFX + txHash;
  try {
    // Keep for 7 days
    await kv.set(key, true, { ex: 7 * 24 * 3600 });
  } catch {
    _usedTx[key] = true;
  }
}

// GET /api/skills?address=<pubkey>
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ skills: SKILLS });
  }

  const [owned, starterClaimed] = await Promise.all([
    getOwned(address),
    getStarterClaimed(address),
  ]);

  return NextResponse.json({
    skills:         SKILLS.map(s => ({ ...s, owned: owned.includes(s.id) })),
    owned,
    starterClaimed,
  });
}

// POST /api/skills
// body: { address, skillId, claimFree?, holderClaim?, txHash?, token?, amount? }
export async function POST(req: NextRequest) {
  let body: {
    address?:     string;
    skillId?:     string;
    claimFree?:   boolean;
    holderClaim?: boolean;
    txHash?:      string;
    token?:       PaymentToken;
    amount?:      number;
  };
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
  if (owned.includes(body.skillId)) {
    return NextResponse.json({ error: "Already owned" }, { status: 400 });
  }

  // ── Path 1: Free starter claim ────────────────────────────────
  if (body.claimFree) {
    const alreadyClaimed = await getStarterClaimed(body.address);
    if (alreadyClaimed) {
      return NextResponse.json({ error: "Free starter already claimed" }, { status: 400 });
    }
    await setStarterClaimed(body.address);
    owned.push(body.skillId);
    await saveOwned(body.address, owned);
    return NextResponse.json({ ok: true, owned });
  }

  // ── Path 2: Holder claim (verify on-chain balance) ────────────
  if (body.holderClaim) {
    const connection = conn();
    try {
      const sai      = await getSaiBalance(connection, body.address);
      const qualifies = checkHolder(sai);
      if (!qualifies) {
        return NextResponse.json({
          error: `Need ≥ 10M $SAI to claim as holder. You have ${sai.toLocaleString()}`,
        }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Failed to verify $SAI balance" }, { status: 500 });
    }
    owned.push(body.skillId);
    await saveOwned(body.address, owned);
    return NextResponse.json({ ok: true, owned });
  }

  // ── Path 3: Paid unlock — verify tx on-chain ─────────────────
  if (!body.txHash) {
    return NextResponse.json({ error: "txHash required for paid unlock" }, { status: 400 });
  }
  if (!body.token) {
    return NextResponse.json({ error: "token required (sol|usdc|sai)" }, { status: 400 });
  }
  if (typeof body.amount !== "number" || body.amount <= 0) {
    return NextResponse.json({ error: "amount required" }, { status: 400 });
  }

  // Expected amount from skill definition
  const expectedAmt = skill.price[body.token];
  if (!expectedAmt) {
    return NextResponse.json({ error: `Skill not available for ${body.token}` }, { status: 400 });
  }

  // Anti-replay: each tx can only be used once
  const used = await isTxUsed(body.txHash);
  if (used) {
    return NextResponse.json({ error: "Transaction already used" }, { status: 400 });
  }

  // Verify on-chain
  const connection = conn();
  const verification = await verifyPaymentTx(
    connection,
    body.txHash,
    body.address,
    body.token,
    expectedAmt,
  );

  if (!verification.ok) {
    return NextResponse.json({ error: `Payment verification failed: ${verification.error}` }, { status: 400 });
  }

  // Mark tx as used, then unlock
  await markTxUsed(body.txHash);
  owned.push(body.skillId);
  await saveOwned(body.address, owned);

  return NextResponse.json({ ok: true, owned });
}
