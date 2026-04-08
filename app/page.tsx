"use client";

import { useEffect, useState } from "react";
import { Zap, Trophy }         from "lucide-react";
import { initFarcaster, type FarcasterUser } from "@/lib/farcaster";
import GameView        from "@/components/GameView";
import LeaderboardView from "@/components/LeaderboardView";
import FarcasterProfile from "@/components/FarcasterProfile";
import WalletButton    from "@/components/WalletButton";
import { ToriiIcon, LogoMark } from "@/components/icons";

// ➕ ADDED (no changes to existing logic)
import sdk from "@farcaster/miniapp-sdk";

type View = "home" | "game" | "leaderboard";

export default function Home() {
  const [fcUser,   setFcUser]   = useState<FarcasterUser | null>(null);
  const [inFC,     setInFC]     = useState(false);
  const [view,     setView]     = useState<View>("home");
  const [hydrated, setHydrated] = useState(false);

  // ➕ ADDED
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    initFarcaster().then((ctx) => {
      setFcUser(ctx.user);
      setInFC(ctx.isInFarcaster);
      setHydrated(true);
    });

    // ➕ ADDED
    try {
      sdk.context
        .then(() => setCanInstall(true))
        .catch(() => {});
    } catch {}
  }, []);

  // ➕ OPTIONAL SMOOTH UX (added only)
  useEffect(() => {
    if (hydrated && inFC && view === "home") {
      setTimeout(() => setView("game"), 300);
    }
  }, [hydrated, inFC, view]);

  // ── Loading splash ───────────────────────────────────────────
  if (!hydrated) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#06060f",
      }}>
        <div style={{ textAlign: "center" }}>
          <div className="animate-torii"><ToriiIcon size={64} glowing /></div>
          <div style={{
            fontFamily: "'Orbitron',monospace", color: "rgba(255,255,255,.35)",
            fontSize: 11, marginTop: 16, letterSpacing: ".22em",
          }}>
            LOADING…
          </div>
        </div>
      </div>
    );
  }

  if (view === "game") {
    return <GameView fcUser={fcUser} onBack={() => setView("home")} />;
  }

  if (view === "leaderboard") {
    return <LeaderboardView fcUser={fcUser} onBack={() => setView("home")} />;
  }

  // ── Home ─────────────────────────────────────────────────────
  return (
    <main style={{ minHeight: "100vh", background: "#06060f", overflow: "hidden", position: "relative" }}>

      {/* Grid background */}
      <div style={{
        position: "fixed", inset: 0, opacity: .09, pointerEvents: "none",
        backgroundImage:
          "linear-gradient(rgba(159,95,255,.6) 1px,transparent 1px)," +
          "linear-gradient(90deg,rgba(159,95,255,.6) 1px,transparent 1px)",
        backgroundSize: "48px 48px",
        animation: "grid-drift 5s linear infinite",
      }} />

      {/* Radial glow */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(159,95,255,.09) 0%, transparent 70%)",
      }} />

      {/* Scanline */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 2, pointerEvents: "none",
        background: "linear-gradient(90deg,transparent,rgba(159,95,255,.35),transparent)",
        animation: "scan 10s linear infinite",
      }} />

      {/* ── Nav ── */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 22px", height: 62,
        borderBottom: "1px solid rgba(159,95,255,.1)",
        background: "rgba(6,6,15,.9)", backdropFilter: "blur(18px)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <LogoMark size={32} />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {fcUser && <FarcasterProfile user={fcUser} compact />}
          <WalletButton />
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{
        maxWidth: 860, margin: "0 auto",
        padding: "clamp(44px,8vw,96px) 22px",
        textAlign: "center", position: "relative", zIndex: 1,
      }}>

        {/* Identity badge */}
        {fcUser ? (
          <div className="animate-fade-in" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(159,95,255,.09)", border: "1px solid rgba(159,95,255,.28)",
            borderRadius: 999, padding: "6px 18px", marginBottom: 28,
            fontFamily: "'Orbitron',monospace", fontSize: 11, color: "#b97fff",
          }}>
            <span style={{
              width: 7, height: 7, background: "#10b981", borderRadius: "50%",
              boxShadow: "0 0 6px #10b981", display: "inline-block",
            }} />
            Playing as @{fcUser.username}
          </div>
        ) : (
          <div className="animate-fade-in" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 999, padding: "6px 18px", marginBottom: 28,
            fontFamily: "'Orbitron',monospace", fontSize: 11, color: "rgba(255,255,255,.45)",
          }}>
            <span style={{
              width: 7, height: 7, background: "#f59e0b", borderRadius: "50%",
              display: "inline-block",
            }} />
            Browser mode · Open in Warpcast for full identity
          </div>
        )}

        {/* Torii logo */}
        <div className="animate-float" style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div className="animate-torii"><ToriiIcon size={86} glowing /></div>
        </div>

        {/* Title */}
        <h1 className="animate-glow animate-flicker" style={{
          fontFamily: "'Orbitron',monospace",
          fontSize: "clamp(68px,12vw,130px)",
          fontWeight: 900, letterSpacing: "-.02em", lineHeight: .88, marginBottom: 16,
        }}>
          SAISEN
        </h1>

        <p style={{
          fontFamily: "'Orbitron',monospace",
          fontSize: "clamp(12px,1.8vw,17px)",
          letterSpacing: ".25em", marginBottom: 14,
          color: "rgba(255,255,255,.5)",
        }}>
          COMPETE · PERFORM · DOMINATE
        </p>

        <p style={{
          color: "rgba(255,255,255,.36)", fontSize: 15, lineHeight: 1.75,
          maxWidth: 440, margin: "0 auto 44px", fontWeight: 500,
        }}>
          Skill-based 1v1 reaction duels. Your ELO lives on-chain.
          Your identity is your Farcaster account.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 13, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => setView("game")}>
            <Zap size={16} /> Play vs Bot
          </button>

          <button onClick={() => setView("leaderboard")}>
            <Trophy size={16} /> Leaderboard
          </button>
        </div>

        {/* ➕ ADDED MINI APP BUTTON */}
        {inFC && canInstall && (
          <div style={{ marginTop: 14 }}>
            <button
              onClick={() => sdk.actions.addMiniApp()}
              style={{
                fontSize: 11,
                fontFamily: "'Orbitron',monospace",
                letterSpacing: ".12em",
                color: "rgba(159,95,255,.6)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                opacity: 0.7,
                transition: "opacity .2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "0.7")}
            >
              + Add SAISEN to Farcaster
            </button>
          </div>
        )}

        {/* Stats strip */}
        <div style={{
          display: "flex", gap: 28, justifyContent: "center",
          flexWrap: "wrap", marginTop: 54,
        }}>
          {[
            ["30s",      "Match Length"],
            ["Season 1", "Live Now"],
            ["ELO",      "On-Chain"],
            ["100%",     "Skill Based"],
          ].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "'Orbitron',monospace",
                fontSize: 19, fontWeight: 900, color: "#b97fff",
              }}>{v}</div>
              <div style={{
                fontSize: 10, color: "rgba(255,255,255,.3)",
                letterSpacing: ".14em", textTransform: "uppercase", marginTop: 3,
              }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}