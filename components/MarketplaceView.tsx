"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet }    from "@solana/wallet-adapter-react";
import { ArrowLeft, Copy, Check, ShoppingBag, Sparkles } from "lucide-react";
import { LogoMark }     from "./icons";
import WalletButton     from "./WalletButton";
import {
  SKILLS, RARITY_COLORS, SAI_CONTRACT,
  SAI_HOLDER_THRESHOLD, type Skill,
} from "@/lib/skills";

interface Props { onBack: () => void; }

function Spinner() {
  return (
    <div style={{
      width: 16, height: 16,
      border: "2px solid rgba(255,255,255,.15)", borderTop: "2px solid #fff",
      borderRadius: "50%", animation: "spin .6s linear infinite",
    }} />
  );
}

export default function MarketplaceView({ onBack }: Props) {
  const { publicKey } = useWallet();
  const address       = publicKey?.toBase58() ?? null;

  const [owned,        setOwned]       = useState<string[]>([]);
  const [claiming,     setClaiming]    = useState<string | null>(null);
  const [claimMsg,     setClaimMsg]    = useState<Record<string, string>>({});
  const [freeClaimed,  setFreeClaimed] = useState(false);
  const [cacopied,     setCaCopied]    = useState(false);
  const [loadingOwned, setLoadingOwned] = useState(false);

  const loadOwned = useCallback(async () => {
    if (!address) return;
    setLoadingOwned(true);
    try {
      const r = await fetch(`/api/skills?address=${address}`);
      const d = await r.json();
      setOwned(d.owned ?? []);
    } catch {}
    setLoadingOwned(false);
  }, [address]);

  useEffect(() => { loadOwned(); }, [loadOwned]);

  const copyCA = async () => {
    try {
      await navigator.clipboard.writeText(SAI_CONTRACT);
      setCaCopied(true);
      setTimeout(() => setCaCopied(false), 2000);
    } catch {}
  };

  async function claimSkill(skill: Skill, free = false) {
    if (!address) return;
    setClaiming(skill.id);
    setClaimMsg(prev => ({ ...prev, [skill.id]: "" }));
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          skillId: skill.id,
          claimFree: free,
        }),
      });
      const d = await res.json();
      if (res.ok) {
        setOwned(d.owned ?? []);
        if (free) setFreeClaimed(true);
        setClaimMsg(prev => ({ ...prev, [skill.id]: "✅ Claimed!" }));
      } else {
        setClaimMsg(prev => ({ ...prev, [skill.id]: `❌ ${d.error ?? "Failed"}` }));
      }
    } catch {
      setClaimMsg(prev => ({ ...prev, [skill.id]: "❌ Network error" }));
    }
    setClaiming(null);
  }

  const canGetFree = address && !freeClaimed && owned.length === 0;

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

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            fontFamily: "'Orbitron',monospace", fontSize: 10, fontWeight: 700,
            color: "#9f5fff", letterSpacing: ".28em", marginBottom: 10,
          }}>
            SKILL MARKET
          </div>
          <h1 style={{
            fontFamily: "'Orbitron',monospace",
            fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, marginBottom: 10,
          }}>
            Marketplace
          </h1>
          <p style={{
            color: "rgba(255,255,255,.38)", fontSize: 14, lineHeight: 1.7,
            fontFamily: "'Rajdhani',sans-serif", maxWidth: 440, margin: "0 auto",
          }}>
            Unlock skills to gain edge in matches. Hold {SAI_HOLDER_THRESHOLD.toLocaleString()} $SAI for free access.
          </p>
        </div>

        {/* $SAI Contract Address */}
        <div style={{
          padding: "16px 20px", borderRadius: 14, marginBottom: 28,
          background: "rgba(159,95,255,.06)", border: "1px solid rgba(159,95,255,.2)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <div style={{
              fontFamily: "'Orbitron',monospace", fontSize: 10,
              color: "#9f5fff", letterSpacing: ".18em", marginBottom: 6,
            }}>
              $SAI TOKEN CONTRACT
            </div>
            <div style={{
              fontFamily: "monospace", fontSize: 13, color: "rgba(255,255,255,.75)",
              letterSpacing: ".04em", wordBreak: "break-all",
            }}>
              {SAI_CONTRACT}
            </div>
          </div>
          <button
            onClick={copyCA}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: cacopied ? "rgba(74,222,128,.12)" : "rgba(255,255,255,.07)",
              border: `1px solid ${cacopied ? "rgba(74,222,128,.3)" : "rgba(255,255,255,.12)"}`,
              borderRadius: 8, padding: "9px 16px", cursor: "pointer",
              fontFamily: "'Orbitron',monospace", fontSize: 10, fontWeight: 700,
              color: cacopied ? "#4ade80" : "rgba(255,255,255,.6)",
              transition: "all .2s", flexShrink: 0,
            }}
          >
            {cacopied ? <Check size={13} /> : <Copy size={13} />}
            {cacopied ? "Copied!" : "Copy CA"}
          </button>
        </div>

        {/* Free starter banner */}
        {canGetFree && (
          <div style={{
            padding: "16px 20px", borderRadius: 14, marginBottom: 28,
            background: "linear-gradient(135deg,rgba(159,95,255,.12),rgba(59,130,246,.12))",
            border: "1px solid rgba(159,95,255,.3)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 14,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 28 }}>🎁</span>
              <div>
                <div style={{
                  fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700,
                  color: "#b97fff", marginBottom: 3,
                }}>
                  Free Starter Skill
                </div>
                <div style={{
                  fontSize: 13, color: "rgba(255,255,255,.45)",
                  fontFamily: "'Rajdhani',sans-serif",
                }}>
                  New players get one free skill. Claim it now!
                </div>
              </div>
            </div>
            <button
              onClick={() => claimSkill(SKILLS[0], true)}
              disabled={claiming !== null || !address}
              style={{
                background: "linear-gradient(135deg,#9f5fff,#6d28d9)",
                border: "none", borderRadius: 10, padding: "11px 22px",
                fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: 11,
                color: "#fff", cursor: "pointer",
                boxShadow: "0 0 18px rgba(159,95,255,.4)",
              }}
            >
              <Sparkles size={13} style={{ display: "inline", marginRight: 6 }} />
              Claim Free
            </button>
          </div>
        )}

        {/* Unlock conditions info */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 10, marginBottom: 28,
        }}>
          {[
            { icon: "💎", label: `Hold ≥ ${(SAI_HOLDER_THRESHOLD / 1_000_000).toFixed(0)}M $SAI`, sub: "Free access to all skills" },
            { icon: "◎",  label: "Pay with SOL",  sub: "Unlock individual skills" },
            { icon: "💵", label: "Pay with USDC", sub: "Unlock individual skills" },
            { icon: "⚡", label: "Pay with $SAI", sub: "Burn tokens to unlock" },
          ].map(({ icon, label, sub }) => (
            <div key={label} style={{
              padding: "14px 16px", borderRadius: 12,
              background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.07)",
              display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
              <div>
                <div style={{
                  fontFamily: "'Orbitron',monospace", fontSize: 11, fontWeight: 700,
                  color: "#fff", marginBottom: 3,
                }}>{label}</div>
                <div style={{
                  fontSize: 11, color: "rgba(255,255,255,.35)",
                  fontFamily: "'Rajdhani',sans-serif",
                }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Skills grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 14,
        }}>
          {SKILLS.map(skill => {
            const isOwned    = owned.includes(skill.id);
            const isClaiming = claiming === skill.id;
            const msg        = claimMsg[skill.id] ?? "";
            const rarityCol  = RARITY_COLORS[skill.rarity];

            return (
              <div
                key={skill.id}
                style={{
                  padding: "20px", borderRadius: 16,
                  background: isOwned
                    ? "rgba(74,222,128,.04)"
                    : "rgba(255,255,255,.025)",
                  border: `1px solid ${isOwned
                    ? "rgba(74,222,128,.22)"
                    : `${rarityCol}33`}`,
                  transition: "all .2s",
                }}
              >
                {/* Skill header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 28 }}>{skill.icon}</span>
                    <div>
                      <div style={{
                        fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700,
                        marginBottom: 3,
                      }}>
                        {skill.name}
                      </div>
                      <span style={{
                        fontSize: 9, padding: "2px 8px",
                        background: `${rarityCol}22`, border: `1px solid ${rarityCol}55`,
                        borderRadius: 999, color: rarityCol, fontFamily: "'Orbitron',monospace",
                        fontWeight: 700, letterSpacing: ".1em",
                      }}>
                        {skill.rarity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {isOwned && (
                    <span style={{
                      fontSize: 10, padding: "3px 10px",
                      background: "rgba(74,222,128,.12)", border: "1px solid rgba(74,222,128,.3)",
                      borderRadius: 999, color: "#4ade80", fontFamily: "'Orbitron',monospace",
                      fontWeight: 700,
                    }}>
                      OWNED
                    </span>
                  )}
                </div>

                {/* Description */}
                <p style={{
                  color: "rgba(255,255,255,.5)", fontSize: 13, lineHeight: 1.7,
                  fontFamily: "'Rajdhani',sans-serif", marginBottom: 14,
                }}>
                  {skill.description}
                </p>

                {/* Duration info */}
                {skill.durationMs > 0 && (
                  <div style={{
                    display: "flex", gap: 16, marginBottom: 14,
                  }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", fontFamily: "'Rajdhani',sans-serif" }}>
                      Duration: <span style={{ color: "#b97fff" }}>{skill.durationMs / 1000}s</span>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", fontFamily: "'Rajdhani',sans-serif" }}>
                      Cooldown: <span style={{ color: "#b97fff" }}>{skill.cooldownMs / 1000}s</span>
                    </div>
                  </div>
                )}

                {/* Prices */}
                <div style={{
                  display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14,
                }}>
                  {skill.price.sol  && <PriceBadge label={`${skill.price.sol} SOL`}   color="#9945ff" />}
                  {skill.price.usdc && <PriceBadge label={`$${skill.price.usdc} USDC`} color="#2775ca" />}
                  {skill.price.sai  && <PriceBadge label={`${(skill.price.sai/1000).toFixed(0)}K $SAI`} color="#9f5fff" />}
                </div>

                {/* Action */}
                {!isOwned && address && (
                  <div>
                    <button
                      onClick={() => claimSkill(skill)}
                      disabled={isClaiming}
                      style={{
                        width: "100%", padding: "11px 0", borderRadius: 10,
                        background: isClaiming ? "rgba(159,95,255,.08)" : `${rarityCol}22`,
                        border: `1px solid ${isClaiming ? "rgba(255,255,255,.1)" : `${rarityCol}55`}`,
                        cursor: isClaiming ? "default" : "pointer",
                        fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: 11,
                        color: isClaiming ? "rgba(255,255,255,.35)" : rarityCol,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        transition: "all .2s",
                      }}
                    >
                      {isClaiming ? <><Spinner /> Unlocking…</> : <>
                        <ShoppingBag size={13} /> Unlock Skill
                      </>}
                    </button>
                    {msg && (
                      <div style={{
                        marginTop: 8, fontSize: 12, textAlign: "center",
                        color: msg.startsWith("✅") ? "#4ade80" : "#f87171",
                        fontFamily: "'Rajdhani',sans-serif",
                      }}>{msg}</div>
                    )}
                  </div>
                )}

                {!isOwned && !address && (
                  <div style={{
                    fontSize: 12, color: "rgba(255,255,255,.3)",
                    fontFamily: "'Rajdhani',sans-serif", textAlign: "center",
                    padding: "10px 0",
                  }}>
                    Connect wallet to unlock
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Holder perks */}
        <div style={{
          marginTop: 32, padding: "20px", borderRadius: 14,
          background: "linear-gradient(135deg,rgba(159,95,255,.06),rgba(59,130,246,.06))",
          border: "1px solid rgba(159,95,255,.2)",
          textAlign: "center",
        }}>
          <div style={{
            fontFamily: "'Orbitron',monospace", fontSize: 10,
            color: "#9f5fff", letterSpacing: ".22em", marginBottom: 10,
          }}>
            HOLDER PERKS
          </div>
          <p style={{
            color: "rgba(255,255,255,.5)", fontSize: 14, lineHeight: 1.7,
            fontFamily: "'Rajdhani',sans-serif",
          }}>
            Hold <strong style={{ color: "#b97fff" }}>
              {SAI_HOLDER_THRESHOLD.toLocaleString()} $SAI
            </strong> to unlock all skills for free, forever.
            No per-skill payments needed.
          </p>
        </div>
      </div>
    </div>
  );
}

function PriceBadge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      padding: "4px 10px",
      background: `${color}15`,
      border: `1px solid ${color}40`,
      borderRadius: 999,
      fontSize: 11, color,
      fontFamily: "'Orbitron',monospace", fontWeight: 700,
    }}>
      {label}
    </span>
  );
}
