"use client";

import { useState, useEffect } from "react";
import { useWallet }           from "@solana/wallet-adapter-react";
import { ArrowLeft, Bot, Plus, Zap, Play, Swords } from "lucide-react";
import { LogoMark }            from "./icons";
import WalletButton            from "./WalletButton";
import { getRankTier, RATING_LABEL } from "@/lib/elo";
import {
  AGENT_DAILY_LIMIT, getRemainingMatches,
  type Agent,
} from "@/lib/agentEngine";
import type { Difficulty }     from "@/lib/botEngine";

interface Props { onBack: () => void; }

type Panel = "list" | "create" | "profile";

function Spinner() {
  return (
    <div style={{
      width: 18, height: 18, flexShrink: 0,
      border: "2px solid rgba(159,95,255,.25)",
      borderTop: "2px solid #9f5fff",
      borderRadius: "50%", animation: "spin .6s linear infinite",
    }} />
  );
}

interface BattleLog { agentScore: number; opponentScore: number; win: boolean; opponentName: string; timestamp: number; }

export default function AgentView({ onBack }: Props) {
  const { publicKey } = useWallet();
  const address       = publicKey?.toBase58() ?? null;

  const [panel,      setPanel]   = useState<Panel>("list");
  const [agents,     setAgents]  = useState<Agent[]>([]);
  const [allAgents,  setAll]     = useState<Agent[]>([]);
  const [selected,   setSelected] = useState<Agent | null>(null);
  const [loading,    setLoading] = useState(false);
  const [battling,   setBattling] = useState<string | null>(null);
  const [log,        setLog]      = useState<BattleLog[]>([]);

  // Create form
  const [newName, setNewName] = useState("");
  const [newDiff, setNewDiff] = useState<Difficulty>("medium");
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState("");

  async function loadAgents() {
    setLoading(true);
    try {
      const [myRes, allRes] = await Promise.all([
        address ? fetch(`/api/agents?owner=${address}`) : Promise.resolve(null),
        fetch("/api/agents"),
      ]);
      if (myRes) {
        const d = await myRes.json();
        setAgents(d.agents ?? []);
      }
      const allD = await allRes.json();
      setAll(allD.agents ?? []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { loadAgents(); }, [address]);

  async function createAgent() {
    if (!address) return;
    if (!newName.trim()) { setCreateErr("Name required"); return; }
    setCreating(true); setCreateErr("");
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: address, name: newName.trim(), difficulty: newDiff }),
      });
      if (!res.ok) {
        const e = await res.json();
        setCreateErr(e.error ?? "Failed");
      } else {
        setNewName(""); setPanel("list");
        await loadAgents();
      }
    } catch { setCreateErr("Network error"); }
    setCreating(false);
  }

  async function battleAgent(agent: Agent, opponentId?: string) {
    setBattling(agent.id);
    try {
      const body: any = {};
      if (opponentId) body.opponentId = opponentId;
      else body.difficulty = agent.difficulty;

      const res = await fetch(`/api/agents/${agent.id}/battle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (res.ok) {
        setLog(prev => [{ ...d, timestamp: Date.now() }, ...prev.slice(0, 19)]);
        await loadAgents();
      }
    } catch {}
    setBattling(null);
  }

  const tier = (elo: number) => getRankTier(elo);

  // ── Create panel ──────────────────────────────────────────
  if (panel === "create") {
    return (
      <div style={{ minHeight: "100vh", background: "#06060f", color: "#fff" }}>
        <Header onBack={() => setPanel("list")} backLabel="← Agents" />
        <div style={{ maxWidth: 500, margin: "0 auto", padding: "44px 18px" }}>
          <h2 style={{
            fontFamily: "'Orbitron',monospace", fontSize: 22, fontWeight: 900, marginBottom: 6,
          }}>Create Agent</h2>
          <p style={{
            color: "rgba(255,255,255,.38)", fontSize: 14,
            fontFamily: "'Rajdhani',sans-serif", marginBottom: 32,
          }}>
            Your agent plays autonomously. Up to {AGENT_DAILY_LIMIT} matches per day.
          </p>

          <label style={labelStyle}>Agent Name</label>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="e.g. SIGMA-9"
            maxLength={32}
            style={inputStyle}
          />

          <label style={{ ...labelStyle, marginTop: 18 }}>Difficulty</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
            {(["easy","medium","hard"] as Difficulty[]).map(d => (
              <button
                key={d}
                onClick={() => setNewDiff(d)}
                style={{
                  flex: 1, padding: "12px 0", borderRadius: 10, cursor: "pointer",
                  border: `1px solid ${newDiff === d ? "rgba(159,95,255,.5)" : "rgba(255,255,255,.1)"}`,
                  background: newDiff === d ? "rgba(159,95,255,.12)" : "rgba(255,255,255,.025)",
                  fontFamily: "'Orbitron',monospace", fontSize: 11, fontWeight: 700,
                  color: newDiff === d ? "#b97fff" : "rgba(255,255,255,.45)",
                  transition: "all .2s",
                }}
              >
                {d.toUpperCase()}
              </button>
            ))}
          </div>

          {createErr && (
            <div style={{ color: "#f87171", fontSize: 13, marginBottom: 16, fontFamily: "'Rajdhani',sans-serif" }}>
              ⚠️ {createErr}
            </div>
          )}

          <button
            onClick={createAgent}
            disabled={creating || !address}
            style={{
              width: "100%", padding: "15px 0", borderRadius: 12, cursor: "pointer",
              background: "linear-gradient(135deg,#9f5fff,#6d28d9)",
              border: "none", fontFamily: "'Orbitron',monospace", fontWeight: 700,
              fontSize: 13, color: "#fff", boxShadow: "0 0 24px rgba(159,95,255,.4)",
              opacity: creating || !address ? .6 : 1,
            }}
          >
            {creating ? "Creating…" : "Deploy Agent"}
          </button>

          {!address && (
            <div style={{
              marginTop: 16, padding: "12px 16px",
              background: "rgba(251,191,36,.06)", border: "1px solid rgba(251,191,36,.15)",
              borderRadius: 10, fontSize: 13, color: "#fbbf24",
              fontFamily: "'Rajdhani',sans-serif",
            }}>
              Connect your Solana wallet to create an agent.
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Agent profile panel ───────────────────────────────────
  if (panel === "profile" && selected) {
    const ag      = allAgents.find(a => a.id === selected.id) ?? selected;
    const t       = tier(ag.elo);
    const rem     = getRemainingMatches(ag);
    const winRate = ag.totalMatches > 0
      ? Math.round((ag.wins / ag.totalMatches) * 100)
      : 0;
    const opponents = allAgents.filter(a => a.id !== ag.id);

    return (
      <div style={{ minHeight: "100vh", background: "#06060f", color: "#fff" }}>
        <Header onBack={() => setPanel("list")} backLabel="← Agents" />
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "36px 18px" }}>

          {/* Agent header */}
          <div style={{
            padding: "24px", borderRadius: 18,
            background: "rgba(159,95,255,.07)", border: "1px solid rgba(159,95,255,.22)",
            marginBottom: 22, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap",
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 18, flexShrink: 0,
              background: "linear-gradient(135deg,rgba(159,95,255,.25),rgba(59,130,246,.25))",
              border: "2px solid rgba(159,95,255,.35)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
            }}>🤖</div>
            <div>
              <div style={{
                fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 900, marginBottom: 4,
              }}>
                {ag.name}
              </div>
              <div style={{
                fontFamily: "'Orbitron',monospace", fontSize: 12, color: t.color, fontWeight: 700,
              }}>
                {t.emoji} {t.name} · {ag.elo} {RATING_LABEL}
              </div>
              <div style={{
                fontSize: 12, color: "rgba(255,255,255,.35)", marginTop: 4,
                fontFamily: "'Rajdhani',sans-serif",
              }}>
                Difficulty: {ag.difficulty.toUpperCase()} ·
                Owner: {ag.owner.slice(0, 6)}…{ag.owner.slice(-4)}
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 22,
          }}>
            {([
              ["WINS",     ag.wins,         "#4ade80"],
              ["LOSSES",   ag.losses,       "#f87171"],
              ["WIN RATE", `${winRate}%`,   "#b97fff"],
              ["BEST",     ag.bestScore,    "#fbbf24"],
              ["MATCHES",  ag.totalMatches, "#60a5fa"],
              ["TODAY",    `${rem} left`,   "rgba(255,255,255,.45)"],
            ] as [string, string | number, string][]).map(([l, v, c]) => (
              <div key={l} style={{
                padding: "16px 14px", borderRadius: 12,
                background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)",
                textAlign: "center",
              }}>
                <div style={{
                  fontFamily: "'Orbitron',monospace", fontSize: 22, fontWeight: 900, color: c,
                }}>{v}</div>
                <div style={{
                  fontSize: 9, color: "rgba(255,255,255,.3)", letterSpacing: ".14em",
                  textTransform: "uppercase", marginTop: 4,
                }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Battle controls */}
          {address?.toLowerCase() === ag.owner.toLowerCase() && (
            <div style={{ marginBottom: 22 }}>
              <div style={{
                fontFamily: "'Orbitron',monospace", fontSize: 11,
                color: "rgba(255,255,255,.3)", letterSpacing: ".15em", marginBottom: 10,
              }}>
                QUICK BATTLE
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() => battleAgent(ag)}
                  disabled={battling === ag.id || rem === 0}
                  style={battleBtnStyle(battling === ag.id || rem === 0)}
                >
                  <Play size={13} />
                  {battling === ag.id ? "Battling…" : "vs Bot"}
                </button>

                {opponents.slice(0, 4).map(opp => (
                  <button
                    key={opp.id}
                    onClick={() => battleAgent(ag, opp.id)}
                    disabled={battling !== null || rem === 0}
                    style={battleBtnStyle(battling !== null || rem === 0)}
                  >
                    <Swords size={13} />
                    vs {opp.name}
                  </button>
                ))}
              </div>
              {rem === 0 && (
                <div style={{
                  marginTop: 10, fontSize: 12, color: "#f87171",
                  fontFamily: "'Rajdhani',sans-serif",
                }}>
                  Daily limit reached. Resets tomorrow.
                </div>
              )}
            </div>
          )}

          {/* Battle log */}
          {log.length > 0 && (
            <div>
              <div style={{
                fontFamily: "'Orbitron',monospace", fontSize: 11,
                color: "rgba(255,255,255,.3)", letterSpacing: ".15em", marginBottom: 10,
              }}>
                RECENT BATTLES
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {log.slice(0, 8).map((entry, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", borderRadius: 10,
                    background: entry.win ? "rgba(74,222,128,.04)" : "rgba(248,113,113,.04)",
                    border: `1px solid ${entry.win ? "rgba(74,222,128,.15)" : "rgba(248,113,113,.15)"}`,
                  }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 16 }}>{entry.win ? "🏆" : "💀"}</span>
                      <div>
                        <div style={{
                          fontFamily: "'Orbitron',monospace", fontSize: 11, fontWeight: 700,
                          color: entry.win ? "#4ade80" : "#f87171",
                        }}>
                          {entry.win ? "WIN" : "LOSS"} vs {entry.opponentName}
                        </div>
                        <div style={{
                          fontSize: 11, color: "rgba(255,255,255,.3)",
                          fontFamily: "'Rajdhani',sans-serif",
                        }}>
                          {entry.agentScore} — {entry.opponentScore}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      fontSize: 10, color: "rgba(255,255,255,.2)",
                      fontFamily: "'Orbitron',monospace",
                    }}>
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Agent list panel ──────────────────────────────────────
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
        <WalletButton />
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 18px" }}>

        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          flexWrap: "wrap", gap: 14, marginBottom: 32,
        }}>
          <div>
            <div style={{
              fontFamily: "'Orbitron',monospace", fontSize: 10, fontWeight: 700,
              color: "#9f5fff", letterSpacing: ".28em", marginBottom: 8,
            }}>
              AGENT SYSTEM
            </div>
            <h1 style={{
              fontFamily: "'Orbitron',monospace",
              fontSize: "clamp(22px,4vw,34px)", fontWeight: 900, marginBottom: 6,
            }}>
              Your Agents
            </h1>
            <p style={{
              color: "rgba(255,255,255,.35)", fontSize: 13,
              fontFamily: "'Rajdhani',sans-serif",
            }}>
              Deploy agents that compete automatically. Human vs Agent · Agent vs Agent.
            </p>
          </div>

          {address && (
            <button
              onClick={() => setPanel("create")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "linear-gradient(135deg,#9f5fff,#6d28d9)",
                border: "none", borderRadius: 10, padding: "12px 20px",
                fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: 11,
                letterSpacing: ".08em", color: "#fff", cursor: "pointer",
                boxShadow: "0 0 20px rgba(159,95,255,.35)",
              }}
            >
              <Plus size={13} /> New Agent
            </button>
          )}
        </div>

        {/* My agents */}
        {address && agents.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{
              fontFamily: "'Orbitron',monospace", fontSize: 10,
              color: "rgba(255,255,255,.3)", letterSpacing: ".15em", marginBottom: 12,
            }}>
              MY AGENTS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {agents.map(ag => <AgentCard key={ag.id} agent={ag} onSelect={() => { setSelected(ag); setPanel("profile"); }} onBattle={() => battleAgent(ag)} battling={battling === ag.id} />)}
            </div>
          </div>
        )}

        {/* All agents */}
        <div>
          <div style={{
            fontFamily: "'Orbitron',monospace", fontSize: 10,
            color: "rgba(255,255,255,.3)", letterSpacing: ".15em", marginBottom: 12,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            ALL AGENTS
            {loading && <Spinner />}
          </div>

          {allAgents.length === 0 && !loading ? (
            <div style={{
              textAlign: "center", padding: "48px 0",
              color: "rgba(255,255,255,.25)", fontFamily: "'Rajdhani',sans-serif",
            }}>
              <Bot size={48} style={{ margin: "0 auto 16px", display: "block", opacity: .3 }} />
              No agents deployed yet. Be the first.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {allAgents.map(ag => (
                <AgentCard
                  key={ag.id}
                  agent={ag}
                  onSelect={() => { setSelected(ag); setPanel("profile"); }}
                  onBattle={
                    address && agents.length > 0
                      ? () => battleAgent(agents[0], ag.id)
                      : undefined
                  }
                  battling={battling === ag.id}
                />
              ))}
            </div>
          )}
        </div>

        {!address && (
          <div style={{
            marginTop: 28, padding: "18px 20px",
            background: "rgba(159,95,255,.06)", border: "1px solid rgba(159,95,255,.18)",
            borderRadius: 14, textAlign: "center",
          }}>
            <div style={{
              fontSize: 14, color: "rgba(255,255,255,.5)",
              fontFamily: "'Rajdhani',sans-serif", marginBottom: 14,
            }}>
              Connect wallet to create and manage your agents.
            </div>
            <WalletButton />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────

function Header({ onBack, backLabel }: { onBack: () => void; backLabel: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 20px", borderBottom: "1px solid rgba(159,95,255,.09)",
      background: "rgba(6,6,15,.92)", backdropFilter: "blur(14px)",
    }}>
      <button
        onClick={onBack}
        style={{
          background: "none", border: "none", color: "rgba(255,255,255,.4)",
          cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          fontSize: 13, padding: "6px 10px", borderRadius: 8,
          fontFamily: "'Rajdhani',sans-serif", fontWeight: 600,
        }}
      >
        <ArrowLeft size={14} /> {backLabel}
      </button>
      <LogoMark size={26} />
      <WalletButton />
    </div>
  );
}

function AgentCard({
  agent, onSelect, onBattle, battling,
}: {
  agent: Agent;
  onSelect: () => void;
  onBattle?: () => void;
  battling: boolean;
}) {
  const t    = getRankTier(agent.elo);
  const rem  = getRemainingMatches(agent);
  const wr   = agent.totalMatches > 0
    ? Math.round((agent.wins / agent.totalMatches) * 100)
    : 0;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "auto 1fr auto",
      gap: 14, alignItems: "center",
      padding: "14px 18px", borderRadius: 14,
      background: "rgba(255,255,255,.025)",
      border: "1px solid rgba(255,255,255,.07)",
      transition: "all .2s", cursor: "pointer",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(159,95,255,.25)";
        (e.currentTarget as HTMLElement).style.background = "rgba(159,95,255,.05)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.07)";
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.025)";
      }}
      onClick={onSelect}
    >
      {/* Avatar */}
      <div style={{
        width: 46, height: 46, borderRadius: 13, flexShrink: 0,
        background: "linear-gradient(135deg,rgba(159,95,255,.2),rgba(59,130,246,.2))",
        border: "1px solid rgba(159,95,255,.25)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
      }}>🤖</div>

      {/* Info */}
      <div>
        <div style={{
          fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, marginBottom: 3,
        }}>
          {agent.name}
          <span style={{
            marginLeft: 8, fontSize: 9, padding: "2px 7px",
            background: "rgba(159,95,255,.15)", border: "1px solid rgba(159,95,255,.25)",
            borderRadius: 999, color: "#b97fff", fontWeight: 700, letterSpacing: ".08em",
          }}>
            {agent.difficulty.toUpperCase()}
          </span>
        </div>
        <div style={{
          fontSize: 11, color: t.color, fontFamily: "'Orbitron',monospace",
          fontWeight: 600, marginBottom: 3,
        }}>
          {t.emoji} {t.name} · {agent.elo} {RATING_LABEL}
        </div>
        <div style={{
          fontSize: 11, color: "rgba(255,255,255,.3)",
          fontFamily: "'Rajdhani',sans-serif",
        }}>
          W{agent.wins} / L{agent.losses} · {wr}% WR · {rem}/{AGENT_DAILY_LIMIT} today
        </div>
      </div>

      {/* Action */}
      {onBattle && (
        <button
          onClick={e => { e.stopPropagation(); onBattle(); }}
          disabled={battling || rem === 0}
          style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: "rgba(159,95,255,.12)", border: "1px solid rgba(159,95,255,.3)",
            borderRadius: 8, padding: "8px 14px", cursor: "pointer",
            fontFamily: "'Orbitron',monospace", fontSize: 10, fontWeight: 700,
            color: "#b97fff", transition: "all .2s",
            opacity: battling || rem === 0 ? .4 : 1,
          }}
        >
          <Swords size={12} />
          {battling ? "…" : "Battle"}
        </button>
      )}
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, letterSpacing: ".14em",
  color: "rgba(255,255,255,.35)", fontFamily: "'Orbitron',monospace",
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 10, padding: "13px 16px",
  fontFamily: "'Orbitron',monospace", fontSize: 14, color: "#fff",
  outline: "none",
};

function battleBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: disabled ? "rgba(255,255,255,.03)" : "rgba(159,95,255,.12)",
    border: `1px solid ${disabled ? "rgba(255,255,255,.08)" : "rgba(159,95,255,.3)"}`,
    borderRadius: 8, padding: "9px 14px", cursor: disabled ? "default" : "pointer",
    fontFamily: "'Orbitron',monospace", fontSize: 11, fontWeight: 700,
    color: disabled ? "rgba(255,255,255,.25)" : "#b97fff",
    opacity: disabled ? .5 : 1, transition: "all .2s",
  };
}
