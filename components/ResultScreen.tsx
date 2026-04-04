"use client";

import { useState }           from "react";
import { useAccount }         from "wagmi";
import { ExternalLink, Zap, AlertTriangle } from "lucide-react";
import { submitScoreOnChain } from "@/lib/contracts";
import { getRankTier }        from "@/lib/elo";
import type { FarcasterUser } from "@/lib/farcaster";
import type { ValidationResult } from "@/lib/antiCheat";
import WalletButton           from "./WalletButton";

type TxState = "idle" | "pending" | "success" | "error";

interface Props {
  playerScore:   number;
  botScore:      number;
  win:           boolean;
  eloChange:     number;
  newElo:        number;
  matchDuration: number;       // seconds
  validation:    ValidationResult;
  fcUser:        FarcasterUser | null;
  onPlayAgain:   () => void;
  onBack:        () => void;
}

export default function ResultScreen({
  playerScore, botScore, win, eloChange, newElo,
  matchDuration, validation, fcUser, onPlayAgain, onBack,
}: Props) {
  const { isConnected } = useAccount();
  const [txState, setTxState] = useState<TxState>("idle");
  const [txHash,  setTxHash]  = useState("");
  const [txError, setTxError] = useState("");

  const tier     = getRankTier(newElo);
  const chainId  = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? "8453");
  const explorer = chainId === 8453
    ? "https://basescan.org/tx/"
    : "https://sepolia.basescan.org/tx/";

  async function handleSubmit() {
    if (!isConnected || !validation.valid) return;
    setTxState("pending"); setTxError("");
    try {
      const hash = await submitScoreOnChain(playerScore, win, matchDuration);
      setTxHash(hash);
      setTxState("success");
    } catch (e: any) {
      setTxError(e?.shortMessage ?? e?.message ?? "Transaction failed");
      setTxState("error");
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#06060f", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px 18px", textAlign: "center",
    }}>

      {/* Win / Loss icon */}
      <div style={{ fontSize: 72, marginBottom: 14, lineHeight: 1 }}>
        {win ? "🏆" : "💀"}
      </div>

      <h2
        className={win ? "animate-win" : "animate-lose"}
        style={{
          fontFamily: "'Orbitron',monospace",
          fontSize: "clamp(34px,6vw,52px)", fontWeight: 900, marginBottom: 10,
          color: win ? "#4ade80" : "#f87171",
        }}
      >
        {win ? "VICTORY!" : "DEFEAT"}
      </h2>

      {/* Score */}
      <div style={{
        fontFamily: "'Orbitron',monospace", fontSize: 28, fontWeight: 900,
        color: "rgba(255,255,255,.38)", marginBottom: 28,
      }}>
        {playerScore} — {botScore}
      </div>

      {/* ELO card */}
      <div style={{
        background: win ? "rgba(74,222,128,.06)" : "rgba(248,113,113,.06)",
        border: `1px solid ${win ? "rgba(74,222,128,.22)" : "rgba(248,113,113,.22)"}`,
        borderRadius: 18, padding: "22px 36px", marginBottom: 20,
        width: "100%", maxWidth: 420,
      }}>
        <div style={{
          fontFamily: "'Orbitron',monospace", fontSize: 10,
          color: "rgba(255,255,255,.28)", letterSpacing: ".2em", marginBottom: 10,
        }}>
          ELO CHANGE
        </div>
        <div style={{
          fontFamily: "'Orbitron',monospace", fontSize: 38, fontWeight: 900,
          color: win ? "#4ade80" : "#f87171",
          textShadow: `0 0 20px ${win ? "rgba(74,222,128,.5)" : "rgba(248,113,113,.5)"}`,
        }}>
          {eloChange > 0 ? `+${eloChange}` : eloChange} ELO
        </div>
        <div style={{
          fontFamily: "'Orbitron',monospace", fontSize: 14,
          color: tier.color, marginTop: 8, fontWeight: 700,
        }}>
          {tier.emoji} {tier.name} · {newElo}
        </div>
        {fcUser && (
          <div style={{
            fontSize: 12, color: "rgba(255,255,255,.28)", marginTop: 8,
            fontFamily: "'Rajdhani',sans-serif",
          }}>
            as @{fcUser.username} · FID {fcUser.fid}
          </div>
        )}
      </div>

      {/* Anti-cheat flag */}
      {!validation.valid && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          padding: "12px 18px",
          background: "rgba(244,63,94,.07)", border: "1px solid rgba(244,63,94,.22)",
          borderRadius: 12, marginBottom: 18, maxWidth: 420, width: "100%",
          textAlign: "left",
        }}>
          <AlertTriangle size={16} style={{ color: "#f87171", flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 13, color: "#f87171", fontFamily: "'Rajdhani',sans-serif", fontWeight: 600 }}>
            Score invalidated: {validation.reason}.
            On-chain submission blocked.
          </div>
        </div>
      )}

      {/* On-chain submission block */}
      {validation.valid && (
        <div style={{ width: "100%", maxWidth: 420, marginBottom: 18 }}>
          {txState === "idle" && (
            isConnected ? (
              <button
                onClick={handleSubmit}
                style={{
                  width: "100%", padding: "14px 0",
                  background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
                  border: "none", borderRadius: 12, cursor: "pointer",
                  fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: 13,
                  color: "#fff", letterSpacing: ".08em",
                  boxShadow: "0 0 22px rgba(59,130,246,.35)", transition: "filter .15s,transform .15s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.filter = "brightness(1.12)";
                  (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.filter = "";
                  (e.currentTarget as HTMLElement).style.transform = "";
                }}
              >
                ⛓️ Submit Score On-Chain
              </button>
            ) : (
              <div style={{
                padding: "16px 18px",
                background: "rgba(251,191,36,.06)", border: "1px solid rgba(251,191,36,.2)",
                borderRadius: 12,
              }}>
                <div style={{
                  fontSize: 13, color: "#fbbf24", fontFamily: "'Rajdhani',sans-serif",
                  fontWeight: 500, marginBottom: 12,
                }}>
                  ⚠️ Connect wallet to submit this score on-chain and update your permanent ELO.
                </div>
                <WalletButton />
              </div>
            )
          )}

          {txState === "pending" && (
            <div style={{
              padding: "14px 18px",
              background: "rgba(59,130,246,.07)", border: "1px solid rgba(59,130,246,.2)",
              borderRadius: 12, display: "flex", alignItems: "center",
              gap: 10, justifyContent: "center",
              fontSize: 13, color: "#60a5fa", fontFamily: "'Rajdhani',sans-serif", fontWeight: 600,
            }}>
              <div style={{
                width: 14, height: 14,
                border: "2px solid rgba(96,165,250,.3)", borderTop: "2px solid #60a5fa",
                borderRadius: "50%", animation: "spin .6s linear infinite",
              }} />
              Submitting transaction…
            </div>
          )}

          {txState === "success" && (
            <a
              href={`${explorer}${txHash}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "14px 18px",
                background: "rgba(74,222,128,.07)", border: "1px solid rgba(74,222,128,.22)",
                borderRadius: 12, fontSize: 13, color: "#4ade80",
                fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, textDecoration: "none",
              }}
            >
              ✅ Score submitted on-chain <ExternalLink size={13} />
            </a>
          )}

          {txState === "error" && (
            <div style={{
              padding: "12px 18px",
              background: "rgba(244,63,94,.07)", border: "1px solid rgba(244,63,94,.2)",
              borderRadius: 12, fontSize: 13, color: "#f87171",
              fontFamily: "'Rajdhani',sans-serif", fontWeight: 500,
            }}>
              ❌ {txError}{" "}
              <button
                onClick={() => setTxState("idle")}
                style={{
                  background: "none", border: "none", color: "#f87171",
                  cursor: "pointer", textDecoration: "underline",
                  fontFamily: "'Rajdhani',sans-serif", fontSize: 13,
                }}
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={onPlayAgain}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "linear-gradient(135deg,#9f5fff,#6d28d9)",
            border: "none", borderRadius: 10, padding: "13px 28px", cursor: "pointer",
            fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: 12,
            color: "#fff", boxShadow: "0 0 18px rgba(159,95,255,.4)", transition: "filter .15s",
          }}
        >
          <Zap size={13} /> Play Again
        </button>
        <button
          onClick={onBack}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "transparent", border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 10, padding: "13px 22px", cursor: "pointer",
            fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: 12,
            color: "rgba(255,255,255,.45)", transition: "all .15s",
          }}
        >
          Menu
        </button>
      </div>
    </div>
  );
}