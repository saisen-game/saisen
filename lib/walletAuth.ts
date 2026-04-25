import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { SAI_CONTRACT, SAI_HOLDER_THRESHOLD } from "./skills";

const SESSION_KEY  = "saisen:session:v2";
const SESSION_TTL  = 24 * 60 * 60 * 1000; // 24h

export interface WalletSession {
  address:   string;
  signature: string;
  ts:        number;
}

// ── Session storage ───────────────────────────────────────────
export function loadSession(): WalletSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as WalletSession;
    if (Date.now() - s.ts > SESSION_TTL) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function saveSession(s: WalletSession) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch {}
}

export function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch {}
}

// ── Nonce ─────────────────────────────────────────────────────
export function makeAuthNonce(address: string): string {
  const minute = Math.floor(Date.now() / 60_000);
  return `SAISEN_AUTH_${address}_${minute}`;
}

// ── Balances ──────────────────────────────────────────────────
export async function getSolBalance(connection: Connection, address: string): Promise<number> {
  try {
    const pk  = new PublicKey(address);
    const lam = await connection.getBalance(pk);
    return lam / LAMPORTS_PER_SOL;
  } catch {
    return 0;
  }
}

export async function getSaiBalance(connection: Connection, address: string): Promise<number> {
  try {
    const pk   = new PublicKey(address);
    const mint = new PublicKey(SAI_CONTRACT);
    const res  = await connection.getParsedTokenAccountsByOwner(pk, { mint });
    if (!res.value.length) return 0;
    const info = res.value[0].account.data.parsed?.info?.tokenAmount;
    return Number(info?.uiAmount ?? 0);
  } catch {
    return 0;
  }
}

export function isHolder(saiBalance: number): boolean {
  return saiBalance >= SAI_HOLDER_THRESHOLD;
}
