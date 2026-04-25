"use client";

import { useEffect, useState } from "react";
import { Zap, Trophy, Bot, ShoppingBag, Copy, Check } from "lucide-react";
import { initFarcaster, type FarcasterUser } from "@/lib/farcaster";
import GameView          from "@/components/GameView";
import LeaderboardView   from "@/components/LeaderboardView";
import AgentView         from "@/components/AgentView";
import MarketplaceView   from "@/components/MarketplaceView";
import FarcasterProfile  from "@/components/FarcasterProfile";
import WalletButton      from "@/components/WalletButton";
import { ToriiIcon, LogoMark } from "@/components/icons";
import { SAI_CONTRACT }  from "@/lib/skills";

type View = "home" | "game" | "leaderboard" | "agents" | "marketplace";

export default function Home() {
  const [fcUser,   setFcUser]   = useState<FarcasterUser | null>(null);
  const [inFC,     setInFC]     = useState(false);
  const [view,     setView]     = useState<View>("home");
  const [hydrated, setHydrated] = useState(false);
  const [cacopied, setCaCopied] = useState(false);

  useEffect(() => {
    initFarcaster().then((ctx) => {
      setFcUser(ctx.user);
      setInFC(ctx.isInFarcaster);
      setHydrated(true);
    });
  }, []);

  const copyCA = async () => {
    try {
      await navigator.clipboard.writeText(SAI_CONTRACT);
      setCaCopied(true);
      setTimeout(() => setCaCopied(false), 2000);
    } catch {}
  };

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

  if (view === "game")        return <GameView        fcUser={fcUser} onBack={() => setView("home")} />;
  if (view === "leaderboard") return <LeaderboardView fcUser={fcUser} onBack={() => setView("home")} />;
  if (view === "agents")      return <AgentView       onBack={() => setView("home")} />;
  if (view === "marketplace") return <MarketplaceView onBack={() => setView("home")} />;

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
        padding: "clamp(36px,7vw,80px) 22px 0",
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
            Browser mode · Connect wallet or open in Warpcast
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
          maxWidth: 440, margin: "0 auto 36px", fontWeight: 500,
        }}>
          Skill-based 1v1 reaction duels. Your $SAI rating lives on-chain.
          Powered by Solana.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 13, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
          <button
            onClick={() => setView("game")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 9,
              background: "linear-gradient(135deg,#9f5fff,#6d28d9)",
              border: "none", borderRadius: 12, padding: "16px 40px",
              fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: 14,
              letterSpacing: ".08em", color: "#fff", cursor: "pointer",
              boxShadow: "0 0 28px rgba(159,95,255,.5)", transition: "filter .15s,transform .15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.filter = "brightness(1.15)";
              (e.currentTarget as HTMLElement).style.transform = "scale(1.04)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.filter = "";
              (e.currentTarget as HTMLElement).style.transform = "";
            }}>
            <Zap size={16} /> Play vs Bot
          </button>

          <button
            onClick={() => setView("leaderboard")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 9,
              background: "transparent", border: "1px solid rgba(159,95,255,.38)",
              borderRadius: 12, padding: "16px 34px",
              fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: 14,
              letterSpacing: ".08em", color: "#b97fff", cursor: "pointer",
              transition: "all .15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(159,95,255,.08)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
            <Trophy size={16} /> Leaderboard
          </button>
        </div>

        {/* Secondary nav */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
          <button
            onClick={() => setView("agents")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 10, padding: "11px 22px", cursor: "pointer",
              fontFamily: "'Orbitron',monospace", fontSize: 11, fontWeight: 700,
              color: "rgba(255,255,255,.5)", transition: "all .15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(159,95,255,.3)";
              (e.currentTarget as HTMLElement).style.color = "#b97fff";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.1)";
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.5)";
            }}>
            <Bot size={14} /> Agents
          </button>

          <button
            onClick={() => setView("marketplace")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 10, padding: "11px 22px", cursor: "pointer",
              fontFamily: "'Orbitron',monospace", fontSize: 11, fontWeight: 700,
              color: "rgba(255,255,255,.5)", transition: "all .15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(159,95,255,.3)";
              (e.currentTarget as HTMLElement).style.color = "#b97fff";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.1)";
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.5)";
            }}>
            <ShoppingBag size={14} /> Marketplace
          </button>
        </div>

        {/* Stats strip */}
        <div style={{
          display: "flex", gap: 28, justifyContent: "center",
          flexWrap: "wrap", marginBottom: 40,
        }}>
          {[
            ["30s",      "Match Length"],
            ["Season 1", "Live Now"],
            ["$SAI",     "On Solana"],
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

        {/* $SAI Token CA */}
        <div style={{
          padding: "14px 20px",
          background: "rgba(159,95,255,.05)", border: "1px solid rgba(159,95,255,.15)",
          borderRadius: 14, marginBottom: 48,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexWrap: "wrap", gap: 14,
        }}>
          <div style={{ textAlign: "left" }}>
            <div style={{
              fontFamily: "'Orbitron',monospace", fontSize: 9,
              color: "#9f5fff", letterSpacing: ".2em", marginBottom: 5,
            }}>
              $SAI TOKEN CONTRACT (SOLANA)
            </div>
            <code style={{
              fontFamily: "monospace", fontSize: 12,
              color: "rgba(255,255,255,.6)", wordBreak: "break-all",
            }}>
              {SAI_CONTRACT}
            </code>
          </div>
          <button
            onClick={copyCA}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: cacopied ? "rgba(74,222,128,.1)" : "rgba(255,255,255,.06)",
              border: `1px solid ${cacopied ? "rgba(74,222,128,.3)" : "rgba(255,255,255,.12)"}`,
              borderRadius: 8, padding: "9px 16px", cursor: "pointer",
              fontFamily: "'Orbitron',monospace", fontSize: 10, fontWeight: 700,
              color: cacopied ? "#4ade80" : "rgba(255,255,255,.5)",
              transition: "all .2s", flexShrink: 0,
            }}
          >
            {cacopied ? <Check size={13} /> : <Copy size={13} />}
            {cacopied ? "Copied!" : "Copy CA"}
          </button>
        </div>
      </div>
    </main>
  );
}
