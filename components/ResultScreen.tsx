"use client";

import { useWallet }              from "@solana/wallet-adapter-react";
import { Zap, AlertTriangle }     from "lucide-react";
import { getRankTier, RATING_LABEL } from "@/lib/elo";
import type { FarcasterUser }     from "@/lib/farcaster";
import type { ValidationResult }  from "@/lib/antiCheat";
import WalletButton               from "./WalletButton";

interface Props {
  playerScore:   number;
  botScore:      number;
  win:           boolean;
  eloChange:     number;
  newElo:        number;
  matchDuration: number;
  validation:    ValidationResult;
  fcUser:        FarcasterUser | null;
  onPlayAgain:   () => void;
  onBack:        () => void;
}

export default function ResultScreen({
  playerScore, botScore, win, eloChange, newElo,
  matchDuration, validation, fcUser, onPlayAgain, onBack,
}: Props) {
  const { connected, publicKey } = useWallet();
  const tier = getRankTier(newElo);

  const identityLine = fcUser
    ? `@${fcUser.username}`
    : publicKey
    ? `${publicKey.toBase58().slice(0, 6)}…${publicKey.toBase58().slice(-4)}`
    : null;

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

      {/* Rating card */}
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
          {RATING_LABEL} CHANGE
        </div>
        <div style={{
          fontFamily: "'Orbitron',monospace", fontSize: 38, fontWeight: 900,
          color: win ? "#4ade80" : "#f87171",
          textShadow: `0 0 20px ${win ? "rgba(74,222,128,.5)" : "rgba(248,113,113,.5)"}`,
        }}>
          {eloChange > 0 ? `+${eloChange}` : eloChange} {RATING_LABEL}
        </div>
        <div style={{
          fontFamily: "'Orbitron',monospace", fontSize: 14,
          color: tier.color, marginTop: 8, fontWeight: 700,
        }}>
          {tier.emoji} {tier.name} · {newElo} {RATING_LABEL}
        </div>
        {identityLine && (
          <div style={{
            fontSize: 12, color: "rgba(255,255,255,.28)", marginTop: 8,
            fontFamily: "'Rajdhani',sans-serif",
          }}>
            {identityLine}
          </div>
        )}
      </div>

      {/* Auto-submit confirmation */}
      {validation.valid ? (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 18px",
          background: "rgba(74,222,128,.05)", border: "1px solid rgba(74,222,128,.18)",
          borderRadius: 12, marginBottom: 18, maxWidth: 420, width: "100%",
          justifyContent: "center",
        }}>
          <span style={{ fontSize: 14 }}>✅</span>
          <div style={{
            fontSize: 13, color: "#4ade80", fontFamily: "'Rajdhani',sans-serif", fontWeight: 600,
          }}>
            Score submitted to leaderboard
          </div>
        </div>
      ) : (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          padding: "12px 18px",
          background: "rgba(244,63,94,.07)", border: "1px solid rgba(244,63,94,.22)",
          borderRadius: 12, marginBottom: 18, maxWidth: 420, width: "100%",
          textAlign: "left",
        }}>
          <AlertTriangle size={16} style={{ color: "#f87171", flexShrink: 0, marginTop: 1 }} />
          <div style={{
            fontSize: 13, color: "#f87171",
            fontFamily: "'Rajdhani',sans-serif", fontWeight: 600,
          }}>
            Score invalidated: {validation.reason}. Submission blocked.
          </div>
        </div>
      )}

      {/* Wallet prompt if no identity */}
      {!fcUser && !connected && (
        <div style={{
          padding: "14px 18px", marginBottom: 18,
          background: "rgba(251,191,36,.06)", border: "1px solid rgba(251,191,36,.2)",
          borderRadius: 12, maxWidth: 420, width: "100%",
        }}>
          <div style={{
            fontSize: 13, color: "#fbbf24", fontFamily: "'Rajdhani',sans-serif",
            fontWeight: 500, marginBottom: 12,
          }}>
            Connect your Solana wallet to track progress on the leaderboard.
          </div>
          <WalletButton />
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
