"use client";

import {
  useState, useEffect, useRef, useCallback,
} from "react";
import { useAccount } from "wagmi";
import {
  generateBotTimeline, getBotScoreAt,
  type Difficulty, DIFFICULTY_LABELS,
  DIFFICULTY_DESCRIPTIONS, DIFFICULTY_COLORS,
} from "@/lib/botEngine";
import { validateMatch, recordClick, type MatchMetrics } from "@/lib/antiCheat";
import { applyElo, DEFAULT_ELO }  from "@/lib/elo";
import ResultScreen               from "./ResultScreen";
import FarcasterProfile           from "./FarcasterProfile";
import WalletButton               from "./WalletButton";
import { LogoMark }               from "./icons";
import type { FarcasterUser }     from "@/lib/farcaster";
import { Zap, ArrowLeft }         from "lucide-react";

// ─── Constants ───────────────────────────────────────────────
const GAME_MS = 30_000;
const TICK_MS = 50;
const TARGET_COLORS = [
  "#9f5fff","#3b82f6","#f43f5e","#10b981","#f59e0b","#ec4899","#06b6d4",
];

// ─── Types ───────────────────────────────────────────────────
type Phase = "lobby" | "countdown" | "playing" | "result";
interface Target { id:string; x:number; y:number; sz:number; c:string; }
interface Burst  { id:string; x:number; y:number; c:string; }
interface Popup  { id:string; x:number; y:number; txt:string; }

// ─── Local ELO storage (Farcaster users without wallet) ──────
function getLocalElo(fid: number) {
  try { return parseInt(localStorage.getItem(`saisen:elo:${fid}`) ?? String(DEFAULT_ELO)); }
  catch { return DEFAULT_ELO; }
}
function setLocalElo(fid: number, elo: number) {
  try { localStorage.setItem(`saisen:elo:${fid}`, String(elo)); } catch {}
}

// ─── Persist result to off-chain API ─────────────────────────
async function persistResult(
  fid:      number | null,
  username: string | null,
  pfpUrl:   string | null,
  address:  string | null,
  win:      boolean,
  score:    number,
  elo:      number,
) {
  try {
    await fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fid, username, pfpUrl, address, win, score, elo }),
    });
  } catch {}
}

// ─── Props ───────────────────────────────────────────────────
interface Props {
  fcUser: FarcasterUser | null;
  onBack: () => void;
}

export default function GameView({ fcUser, onBack }: Props) {
  const { address } = useAccount();

  const [phase,      setPhase]    = useState<Phase>("lobby");
  const [difficulty, setDiff]     = useState<Difficulty>("medium");
  const [countdown,  setCd]       = useState(3);
  const [elapsed,    setElapsed]  = useState(0);
  const [pScore,     setPScore]   = useState(0);
  const [bScore,     setBScore]   = useState(0);
  const [targets,    setTgts]     = useState<Target[]>([]);
  const [bursts,     setBursts]   = useState<Burst[]>([]);
  const [popups,     setPops]     = useState<Popup[]>([]);
  const [combo,      setCombo]    = useState(0);
  const [result,     setResult]   = useState<{
    win: boolean; eloChange: number; newElo: number;
    playerScore: number; botScore: number;
    matchDuration: number; validation: ReturnType<typeof validateMatch>;
  } | null>(null);

  const eloRef = useRef(fcUser ? getLocalElo(fcUser.fid) : DEFAULT_ELO);

  const r = useRef({
    ps:          0,
    botTL:       [] as number[],
    clicks:      [] as number[],
    startEpoch:  0,
    combo:       0,
    lastHit:     0,
    spawnIv:     null as ReturnType<typeof setInterval> | null,
    tickIv:      null as ReturnType<typeof setInterval> | null,
    cdIv:        null as ReturnType<typeof setInterval> | null,
  });

  const cleanup = () => {
    if (r.current.spawnIv) clearInterval(r.current.spawnIv);
    if (r.current.tickIv)  clearInterval(r.current.tickIv);
    if (r.current.cdIv)    clearInterval(r.current.cdIv);
  };

  const doEnd = useCallback(async () => {
    cleanup();
    setTgts([]);

    const endEpoch      = Date.now();
    const matchDuration = Math.round((endEpoch - r.current.startEpoch) / 1000);
    const botFinal      = getBotScoreAt(r.current.botTL, GAME_MS);
    const win           = r.current.ps > botFinal;

    const metrics: MatchMetrics = {
      clickTimestamps: r.current.clicks,
      startEpoch:      r.current.startEpoch,
      endEpoch,
      playerScore:     r.current.ps,
    };
    const validation = validateMatch(metrics);
    const newElo     = applyElo(eloRef.current, win);
    const eloChange  = newElo - eloRef.current;
    eloRef.current   = newElo;

    if (fcUser) setLocalElo(fcUser.fid, newElo);

    await persistResult(
      fcUser?.fid     ?? null,
      fcUser?.username ?? null,
      fcUser?.pfpUrl  ?? null,
      address         ?? null,
      win,
      r.current.ps,
      newElo,
    );

    setResult({ win, eloChange, newElo, playerScore: r.current.ps, botScore: botFinal, matchDuration, validation });
    setPhase("result");
  }, [fcUser, address]);

  const startGame = useCallback(() => {
    cleanup();
    r.current.ps         = 0;
    r.current.clicks     = [];
    r.current.combo      = 0;
    r.current.lastHit    = 0;
    r.current.startEpoch = Date.now();
    r.current.botTL      = generateBotTimeline(difficulty, GAME_MS);

    setPScore(0); setBScore(0); setCombo(0);
    setTgts([]); setBursts([]); setPops([]);
    setElapsed(0);

    r.current.spawnIv = setInterval(() => {
      const id   = Math.random().toString(36).slice(2, 9);
      const life = Math.random() * 1200 + 800;
      const t: Target = {
        id,
        x:  Math.random() * 80 + 5,
        y:  Math.random() * 72 + 8,
        sz: Math.floor(Math.random() * 18) + 33,
        c:  TARGET_COLORS[Math.floor(Math.random() * TARGET_COLORS.length)],
      };
      setTgts(prev => [...prev.slice(-15), t]);
      setTimeout(() => setTgts(prev => prev.filter(x => x.id !== id)), life);
    }, 640);

    r.current.tickIv = setInterval(() => {
      const el = Date.now() - r.current.startEpoch;
      setElapsed(el);
      setBScore(getBotScoreAt(r.current.botTL, el));
      if (el >= GAME_MS) doEnd();
    }, TICK_MS);

    setPhase("playing");
  }, [difficulty, doEnd]);

  const startCountdown = () => {
    setPhase("countdown"); setCd(3);
    let c = 3;
    r.current.cdIv = setInterval(() => {
      c--;
      setCd(c);
      if (c <= 0) { clearInterval(r.current.cdIv!); startGame(); }
    }, 800);
  };

  const hitTarget = (t: Target, e: React.MouseEvent) => {
    e.stopPropagation();
    setTgts(prev => prev.filter(x => x.id !== t.id));
    r.current.ps++;
    setPScore(r.current.ps);
    r.current.clicks = recordClick(r.current.clicks, r.current.startEpoch);

    const now = Date.now();
    const nc  = now - r.current.lastHit < 550 ? r.current.combo + 1 : 1;
    r.current.combo   = nc;
    r.current.lastHit = now;
    setCombo(nc);

    const bid = Math.random().toString(36).slice(2, 7);
    setBursts(prev => [...prev.slice(-8), { id: bid, x: t.x, y: t.y, c: t.c }]);
    setTimeout(() => setBursts(prev => prev.filter(b => b.id !== bid)), 450);

    const pid = Math.random().toString(36).slice(2, 7);
    setPops(prev => [...prev.slice(-6), { id: pid, x: t.x, y: t.y, txt: nc > 2 ? `+1 🔥×${nc}` : "+1" }]);
    setTimeout(() => setPops(prev => prev.filter(p => p.id !== pid)), 900);
  };

  useEffect(() => () => cleanup(), []);

  const timeLeft = Math.max(0, Math.ceil((GAME_MS - elapsed) / 1000));
  const timePct  = ((GAME_MS - elapsed) / GAME_MS) * 100;
  const timerC   = timeLeft > 15 ? "#9f5fff" : timeLeft > 7 ? "#f59e0b" : "#f43f5e";
  const circ     = 2 * Math.PI * 30;

  if (phase === "result" && result) {
    return (
      <ResultScreen
        {...result}
        fcUser={fcUser}
        onPlayAgain={() => { setResult(null); startCountdown(); }}
        onBack={onBack}
      />
    );
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#06060f",
      display: "flex", flexDirection: "column", color: "#fff", userSelect: "none",
    }}>

      {/* ── Header ── */}
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
            fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, transition: "color .2s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.4)"; }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <LogoMark size={26} />
        <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
          {fcUser && <FarcasterProfile user={fcUser} compact />}
          <WalletButton />
        </div>
      </div>

      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: "22px 16px",
      }}>

        {/* ── LOBBY ── */}
        {phase === "lobby" && (
          <div style={{ textAlign: "center", maxWidth: 500, width: "100%" }}>
            <div style={{ fontSize: 60, marginBottom: 16, lineHeight: 1 }}>🎯</div>
            <h2 style={{
              fontFamily: "'Orbitron',monospace",
              fontSize: "clamp(20px,4vw,30px)", fontWeight: 900, marginBottom: 10,
            }}>
              Select Difficulty
            </h2>
            <p style={{
              color: "rgba(255,255,255,.38)", fontSize: 14, lineHeight: 1.7,
              fontFamily: "'Rajdhani',sans-serif", fontWeight: 500, marginBottom: 28,
            }}>
              Hit more targets than the bot in 30 seconds to win.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {(["easy","medium","hard"] as Difficulty[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDiff(d)}
                  style={{
                    padding: "16px 20px", borderRadius: 12, cursor: "pointer",
                    border: `1px solid ${difficulty === d ? "rgba(159,95,255,.5)" : "rgba(255,255,255,.08)"}`,
                    background: difficulty === d ? "rgba(159,95,255,.1)" : "rgba(255,255,255,.025)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    transition: "all .2s",
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <div style={{
                      fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: 14,
                      color: difficulty === d ? "#b97fff" : "#fff", marginBottom: 3,
                    }}>
                      {DIFFICULTY_LABELS[d]}
                    </div>
                    <div style={{
                      fontSize: 12, color: "rgba(255,255,255,.35)",
                      fontFamily: "'Rajdhani',sans-serif",
                    }}>
                      {DIFFICULTY_DESCRIPTIONS[d]}
                    </div>
                  </div>
                  <div style={{
                    width: 10, height: 10,
                    background: difficulty === d ? DIFFICULTY_COLORS[d] : "transparent",
                    border: `2px solid ${difficulty === d ? DIFFICULTY_COLORS[d] : "rgba(255,255,255,.15)"}`,
                    borderRadius: "50%",
                    boxShadow: difficulty === d ? `0 0 8px ${DIFFICULTY_COLORS[d]}` : "none",
                    transition: "all .2s",
                  }} />
                </button>
              ))}
            </div>

            <button
              onClick={startCountdown}
              style={{
                display: "inline-flex", alignItems: "center", gap: 9,
                width: "100%", justifyContent: "center",
                background: "linear-gradient(135deg,#9f5fff,#6d28d9)",
                border: "none", borderRadius: 12, padding: "16px 0", cursor: "pointer",
                fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: 14,
                letterSpacing: ".08em", color: "#fff",
                boxShadow: "0 0 28px rgba(159,95,255,.5)", transition: "filter .15s,transform .15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = "brightness(1.12)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = ""; }}
            >
              <Zap size={15} /> Start Match
            </button>
          </div>
        )}

        {/* ── COUNTDOWN ── */}
        {phase === "countdown" && (
          <div style={{ textAlign: "center" }}>
            <div
              key={countdown}
              style={{
                fontFamily: "'Orbitron',monospace",
                fontSize: 120, fontWeight: 900, color: "#9f5fff", lineHeight: 1,
                textShadow: "0 0 50px rgba(159,95,255,.8)",
                animation: "cd-zoom .45s cubic-bezier(.34,1.56,.64,1)",
              }}
            >
              {countdown > 0 ? countdown : "GO!"}
            </div>
            <div style={{
              fontFamily: "'Orbitron',monospace", fontSize: 12,
              color: "rgba(255,255,255,.32)", marginTop: 16, letterSpacing: ".28em",
            }}>
              GET READY
            </div>
          </div>
        )}

        {/* ── PLAYING ── */}
        {phase === "playing" && (
          <div style={{ width: "100%", maxWidth: 920, display: "flex", flexDirection: "column", gap: 10 }}>

            {/* HUD */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center",
              gap: 12, padding: "12px 20px",
              background: "rgba(0,0,0,.55)", borderRadius: 16,
              border: "1px solid rgba(159,95,255,.12)",
            }}>
              {/* Player score */}
              <div>
                <div style={{
                  fontFamily: "'Orbitron',monospace", fontSize: 9,
                  color: "rgba(255,255,255,.3)", letterSpacing: ".18em", marginBottom: 3,
                }}>YOU</div>
                <div style={{
                  fontFamily: "'Orbitron',monospace", fontSize: 44, fontWeight: 900,
                  color: "#4ade80", lineHeight: 1, textShadow: "0 0 16px rgba(74,222,128,.5)",
                }}>
                  {pScore}
                </div>
                {combo > 1 && (
                  <div style={{
                    fontFamily: "'Orbitron',monospace", fontSize: 11, color: "#f87171", marginTop: 2,
                  }}>🔥 ×{combo}</div>
                )}
              </div>

              {/* Circular timer */}
              <div style={{ textAlign: "center" }}>
                <div style={{ position: "relative", width: 72, height: 72 }}>
                  <svg width="72" height="72" style={{ transform: "rotate(-90deg)", display: "block" }}>
                    <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="5" />
                    <circle cx="36" cy="36" r="30" fill="none" stroke={timerC} strokeWidth="5"
                      strokeDasharray={`${circ * timePct / 100} ${circ}`}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dasharray .1s linear, stroke .5s" }}
                    />
                  </svg>
                  <div style={{
                    position: "absolute", inset: 0, display: "flex", alignItems: "center",
                    justifyContent: "center", fontFamily: "'Orbitron',monospace",
                    fontSize: 20, fontWeight: 900, color: timerC,
                  }}>
                    {timeLeft}
                  </div>
                </div>
                <div style={{
                  fontFamily: "'Orbitron',monospace", fontSize: 9,
                  color: "rgba(255,255,255,.2)", letterSpacing: ".18em", marginTop: 4,
                }}>VS</div>
              </div>

              {/* Bot score */}
              <div style={{ textAlign: "right" }}>
                <div style={{
                  fontFamily: "'Orbitron',monospace", fontSize: 9,
                  color: "rgba(255,255,255,.3)", letterSpacing: ".18em", marginBottom: 3,
                }}>BOT</div>
                <div style={{
                  fontFamily: "'Orbitron',monospace", fontSize: 44, fontWeight: 900,
                  color: "#f87171", lineHeight: 1, textShadow: "0 0 16px rgba(248,113,113,.5)",
                }}>
                  {bScore}
                </div>
              </div>
            </div>

            {/* Arena */}
            <div style={{
              width: "100%", height: "min(490px,56vh)",
              background: "#080818", borderRadius: 20,
              border: "1px solid rgba(159,95,255,.11)",
              position: "relative", overflow: "hidden", cursor: "crosshair",
              backgroundImage:
                "linear-gradient(rgba(159,95,255,.04) 1px,transparent 1px)," +
                "linear-gradient(90deg,rgba(159,95,255,.04) 1px,transparent 1px)",
              backgroundSize: "30px 30px",
            }}>
              {/* Vignette */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
                background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 50%, rgba(0,0,0,.38) 100%)",
              }} />

              {/* Targets */}
              {targets.map(t => (
                <button
                  key={t.id}
                  className="target-node"
                  onClick={e => hitTarget(t, e)}
                  style={{
                    position: "absolute", left: `${t.x}%`, top: `${t.y}%`,
                    transform: "translate(-50%,-50%)",
                    width: t.sz, height: t.sz, borderRadius: "50%",
                    background: `radial-gradient(circle at 38% 34%, ${t.c}ff, ${t.c}88)`,
                    boxShadow: `0 0 12px ${t.c}88, 0 0 28px ${t.c}44`,
                    border: `2px solid ${t.c}dd`,
                    cursor: "crosshair", padding: 0, outline: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: t.sz * .36, color: "rgba(255,255,255,.5)",
                    fontFamily: "monospace", fontWeight: 700, zIndex: 2,
                  }}
                >×</button>
              ))}

              {/* Burst effects */}
              {bursts.map(b => (
                <div key={b.id} style={{
                  position: "absolute", left: `${b.x}%`, top: `${b.y}%`,
                  width: 60, height: 60, borderRadius: "50%",
                  background: `${b.c}30`, border: `2px solid ${b.c}99`,
                  animation: "burst .5s ease-out forwards",
                  pointerEvents: "none", zIndex: 3,
                }} />
              ))}

              {/* Score pop-ups */}
              {popups.map(p => (
                <div key={p.id} style={{
                  position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
                  transform: "translateX(-50%)",
                  fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: 16,
                  color: "#fff", textShadow: "0 0 10px rgba(159,95,255,.8)",
                  animation: "score-pop .9s ease-out forwards",
                  pointerEvents: "none", whiteSpace: "nowrap", zIndex: 4,
                }}>
                  {p.txt}
                </div>
              ))}

              <div style={{
                position: "absolute", bottom: 9, left: "50%", transform: "translateX(-50%)",
                fontFamily: "'Orbitron',monospace", fontSize: 9,
                color: "rgba(255,255,255,.09)", letterSpacing: ".2em", pointerEvents: "none",
              }}>
                CLICK TARGETS TO SCORE
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}