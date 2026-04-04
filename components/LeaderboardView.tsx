"use client";

import { useState, useEffect }   from "react";
import Image                      from "next/image";
import { ArrowLeft, RefreshCw }   from "lucide-react";
import { getRankTier }            from "@/lib/elo";
import type { FarcasterUser }     from "@/lib/farcaster";
import { LogoMark }               from "./icons";

// ─── Types ───────────────────────────────────────────────────
interface LBEntry {
  id:      string;
  display: string;
  pfpUrl?: string;
  elo:     number;
  wins:    number;
  losses:  number;
  score:   number;
  matches: number;
  source:  "farcaster" | "wallet" | "both";
}

interface Props {
  fcUser: FarcasterUser | null;
  onBack: () => void;
}

// ─── Spinner ─────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{
      width: 20, height: 20, flexShrink: 0,
      border: "2px solid rgba(159,95,255,.25)",
      borderTop: "2px solid #9f5fff",
      borderRadius: "50%", animation: "spin .6s linear infinite",
    }} />
  );
}

export default function LeaderboardView({ fcUser, onBack }: Props) {
  const [entries, setEntries] = useState<LBEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy,  setSortBy]  = useState<"elo" | "wins" | "score">("elo");

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/leaderboard");
      const d = await r.json();
      setEntries(d.entries ?? []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const sorted = [...entries].sort((a, b) => b[sortBy] - a[sortBy]);

  const myId = fcUser
    ? String(fcUser.fid)
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "#06060f", color: "#fff" }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 20px", borderBottom: "1px solid rgba(159,95,255,.09)",
        background: "rgba(6,6,15,.92)", backdropFilter: "blur(14px)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <button
          onClick={onBack}
          style={{
            background: "none", border: "none", color: "rgba(255,255,255,.4)",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            fontSize: 13, padding: "6px 10px", borderRadius: 8,
            fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, transition: "color .2s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.4)"; }}
        >
          <ArrowLeft size={14} /> Back
        </button>

        <LogoMark size={26} />

        <button
          onClick={load}
          style={{
            background: "none", border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 8, color: "rgba(255,255,255,.4)", cursor: "pointer",
            padding: "6px 12px", display: "flex", alignItems: "center", gap: 6,
            fontSize: 11, fontFamily: "'Orbitron',monospace", transition: "all .2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(159,95,255,.4)";
            (e.currentTarget as HTMLElement).style.color = "#b97fff";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.1)";
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.4)";
          }}
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 18px" }}>

        {/* ── Title ── */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            fontFamily: "'Orbitron',monospace", fontSize: 10, fontWeight: 700,
            color: "#9f5fff", letterSpacing: ".28em", marginBottom: 12,
          }}>
            SEASON 1
          </div>
          <h1 style={{
            fontFamily: "'Orbitron',monospace",
            fontSize: "clamp(24px,4vw,38px)", fontWeight: 900, marginBottom: 8,
          }}>
            Global Rankings
          </h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            <span style={{
              width: 7, height: 7, background: "#10b981", borderRadius: "50%",
              boxShadow: "0 0 5px #10b981", display: "inline-block",
              animation: "pulse-dot 1.5s ease-in-out infinite",
            }} />
            <p style={{
              color: "rgba(255,255,255,.35)", fontSize: 13,
              fontFamily: "'Rajdhani',sans-serif", fontWeight: 500,
            }}>
              Live · updates after every match
            </p>
          </div>
        </div>

        {/* ── My rank (if logged in via Farcaster) ── */}
        {fcUser && !loading && (() => {
          const me = sorted.find(e => e.id === String(fcUser.fid));
          const rank = me ? sorted.indexOf(me) + 1 : null;
          if (!me) return null;
          const tier = getRankTier(me.elo);
          return (
            <div style={{
              padding: "14px 18px", marginBottom: 22,
              background: "rgba(159,95,255,.08)", border: "1px solid rgba(159,95,255,.3)",
              borderRadius: 13, display: "flex", alignItems: "center",
              justifyContent: "space-between", flexWrap: "wrap", gap: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {fcUser.pfpUrl && (
                  <Image src={fcUser.pfpUrl} alt={fcUser.username} width={36} height={36}
                    style={{ borderRadius: "50%", objectFit: "cover" }} unoptimized />
                )}
                <div>
                  <div style={{
                    fontFamily: "'Orbitron',monospace", fontSize: 13,
                    fontWeight: 700, color: "#b97fff",
                  }}>
                    Your Rank: #{rank}
                  </div>
                  <div style={{
                    fontSize: 11, color: tier.color, fontFamily: "'Orbitron',monospace",
                    fontWeight: 700, marginTop: 2,
                  }}>
                    {tier.emoji} {tier.name} · {me.elo} ELO
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                {[["WINS", me.wins, "#4ade80"], ["SCORE", me.score, "#60a5fa"], ["MATCHES", me.matches, "rgba(255,255,255,.45)"]].map(([l, v, c]) => (
                  <div key={String(l)} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 900, color: String(c) }}>{v}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,.28)", letterSpacing: ".16em", marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── Sort tabs ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {(["elo","wins","score"] as const).map(k => (
            <button
              key={k}
              onClick={() => setSortBy(k)}
              style={{
                padding: "7px 14px", borderRadius: 8, cursor: "pointer",
                border: "1px solid", fontFamily: "'Orbitron',monospace",
                fontSize: 10, fontWeight: 700, letterSpacing: ".1em", transition: "all .2s",
                background:   sortBy === k ? "rgba(159,95,255,.18)" : "transparent",
                borderColor:  sortBy === k ? "rgba(159,95,255,.5)"  : "rgba(255,255,255,.1)",
                color:        sortBy === k ? "#b97fff"               : "rgba(255,255,255,.35)",
              }}
            >
              {k.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ── Column headers ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "40px 1fr 72px 55px 55px 62px",
          gap: 8, padding: "7px 16px", marginBottom: 6,
          fontSize: 9, color: "rgba(255,255,255,.2)",
          fontFamily: "'Orbitron',monospace", letterSpacing: ".15em",
        }}>
          <div>#</div>
          <div>PLAYER</div>
          <div style={{ textAlign: "right" }}>ELO</div>
          <div style={{ textAlign: "right" }}>WINS</div>
          <div style={{ textAlign: "right" }}>SCORE</div>
          <div style={{ textAlign: "right" }}>MATCHES</div>
        </div>

        {/* ── Rows ── */}
        {loading ? (
          <div style={{
            textAlign: "center", padding: "52px 0",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            color: "rgba(255,255,255,.3)", fontFamily: "'Rajdhani',sans-serif",
          }}>
            <Spinner /> Loading leaderboard…
          </div>

        ) : sorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "56px 18px" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🏆</div>
            <div style={{
              fontFamily: "'Orbitron',monospace", fontSize: 14,
              fontWeight: 700, color: "rgba(255,255,255,.5)", marginBottom: 8,
            }}>
              No entries yet
            </div>
            <div style={{
              color: "rgba(255,255,255,.3)", fontSize: 13,
              fontFamily: "'Rajdhani',sans-serif", fontWeight: 500,
            }}>
              Play a match to claim the #1 spot.
            </div>
          </div>

        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sorted.map((entry, i) => {
              const tier = getRankTier(entry.elo);
              const isMe = myId && entry.id === myId;

              return (
                <div
                  key={entry.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40px 1fr 72px 55px 55px 62px",
                    gap: 8, alignItems: "center",
                    padding: "12px 16px", borderRadius: 13,
                    background:   isMe ? "rgba(159,95,255,.08)" : "rgba(255,255,255,.02)",
                    border:       isMe
                      ? "1px solid rgba(159,95,255,.32)"
                      : i < 3
                      ? "1px solid rgba(159,95,255,.1)"
                      : "1px solid rgba(255,255,255,.05)",
                    transition: "all .2s",
                    animation: `fade-in .32s ease-out ${i * 0.04}s both`,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(159,95,255,.25)";
                    (e.currentTarget as HTMLElement).style.transform = "translateX(3px)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = isMe
                      ? "rgba(159,95,255,.32)"
                      : i < 3
                      ? "rgba(159,95,255,.1)"
                      : "rgba(255,255,255,.05)";
                    (e.currentTarget as HTMLElement).style.transform = "";
                  }}
                >
                  {/* Rank */}
                  <div style={{
                    fontFamily: "'Orbitron',monospace", fontWeight: 900,
                    fontSize: i < 3 ? 17 : 12,
                    color: i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : "rgba(255,255,255,.28)",
                  }}>
                    {i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                  </div>

                  {/* Player identity */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                    {entry.pfpUrl ? (
                      <Image
                        src={entry.pfpUrl} alt={entry.display}
                        width={32} height={32}
                        style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                        unoptimized
                      />
                    ) : (
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                        background: "linear-gradient(135deg,rgba(159,95,255,.3),rgba(59,130,246,.3))",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                      }}>⚡</div>
                    )}
                    <div style={{ overflow: "hidden" }}>
                      <div style={{
                        fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: 12,
                        color: isMe ? "#b97fff" : "#fff",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {isMe ? `${entry.display} (You)` : entry.display}
                      </div>
                      <div style={{
                        fontSize: 11, color: tier.color, fontFamily: "'Orbitron',monospace",
                        fontWeight: 600, marginTop: 2,
                      }}>
                        {tier.emoji} {tier.name}
                      </div>
                    </div>
                  </div>

                  {/* ELO */}
                  <div style={{
                    textAlign: "right", fontFamily: "'Orbitron',monospace",
                    fontWeight: 700, fontSize: 14, color: tier.color,
                  }}>{entry.elo}</div>

                  {/* Wins */}
                  <div style={{
                    textAlign: "right", fontFamily: "'Orbitron',monospace",
                    fontSize: 13, fontWeight: 700, color: "#4ade80",
                  }}>{entry.wins}</div>

                  {/* Score */}
                  <div style={{
                    textAlign: "right", fontFamily: "'Orbitron',monospace",
                    fontSize: 12, color: "rgba(255,255,255,.45)",
                  }}>{entry.score}</div>

                  {/* Matches */}
                  <div style={{
                    textAlign: "right", fontFamily: "'Orbitron',monospace",
                    fontSize: 12, color: "rgba(255,255,255,.3)",
                  }}>{entry.matches}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer note */}
        {!loading && sorted.length > 0 && (
          <p style={{
            textAlign: "center", marginTop: 28, fontSize: 11,
            color: "rgba(255,255,255,.18)", fontFamily: "'Rajdhani',sans-serif",
            fontWeight: 500,
          }}>
            Showing {sorted.length} player{sorted.length !== 1 ? "s" : ""} ·
            On-chain ELO available after wallet submission
          </p>
        )}
      </div>
    </div>
  );
}