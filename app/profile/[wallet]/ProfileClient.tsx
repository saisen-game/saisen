"use client";

import { useEffect, useState } from "react";
import { useRouter }           from "next/navigation";
import { ArrowLeft, Bot, Trophy, Zap, Shield } from "lucide-react";
import { LogoMark }            from "@/components/icons";
import WalletButton            from "@/components/WalletButton";

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
  source:    string;
  updatedAt: number;
}

interface MatchEntry {
  id:        string;
  playerA:   string;
  playerB:   string;
  scoreA:    number;
  scoreB:    number;
  winner:    "A" | "B";
  mode:      string;
  timestamp: number;
}

interface AgentEntry {
  id:           string;
  name:         string;
  difficulty:   string;
  elo:          number;
  wins:         number;
  losses:       number;
  totalMatches: number;
  bestScore:    number;
}

export default function ProfileClient({ wallet }: { wallet: string }) {
  const router = useRouter();
  const short  = `${wallet.slice(0, 6)}…${wallet.slice(-4)}`;

  const [entry,   setEntry]   = useState<LBEntry | null>(null);
  const [matches, setMatches] = useState<MatchEntry[]>([]);
  const [agent,   setAgent]   = useState<AgentEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Load leaderboard entry for this wallet
        const [lbRes, matchRes, agentRes] = await Promise.all([
          fetch("/api/leaderboard"),
          fetch("/api/matches?limit=50"),
          fetch(`/api/agents?owner=${wallet}`),
        ]);

        if (lbRes.ok) {
          const lbData = await lbRes.json();
          const found  = (lbData.entries ?? []).find(
            (e: LBEntry) => e.id.toLowerCase() === wallet.toLowerCase()
          );
          setEntry(found ?? null);
        }

        if (matchRes.ok) {
          const mData = await matchRes.json();
          // Filter matches involving this wallet's display name
          const display = entry?.display ?? short;
          const relevant = (mData.matches ?? []).filter(
            (m: MatchEntry) =>
              m.playerA.toLowerCase().includes(wallet.slice(0, 6).toLowerCase()) ||
              m.playerB.toLowerCase().includes(wallet.slice(0, 6).toLowerCase())
          );
          setMatches(relevant.slice(0, 20));
        }

        if (agentRes.ok) {
          const aData = await agentRes.json();
          setAgent((aData.agents ?? [])[0] ?? null);
        }
      } catch {}
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);

  const winRate = entry && entry.matches > 0
    ? ((entry.wins / entry.matches) * 100).toFixed(1)
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "#06060f", color: "#fff" }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 20px", borderBottom: "1px solid rgba(159,95,255,.09)",
        background: "rgba(6,6,15,.92)", backdropFilter: "blur(14px)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <button
          onClick={() => router.back()}
          style={{
            background: "none", border: "none", color: "rgba(255,255,255,.4)",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            fontSize: 13, padding: "6px 10px", borderRadius: 8,
            fontFamily: "'Rajdhani',sans-serif", fontWeight: 600,
          }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <LogoMark size={26} />
        <WalletButton />
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "36px 18px" }}>

        {loading ? (
          <div style={{
            textAlign: "center", padding: "60px 0",
            fontFamily: "'Orbitron',monospace", color: "rgba(255,255,255,.3)",
            fontSize: 12, letterSpacing: ".2em",
          }}>
            LOADING…
          </div>
        ) : (
          <>
            {/* Profile header */}
            <div style={{
              padding: "24px", borderRadius: 16, marginBottom: 24,
              background: "rgba(159,95,255,.06)", border: "1px solid rgba(159,95,255,.2)",
              display: "flex", alignItems: "center", gap: 20,
              flexWrap: "wrap",
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: "linear-gradient(135deg,#9f5fff,#6d28d9)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, flexShrink: 0,
              }}>
                👤
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'Orbitron',monospace", fontSize: 18,
                  fontWeight: 900, color: "#fff", marginBottom: 4,
                }}>
                  {entry?.display ?? short}
                </div>
                <div style={{
                  fontFamily: "monospace", fontSize: 12,
                  color: "rgba(255,255,255,.35)", wordBreak: "break-all",
                }}>
                  {wallet}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{
                  fontFamily: "'Orbitron',monospace", fontSize: 28,
                  fontWeight: 900, color: "#b97fff",
                }}>
                  {entry?.elo ?? 1000}
                </div>
                <div style={{
                  fontFamily: "'Orbitron',monospace", fontSize: 9,
                  color: "rgba(255,255,255,.3)", letterSpacing: ".18em",
                }}>
                  $SAI RATING
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 12, marginBottom: 28,
            }}>
              {[
                { icon: <Trophy size={18} />, label: "Wins",    value: entry?.wins    ?? 0, color: "#4ade80" },
                { icon: <Shield size={18} />, label: "Losses",  value: entry?.losses  ?? 0, color: "#f87171" },
                { icon: <Zap size={18} />,    label: "Matches", value: entry?.matches ?? 0, color: "#b97fff" },
                { icon: <Trophy size={18} />, label: "Best",    value: entry?.bestScore ?? 0, color: "#f59e0b" },
                ...(winRate ? [{ icon: <Trophy size={18} />, label: "Win Rate", value: `${winRate}%`, color: "#60a5fa" }] : []),
              ].map(({ icon, label, value, color }) => (
                <div key={label} style={{
                  padding: "16px", borderRadius: 12,
                  background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.07)",
                  textAlign: "center",
                }}>
                  <div style={{ color: "rgba(255,255,255,.3)", marginBottom: 6, display: "flex", justifyContent: "center" }}>{icon}</div>
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 22, fontWeight: 900, color }}>
                    {value}
                  </div>
                  <div style={{
                    fontFamily: "'Orbitron',monospace", fontSize: 9,
                    color: "rgba(255,255,255,.3)", letterSpacing: ".15em", marginTop: 4,
                  }}>
                    {label.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>

            {/* Agent */}
            {agent && (
              <div style={{ marginBottom: 28 }}>
                <div style={{
                  fontFamily: "'Orbitron',monospace", fontSize: 10,
                  color: "#9f5fff", letterSpacing: ".22em", marginBottom: 12,
                }}>
                  AGENT
                </div>
                <div style={{
                  padding: "18px", borderRadius: 14,
                  background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)",
                  display: "flex", alignItems: "center", gap: 16,
                }}>
                  <Bot size={32} style={{ color: "#b97fff", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                      {agent.name}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", fontFamily: "'Rajdhani',sans-serif" }}>
                      {agent.difficulty} · {agent.totalMatches} matches · {agent.wins}W {agent.losses}L
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 900, color: "#b97fff" }}>
                      {agent.elo}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", fontFamily: "'Orbitron',monospace", letterSpacing: ".1em" }}>
                      ELO
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Match history */}
            <div>
              <div style={{
                fontFamily: "'Orbitron',monospace", fontSize: 10,
                color: "#9f5fff", letterSpacing: ".22em", marginBottom: 12,
              }}>
                RECENT MATCHES
              </div>
              {matches.length === 0 ? (
                <div style={{
                  padding: "30px", textAlign: "center",
                  color: "rgba(255,255,255,.25)", fontFamily: "'Rajdhani',sans-serif", fontSize: 14,
                  background: "rgba(255,255,255,.02)", borderRadius: 12,
                  border: "1px solid rgba(255,255,255,.06)",
                }}>
                  No matches recorded yet
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {matches.map(m => (
                    <div key={m.id} style={{
                      padding: "14px 18px", borderRadius: 12,
                      background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      flexWrap: "wrap", gap: 10,
                    }}>
                      <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 13 }}>
                        <span style={{ color: "#b97fff" }}>{m.playerA}</span>
                        <span style={{ color: "rgba(255,255,255,.3)", margin: "0 8px" }}>vs</span>
                        <span style={{ color: "rgba(255,255,255,.6)" }}>{m.playerB}</span>
                      </div>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <span style={{
                          fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700,
                          color: m.winner === "A" ? "#4ade80" : "#f87171",
                        }}>
                          {m.scoreA} – {m.scoreB}
                        </span>
                        <span style={{
                          fontSize: 10, padding: "2px 8px", borderRadius: 999,
                          background: "rgba(159,95,255,.1)", color: "#b97fff",
                          fontFamily: "'Orbitron',monospace",
                        }}>
                          {m.mode.replace(/_/g, " ")}
                        </span>
                        <span style={{
                          fontSize: 11, color: "rgba(255,255,255,.25)",
                          fontFamily: "'Rajdhani',sans-serif",
                        }}>
                          {new Date(m.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
