"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Trophy,
  Zap,
  Shield,
  TrendingUp,
  Wallet,
  X,
  Menu,
  ExternalLink,
  Award,
  RefreshCw,
  Users,
  Target,
} from "lucide-react";
import type { MouseEvent as ReactMouseEvent } from "react";

const storage = {
  async get(key: string, _json?: boolean) {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(key);
      return raw ? { value: raw } : null;
    } catch {
      return null;
    }
  },
  async set(key: string, value: string, _json?: boolean) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error(e);
    }
  },
};

const GAME_SECS = 30;
const LB_KEY = "saisen:lb:v2";
const WK_KEY = "saisen:week:v1";
const TC = [
  "#9f5fff",
  "#3b82f6",
  "#f43f5e",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
];
const TIERS = [
  { name: "Bronze", min: 0, c: "#cd7f32", e: "ðŸ¥‰" },
  { name: "Silver", min: 1300, c: "#94a3b8", e: "ðŸ¥ˆ" },
  { name: "Gold", min: 1500, c: "#fbbf24", e: "ðŸ¥‡" },
  { name: "Platinum", min: 1700, c: "#38bdf8", e: "ðŸ’Ž" },
  { name: "Diamond", min: 1900, c: "#9f5fff", e: "ðŸ‘‘" },
];
const getRank = (elo: number) =>
  [...TIERS].reverse().find((t) => elo >= t.min) || TIERS[0];
const fmt = (addr: string | undefined) =>
  addr ? `${addr.slice(0, 6)}â€¦${addr.slice(-4)}` : "â€”";

const loadLB = async () => {
  try {
    const r = await storage.get(LB_KEY, true);
    return r ? (JSON.parse(r.value) as LBRow[]) : [];
  } catch {
    return [];
  }
};
const saveLB = async (d: LBRow[]) => {
  try {
    await storage.set(LB_KEY, JSON.stringify(d), true);
  } catch (e) {
    console.error(e);
  }
};
const getWeekStart = async () => {
  try {
    const r = await storage.get(WK_KEY, true);
    if (!r) throw new Error("none");
    const { start } = JSON.parse(r.value) as { start: number };
    if (Date.now() - start > 7 * 86400000) throw new Error("expired");
    return start;
  } catch {
    const s = Date.now();
    await storage.set(WK_KEY, JSON.stringify({ start: s }), true);
    try {
      await saveLB([]);
    } catch {
      /* noop */
    }
    return s;
  }
};
type LBRow = {
  addr: string;
  wins: number;
  losses: number;
  score: number;
  matches: number;
  elo: number;
  ts: number;
};
const upsertPlayer = async (addr: string, won: boolean, score: number) => {
  let d = await loadLB();
  const delta = won ? 22 : -13;
  const i = d.findIndex((p) => p.addr.toLowerCase() === addr.toLowerCase());
  if (i >= 0) {
    const p = d[i]!;
    d[i] = {
      ...p,
      wins: p.wins + (won ? 1 : 0),
      losses: p.losses + (won ? 0 : 1),
      score: p.score + score,
      matches: p.matches + 1,
      elo: Math.max(800, p.elo + delta),
      ts: Date.now(),
    };
  } else {
    d.push({
      addr,
      wins: won ? 1 : 0,
      losses: won ? 0 : 1,
      score,
      matches: 1,
      elo: Math.max(800, 1200 + delta),
      ts: Date.now(),
    });
  }
  d.sort((a, b) => b.elo - a.elo);
  await saveLB(d);
  return d;
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#06060f}::-webkit-scrollbar-thumb{background:linear-gradient(#9f5fff,#3b82f6);border-radius:2px}
  @keyframes glow-pulse{0%,100%{text-shadow:0 0 8px #9f5fff,0 0 20px rgba(159,95,255,.4)}50%{text-shadow:0 0 16px #b97fff,0 0 40px #9f5fff}}
  @keyframes grid-drift{from{background-position:0 0}to{background-position:50px 50px}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
  @keyframes btn-glow{0%,100%{box-shadow:0 0 16px rgba(159,95,255,.45),0 4px 24px rgba(0,0,0,.4)}50%{box-shadow:0 0 32px rgba(159,95,255,.8),0 4px 24px rgba(0,0,0,.4)}}
  @keyframes slide-up{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
  @keyframes appear{from{transform:translate(-50%,-50%) scale(.4) rotate(-15deg);opacity:0}to{transform:translate(-50%,-50%) scale(1) rotate(0);opacity:1}}
  @keyframes burst{0%{transform:translate(-50%,-50%) scale(0);opacity:.7}100%{transform:translate(-50%,-50%) scale(3.5);opacity:0}}
  @keyframes score-pop{0%{transform:translateY(0) scale(1.2);opacity:1}100%{transform:translateY(-55px);opacity:0}}
  @keyframes shimmer{from{background-position:-200% center}to{background-position:200% center}}
  @keyframes flicker{0%,100%{opacity:1}91%,95%{opacity:.7}93%{opacity:.45}}
  @keyframes scan{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes torii-glow{0%,100%{filter:drop-shadow(0 0 4px rgba(159,95,255,.5))}50%{filter:drop-shadow(0 0 14px rgba(159,95,255,.95))}}
  @keyframes lb-enter{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:translateX(0)}}
  @keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.4)}}
  @keyframes win-glow{0%,100%{text-shadow:0 0 20px rgba(74,222,128,.5)}50%{text-shadow:0 0 40px #4ade80,0 0 80px rgba(74,222,128,.3)}}
  @keyframes lose-glow{0%,100%{text-shadow:0 0 20px rgba(248,113,113,.5)}50%{text-shadow:0 0 40px #f87171,0 0 80px rgba(248,113,113,.3)}}
  @keyframes cd-zoom{from{transform:scale(2.4);opacity:0}to{transform:scale(1);opacity:1}}
  .font-display{font-family:'Orbitron',monospace}.font-body{font-family:'Rajdhani',sans-serif}
  .glow{animation:glow-pulse 2.5s ease-in-out infinite}.float{animation:float 3.8s ease-in-out infinite}
  .pulse{animation:btn-glow 2s ease-in-out infinite}.slide-up{animation:slide-up .55s ease-out both}
  .flicker{animation:flicker 6s ease-in-out infinite}.torii-glow{animation:torii-glow 3s ease-in-out infinite}
  .shimmer{background:linear-gradient(90deg,rgba(255,255,255,.6) 0%,#fff 35%,rgba(255,255,255,.6) 65%,rgba(255,255,255,.35) 100%);background-size:200% auto;animation:shimmer 3.5s linear infinite;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .card{background:rgba(255,255,255,.025);border:1px solid rgba(159,95,255,.13);border-radius:16px;backdrop-filter:blur(12px);transition:transform .25s,box-shadow .25s,border-color .25s}
  .card:hover{transform:translateY(-5px);box-shadow:0 24px 48px rgba(159,95,255,.14);border-color:rgba(159,95,255,.35)}
  .target-node{animation:appear .16s cubic-bezier(.34,1.56,.64,1);transition:transform .08s}
  .target-node:hover{transform:translate(-50%,-50%) scale(1.12)!important}
  .target-node:active{transform:translate(-50%,-50%) scale(.88)!important}
  .lb-row{animation:lb-enter .32s ease-out both}
  .pulse-dot{animation:pulse-dot 1.5s ease-in-out infinite}
  .win-txt{animation:win-glow 2s ease-in-out infinite}.lose-txt{animation:lose-glow 2s ease-in-out infinite}
`;

const ToriiIcon = ({
  size = 32,
  glowing = false,
  className = "",
}: {
  size?: number;
  glowing?: boolean;
  className?: string;
}) => (
  <svg
    width={size}
    height={Math.round(size * 0.9)}
    viewBox="0 0 40 36"
    fill="none"
    className={className}
    style={
      glowing
        ? { filter: "drop-shadow(0 0 6px rgba(159,95,255,.9))" }
        : undefined
    }
  >
    <path d="M1 12.5Q20 3.5 39 12.5L37.5 16Q20 7 2.5 16Z" fill="#9f5fff" />
    <rect x="5" y="15.5" width="30" height="2.8" rx="1.4" fill="#7c3aed" />
    <rect x="9" y="20.5" width="22" height="2.5" rx="1.25" fill="#9f5fff" />
    <rect x="11.2" y="15" width="3.2" height="21" rx="1.6" fill="#9f5fff" />
    <rect x="25.6" y="15" width="3.2" height="21" rx="1.6" fill="#9f5fff" />
    <rect x="13.2" y="6.5" width="2.2" height="9" rx="1.1" fill="#b97fff" />
    <rect x="24.6" y="6.5" width="2.2" height="9" rx="1.1" fill="#b97fff" />
  </svg>
);

const LogoMark = ({ size = 36 }: { size?: number }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div
      style={{
        width: size,
        height: size,
        background:
          "linear-gradient(135deg,rgba(159,95,255,.18),rgba(59,130,246,.18))",
        border: "1px solid rgba(159,95,255,.32)",
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 14px rgba(159,95,255,.28)",
        transition: "all .3s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 0 24px rgba(159,95,255,.7)";
        e.currentTarget.style.borderColor = "rgba(159,95,255,.65)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 0 14px rgba(159,95,255,.28)";
        e.currentTarget.style.borderColor = "rgba(159,95,255,.32)";
      }}
    >
      <ToriiIcon size={size * 0.68} glowing />
    </div>
    <span
      className="flicker font-display"
      style={{ fontWeight: 900, fontSize: size * 0.52, letterSpacing: ".18em" }}
    >
      SAISEN
    </span>
  </div>
);

const Btn = ({
  children,
  onClick,
  v = "primary",
  sz = "md",
  pulse = false,
  style: sx = {},
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  v?: string;
  sz?: string;
  pulse?: boolean;
  style?: React.CSSProperties;
  disabled?: boolean;
}) => {
  const base: React.CSSProperties = {
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none",
    fontFamily: "'Orbitron',monospace",
    fontWeight: 700,
    letterSpacing: ".08em",
    textTransform: "uppercase",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    transition: "filter .15s,transform .15s",
    whiteSpace: "nowrap",
    opacity: disabled ? 0.5 : 1,
  };
  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: "linear-gradient(135deg,#9f5fff,#6d28d9)",
      color: "#fff",
      boxShadow: "0 0 20px rgba(159,95,255,.4)",
    },
    outline: {
      background: "transparent",
      color: "#b97fff",
      border: "1px solid rgba(159,95,255,.45)",
    },
    blue: { background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", color: "#fff" },
    ghost: {
      background: "rgba(255,255,255,.05)",
      color: "rgba(255,255,255,.65)",
      border: "1px solid rgba(255,255,255,.1)",
    },
  };
  const sizes: Record<string, React.CSSProperties> = {
    xs: { padding: "5px 10px", fontSize: 10, borderRadius: 6 },
    sm: { padding: "8px 16px", fontSize: 11, borderRadius: 8 },
    md: { padding: "11px 22px", fontSize: 12, borderRadius: 10 },
    lg: { padding: "15px 34px", fontSize: 14, borderRadius: 12 },
    xl: { padding: "18px 44px", fontSize: 15, borderRadius: 13 },
  };
  return (
    <button
      type="button"
      className={pulse && !disabled ? "pulse" : ""}
      style={{ ...base, ...variants[v], ...sizes[sz], ...sx }}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.filter = "brightness(1.18)";
          e.currentTarget.style.transform = "scale(1.045)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = "";
        e.currentTarget.style.transform = "";
      }}
    >
      {children}
    </button>
  );
};

const Tag = ({
  children,
  color = "#9f5fff",
}: {
  children: React.ReactNode;
  color?: string;
}) => (
  <span
    style={{
      background: `${color}22`,
      border: `1px solid ${color}44`,
      color,
      borderRadius: 6,
      padding: "3px 9px",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: ".12em",
      textTransform: "uppercase",
      fontFamily: "'Orbitron',monospace",
    }}
  >
    {children}
  </span>
);

const Sec = ({
  id,
  children,
  tint,
}: {
  id?: string;
  children: React.ReactNode;
  tint?: string;
}) => (
  <section
    id={id}
    style={{
      background: tint || "transparent",
      borderTop: tint ? "1px solid rgba(159,95,255,.07)" : "none",
      borderBottom: tint ? "1px solid rgba(159,95,255,.07)" : "none",
    }}
  >
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "clamp(60px,8vw,96px) clamp(18px,5vw,40px)",
      }}
    >
      {children}
    </div>
  </section>
);

const Head = ({
  label,
  title,
  sub,
}: {
  label: string;
  title: string;
  sub?: string;
}) => (
  <div style={{ textAlign: "center", marginBottom: 52 }}>
    <div
      style={{
        color: "#9f5fff",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: ".28em",
        textTransform: "uppercase",
        fontFamily: "'Orbitron',monospace",
        marginBottom: 14,
      }}
    >
      {label}
    </div>
    <h2
      style={{
        fontFamily: "'Orbitron',monospace",
        fontSize: "clamp(26px,4vw,44px)",
        fontWeight: 900,
        lineHeight: 1.1,
        marginBottom: 14,
        background:
          "linear-gradient(135deg,#fff 0%,rgba(255,255,255,.65) 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {title}
    </h2>
    {sub && (
      <p
        style={{
          color: "rgba(255,255,255,.42)",
          fontSize: 15,
          maxWidth: 500,
          margin: "0 auto",
          lineHeight: 1.7,
          fontFamily: "'Rajdhani',sans-serif",
          fontWeight: 500,
        }}
      >
        {sub}
      </p>
    )}
  </div>
);

const Spinner = ({ size = 16 }: { size?: number }) => (
  <div
    style={{
      width: size,
      height: size,
      border: `2px solid rgba(159,95,255,.3)`,
      borderTop: `2px solid #9f5fff`,
      borderRadius: "50%",
      animation: "spin .6s linear infinite",
      flexShrink: 0,
    }}
  />
);

function WalletModal({
  onConnect,
  onClose,
}: {
  onConnect: (addr: string) => void;
  onClose: () => void;
}) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [err, setErr] = useState("");

  const tryMetaMask = async () => {
    setConnecting("mm");
    setErr("");
    try {
      const eth = (
        window as unknown as {
          ethereum?: { request: (a: { method: string }) => Promise<string[]> };
        }
      ).ethereum;
      if (eth) {
        const accs = await eth.request({ method: "eth_requestAccounts" });
        if (accs[0]) {
          onConnect(accs[0]);
          return;
        }
      }
      setErr(
        "MetaMask not detected. Install the extension or use Demo Connect below.",
      );
    } catch (e: unknown) {
      const code = (e as { code?: number }).code;
      setErr(
        code === 4001
          ? "Connection rejected by user."
          : "Could not connect. Try Demo Connect.",
      );
    }
    setConnecting(null);
  };

  const demoConnect = () => {
    const a =
      "0x" +
      [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
    onConnect(a);
  };

  type WalletOption = {
    id: string;
    icon: string;
    name: string;
    sub: string;
    action: () => void | Promise<void>;
    badge?: string;
  };
  const wallets: WalletOption[] = [
    {
      id: "mm",
      icon: "ðŸ¦Š",
      name: "MetaMask",
      sub: "Browser extension wallet",
      action: tryMetaMask,
    },
    {
      id: "wc",
      icon: "ðŸ”—",
      name: "WalletConnect",
      sub: "QR & mobile wallets",
      action: () =>
        setErr(
          "WalletConnect available in production build. Use Demo Connect for now.",
        ),
      badge: "PROD",
    },
    {
      id: "cb",
      icon: "ðŸŸ¦",
      name: "Coinbase Wallet",
      sub: "Self-custody wallet",
      action: () =>
        setErr(
          "Coinbase Wallet available in production build. Use Demo Connect for now.",
        ),
      badge: "PROD",
    },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,.78)",
        backdropFilter: "blur(10px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#0c0c1e",
          border: "1px solid rgba(159,95,255,.22)",
          borderRadius: 22,
          padding: "36px 28px",
          width: "min(400px,93vw)",
          position: "relative",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 15,
            right: 15,
            background: "none",
            border: "none",
            color: "rgba(255,255,255,.35)",
            cursor: "pointer",
            padding: 4,
          }}
        >
          <X size={17} />
        </button>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            className="torii-glow"
            style={{ display: "inline-block", marginBottom: 12 }}
          >
            <ToriiIcon size={46} />
          </div>
          <h3
            style={{
              fontFamily: "'Orbitron',monospace",
              fontSize: 17,
              fontWeight: 900,
              marginBottom: 6,
            }}
          >
            Connect Wallet
          </h3>
          <p
            style={{
              color: "rgba(255,255,255,.38)",
              fontSize: 13,
              fontFamily: "'Rajdhani',sans-serif",
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
            Your wallet is your player identity on SAISEN. Stats are tied to your
            address.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {wallets.map((w) => (
            <button
              type="button"
              key={w.id}
              onClick={w.action}
              disabled={connecting === w.id}
              style={{
                width: "100%",
                padding: "13px 16px",
                background: "rgba(255,255,255,.03)",
                border: "1px solid rgba(255,255,255,.08)",
                borderRadius: 12,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: "#fff",
                fontFamily: "'Rajdhani',sans-serif",
                fontWeight: 600,
                fontSize: 15,
                transition: "all .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(159,95,255,.38)";
                e.currentTarget.style.background = "rgba(159,95,255,.07)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,.08)";
                e.currentTarget.style.background = "rgba(255,255,255,.03)";
              }}
            >
              <span style={{ fontSize: 22, lineHeight: 1 }}>{w.icon}</span>
              <div style={{ textAlign: "left", flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{w.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.32)" }}>
                  {w.sub}
                </div>
              </div>
              {connecting === w.id ? (
                <Spinner />
              ) : w.badge ? (
                <Tag color="#6366f1">{w.badge}</Tag>
              ) : null}
            </button>
          ))}
        </div>

        <div
          style={{ height: 1, background: "rgba(255,255,255,.07)", marginBottom: 12 }}
        />
        <button
          type="button"
          onClick={demoConnect}
          style={{
            width: "100%",
            padding: "11px 18px",
            background: "rgba(159,95,255,.09)",
            border: "1px solid rgba(159,95,255,.22)",
            borderRadius: 10,
            cursor: "pointer",
            color: "#b97fff",
            fontFamily: "'Orbitron',monospace",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: ".08em",
            transition: "all .2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(159,95,255,.17)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(159,95,255,.09)")
          }
        >
          ðŸŽ® Demo Connect â€” Sandbox Testing
        </button>
        {err && (
          <div
            style={{
              marginTop: 11,
              padding: "9px 13px",
              background: "rgba(244,63,94,.09)",
              border: "1px solid rgba(244,63,94,.2)",
              borderRadius: 9,
              fontSize: 12,
              color: "#f87171",
              fontFamily: "'Rajdhani',sans-serif",
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
            {err}
          </div>
        )}
        <p
          style={{
            textAlign: "center",
            marginTop: 15,
            fontSize: 11,
            color: "rgba(255,255,255,.18)",
            fontFamily: "'Rajdhani',sans-serif",
          }}
        >
          Wallet address used for identity only. No transactions required.
        </p>
      </div>
    </div>
  );
}


type Wallet = { connected: boolean; address: string; elo: number };

function Nav({
  wallet,
  openModal,
  onPlay,
}: {
  wallet: Wallet;
  openModal: () => void;
  onPlay: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = [
    ["About", "#about"],
    ["Game", "#game"],
    ["Season", "#season"],
    ["Leaderboard", "#leaderboard"],
    ["Roadmap", "#roadmap"],
  ] as const;
  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: scrolled ? "rgba(6,6,15,.94)" : "transparent",
          backdropFilter: scrolled ? "blur(22px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(159,95,255,.1)" : "none",
          transition: "all .3s",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 62,
          }}
        >
          <a href="#hero" style={{ textDecoration: "none", color: "white" }}>
            <LogoMark size={32} />
          </a>
          <div className="hidden lg:flex" style={{ gap: 30 }}>
            {links.map(([l, h]) => (
              <a
                key={l}
                href={h}
                style={{
                  color: "rgba(255,255,255,.48)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".12em",
                  transition: "color .2s",
                  textDecoration: "none",
                  fontFamily: "'Orbitron',monospace",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = "#b97fff";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = "rgba(255,255,255,.48)";
                }}
              >
                {l}
              </a>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            {wallet.connected ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    background: "rgba(16,185,129,.09)",
                    border: "1px solid rgba(16,185,129,.22)",
                    borderRadius: 8,
                    padding: "5px 12px",
                    fontSize: 11,
                    fontFamily: "'Orbitron',monospace",
                    color: "#34d399",
                    fontWeight: 700,
                  }}
                >
                  {fmt(wallet.address)}
                </div>
                {wallet.elo > 0 && (
                  <div
                    style={{
                      background: "rgba(159,95,255,.12)",
                      border: "1px solid rgba(159,95,255,.24)",
                      borderRadius: 8,
                      padding: "5px 10px",
                      fontSize: 11,
                      fontFamily: "'Orbitron',monospace",
                      color: "#b97fff",
                      fontWeight: 700,
                    }}
                  >
                    {getRank(wallet.elo).e} {wallet.elo}
                  </div>
                )}
              </div>
            ) : (
              <Btn sz="sm" v="outline" onClick={openModal}>
                <Wallet size={11} /> Connect
              </Btn>
            )}
            <Btn sz="sm" onClick={onPlay} pulse>
              <Zap size={11} /> Play
            </Btn>
            <button
              type="button"
              className="lg:hidden"
              onClick={() => setOpen(!open)}
              style={{
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                alignItems: "center",
              }}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>
      {open && (
        <div
          className="lg:hidden"
          style={{
            position: "fixed",
            top: 62,
            left: 0,
            right: 0,
            zIndex: 999,
            background: "rgba(6,6,15,.98)",
            borderBottom: "1px solid rgba(159,95,255,.1)",
            padding: "18px 22px",
          }}
        >
          {links.map(([l, h]) => (
            <a
              key={l}
              href={h}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                padding: "12px 0",
                color: "rgba(255,255,255,.65)",
                fontSize: 15,
                fontWeight: 600,
                borderBottom: "1px solid rgba(255,255,255,.04)",
                textDecoration: "none",
                fontFamily: "'Rajdhani',sans-serif",
                letterSpacing: ".06em",
              }}
            >
              {l}
            </a>
          ))}
          <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {!wallet.connected && (
              <Btn
                sz="sm"
                v="outline"
                onClick={() => {
                  openModal();
                  setOpen(false);
                }}
              >
                <Wallet size={11} /> Connect Wallet
              </Btn>
            )}
            <Btn
              sz="sm"
              onClick={() => {
                onPlay();
                setOpen(false);
              }}
              pulse
            >
              <Zap size={11} /> Play Now
            </Btn>
          </div>
        </div>
      )}
    </>
  );
}

function Hero({
  onPlay,
  openModal,
  wallet,
}: {
  onPlay: () => void;
  openModal: () => void;
  wallet: Wallet;
}) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    setTimeout(() => setVis(true), 80);
  }, []);
  return (
    <div
      id="hero"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        paddingTop: 62,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.12,
          backgroundImage:
            "linear-gradient(rgba(159,95,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(159,95,255,.6) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
          animation: "grid-drift 5s linear infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(159,95,255,.13) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "-5%",
          width: 380,
          height: 380,
          background:
            "radial-gradient(circle,rgba(59,130,246,.09) 0%,transparent 65%)",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          right: "-5%",
          width: 420,
          height: 420,
          background:
            "radial-gradient(circle,rgba(244,63,94,.06) 0%,transparent 65%)",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background:
            "linear-gradient(90deg,transparent,rgba(159,95,255,.4),transparent)",
          animation: "scan 8s linear infinite",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          textAlign: "center",
          maxWidth: 820,
          padding: "0 22px",
          position: "relative",
          zIndex: 1,
          opacity: vis ? 1 : 0,
          transition: "opacity .9s ease",
        }}
      >
        <div
          className="slide-up"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(159,95,255,.09)",
            border: "1px solid rgba(159,95,255,.28)",
            borderRadius: 999,
            padding: "6px 18px",
            marginBottom: 34,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".18em",
            color: "#b97fff",
            fontFamily: "'Orbitron',monospace",
            animationDelay: ".1s",
          }}
        >
          <span
            className="pulse-dot"
            style={{
              width: 7,
              height: 7,
              background: "#10b981",
              borderRadius: "50%",
              boxShadow: "0 0 6px #10b981",
              display: "inline-block",
            }}
          />
          SEASON 1 â€” LIVE NOW
        </div>

        <div
          className="float slide-up"
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 20,
            animationDelay: ".18s",
          }}
        >
          <div className="torii-glow">
            <ToriiIcon size={90} />
          </div>
        </div>

        <h1
          className="glow font-display slide-up"
          style={{
            fontSize: "clamp(70px,12vw,140px)",
            fontWeight: 900,
            letterSpacing: "-.02em",
            lineHeight: 0.88,
            marginBottom: 18,
            animationDelay: ".28s",
          }}
        >
          SAISEN
        </h1>
        <p
          className="shimmer font-display slide-up"
          style={{
            fontSize: "clamp(13px,2vw,18px)",
            letterSpacing: ".25em",
            marginBottom: 14,
            animationDelay: ".38s",
          }}
        >
          COMPETE Â· PERFORM Â· DOMINATE
        </p>
        <p
          className="slide-up"
          style={{
            color: "rgba(255,255,255,.4)",
            fontSize: 15,
            maxWidth: 460,
            margin: "0 auto 40px",
            lineHeight: 1.75,
            fontFamily: "'Rajdhani',sans-serif",
            fontWeight: 500,
            animationDelay: ".48s",
          }}
        >
          The first fully skill-based Web3 arena. Win 1v1 reaction matches, build your
          rank, and climb the global leaderboard.
        </p>

        <div
          className="slide-up"
          style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 50,
            animationDelay: ".56s",
          }}
        >
          <Btn sz="xl" onClick={onPlay} pulse>
            <Zap size={16} /> Play Now
          </Btn>
          {!wallet.connected ? (
            <Btn sz="xl" v="outline" onClick={openModal}>
              <Wallet size={16} /> Connect Wallet
            </Btn>
          ) : (
            <Btn sz="xl" v="outline" style={{ pointerEvents: "none" }}>
              <Award size={16} /> {fmt(wallet.address)} âœ“
            </Btn>
          )}
        </div>

        <div
          className="slide-up"
          style={{
            display: "flex",
            gap: 28,
            justifyContent: "center",
            flexWrap: "wrap",
            animationDelay: ".68s",
          }}
        >
          {[
            ["12,847", "Players Online"],
            ["Season 1", "Currently Live"],
            ["30s", "Match Length"],
            ["100%", "Skill Based"],
          ].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: "#b97fff",
                  fontFamily: "'Orbitron',monospace",
                }}
              >
                {v}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,.32)",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  marginTop: 3,
                  fontFamily: "'Rajdhani',sans-serif",
                }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function About() {
  const pts = [
    {
      icon: <Zap size={21} />,
      title: "Skill Over Luck",
      desc: "Every match is a pure test of reflexes. Zero randomness, zero pay-to-win mechanics. Performance is everything.",
      c: "#9f5fff",
    },
    {
      icon: <Trophy size={21} />,
      title: "Real Rankings",
      desc: "Your ELO reflects true ability. Climb from Bronze to Diamond through consistent performance alone.",
      c: "#f59e0b",
    },
    {
      icon: <Shield size={21} />,
      title: "Wallet Identity",
      desc: "Connect your wallet to bind your stats and rank to a permanent on-chain identity. Your record, your legacy.",
      c: "#10b981",
    },
    {
      icon: <TrendingUp size={21} />,
      title: "Weekly Seasons",
      desc: "Compete in 7-day competitive windows. Leaderboards reset weekly â€” every player starts equal.",
      c: "#3b82f6",
    },
  ];
  return (
    <Sec id="about" tint="rgba(159,95,255,.022)">
      <Head
        label="About SAISEN"
        title="Performance is your rank."
        sub="SAISEN is a skill-based competitive platform where your leaderboard position reflects real ability â€” nothing else."
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
          gap: 18,
        }}
      >
        {pts.map((p, i) => (
          <div
            key={p.title}
            className="card slide-up"
            style={{ padding: 28, animationDelay: `${i * 0.09}s` }}
          >
            <div
              style={{
                color: p.c,
                marginBottom: 18,
                width: 46,
                height: 46,
                background: `${p.c}18`,
                borderRadius: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {p.icon}
            </div>
            <div
              style={{
                fontFamily: "'Orbitron',monospace",
                fontWeight: 700,
                fontSize: 15,
                marginBottom: 8,
                color: "#fff",
              }}
            >
              {p.title}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,.45)",
                fontSize: 14,
                lineHeight: 1.65,
                fontFamily: "'Rajdhani',sans-serif",
                fontWeight: 500,
              }}
            >
              {p.desc}
            </div>
          </div>
        ))}
      </div>
    </Sec>
  );
}

function Gameplay({ onPlay }: { onPlay: () => void }) {
  const feats = [
    { icon: "âš¡", title: "1v1 Matches", desc: "30-second adrenaline duels. No downtime, no stalling â€” pure reflex." },
    { icon: "ðŸŽ¯", title: "Reaction-Based", desc: "Click targets faster than your opponent. Precision determines the winner." },
    { icon: "ðŸ†", title: "ELO / MMR Ladder", desc: "Compete globally. Your rank reflects your exact skill tier." },
    { icon: "ðŸŽ–ï¸", title: "Seasonal Honours", desc: "Top-ranked players earn exclusive titles, badges, and permanent placement." },
  ];
  return (
    <Sec id="game">
      <Head
        label="Gameplay"
        title="Fast. Brutal. Rewarding."
        sub="Reaction-based 1v1 combat where every millisecond counts and skill is the only currency."
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          gap: 44,
          alignItems: "center",
        }}
      >
        <div
          className="float"
          style={{
            background: "rgba(6,6,15,.9)",
            border: "1px solid rgba(159,95,255,.2)",
            borderRadius: 22,
            padding: 5,
            boxShadow: "0 0 50px rgba(159,95,255,.11)",
          }}
        >
          <div
            style={{
              background: "#080818",
              borderRadius: 17,
              padding: 24,
              position: "relative",
              overflow: "hidden",
              minHeight: 290,
              backgroundImage:
                "linear-gradient(rgba(159,95,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(159,95,255,.04) 1px,transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
                padding: "8px 14px",
                background: "rgba(0,0,0,.4)",
                borderRadius: 10,
                border: "1px solid rgba(159,95,255,.12)",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 9,
                    color: "rgba(255,255,255,.3)",
                    letterSpacing: ".15em",
                    fontFamily: "'Orbitron',monospace",
                    marginBottom: 2,
                  }}
                >
                  YOU
                </div>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
                    color: "#4ade80",
                    fontFamily: "'Orbitron',monospace",
                    lineHeight: 1,
                  }}
                >
                  12
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 9,
                    color: "rgba(255,255,255,.3)",
                    letterSpacing: ".2em",
                    fontFamily: "'Orbitron',monospace",
                    marginBottom: 4,
                  }}
                >
                  TIME
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 900,
                    color: "#9f5fff",
                    fontFamily: "'Orbitron',monospace",
                    textShadow: "0 0 16px rgba(159,95,255,.7)",
                  }}
                >
                  14s
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 9,
                    color: "rgba(255,255,255,.3)",
                    letterSpacing: ".15em",
                    fontFamily: "'Orbitron',monospace",
                    marginBottom: 2,
                  }}
                >
                  OPP
                </div>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
                    color: "#f87171",
                    fontFamily: "'Orbitron',monospace",
                    lineHeight: 1,
                  }}
                >
                  10
                </div>
              </div>
            </div>
            {[
              { l: "18%", t: "42%", c: "#9f5fff" },
              { l: "58%", t: "24%", c: "#3b82f6" },
              { l: "72%", t: "62%", c: "#f43f5e" },
              { l: "32%", t: "68%", c: "#10b981" },
            ].map((t, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: t.l,
                  top: t.t,
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  background: `radial-gradient(circle at 35% 35%,${t.c},${t.c}88)`,
                  boxShadow: `0 0 14px ${t.c}88`,
                  border: `2px solid ${t.c}cc`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  cursor: "crosshair",
                }}
              >
                âœ•
              </div>
            ))}
            <div
              style={{
                position: "absolute",
                bottom: 10,
                right: 12,
                fontSize: 10,
                color: "#f87171",
                fontWeight: 700,
                fontFamily: "'Orbitron',monospace",
                background: "rgba(244,63,94,.1)",
                padding: "3px 8px",
                borderRadius: 6,
              }}
            >
              ðŸ”¥ COMBO Ã—3
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {feats.map((f, i) => (
            <div key={i} className="card" style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "18px 22px" }}>
              <div style={{ fontSize: 28, lineHeight: 1 }}>{f.icon}</div>
              <div>
                <div
                  style={{
                    fontFamily: "'Orbitron',monospace",
                    fontWeight: 700,
                    fontSize: 14,
                    marginBottom: 5,
                    color: "#fff",
                  }}
                >
                  {f.title}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,.42)",
                    fontSize: 14,
                    fontFamily: "'Rajdhani',sans-serif",
                    fontWeight: 500,
                    lineHeight: 1.5,
                  }}
                >
                  {f.desc}
                </div>
              </div>
            </div>
          ))}
          <Btn sz="lg" onClick={onPlay} pulse>
            <Zap size={15} /> Enter the Arena
          </Btn>
        </div>
      </div>
    </Sec>
  );
}

function Season({ weekStart }: { weekStart: number | null }) {
  const [cd, setCd] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      if (!weekStart) return;
      const end = weekStart + 7 * 86400000;
      const diff = Math.max(0, end - Date.now());
      const sec = Math.floor(diff / 1000);
      setCd({
        d: Math.floor(sec / 86400),
        h: Math.floor((sec % 86400) / 3600),
        m: Math.floor((sec % 3600) / 60),
        s: sec % 60,
      });
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [weekStart]);

  const rewards = [
    { rank: "#1", badge: "ðŸ‘‘", title: "Champion", perks: ["Diamond badge", "Hall of Fame entry", "Permanent rank record"] },
    { rank: "#2â€“5", badge: "ðŸ¥‡", title: "Elite", perks: ["Gold badge", "Top player archive", "Season title"] },
    { rank: "#6â€“20", badge: "ðŸ¥ˆ", title: "Contender", perks: ["Silver badge", "Weekly ranking credit", "Proven record"] },
  ];
  const tracked = [
    { icon: <Trophy size={16} />, label: "Wins", desc: "Total victories this week", c: "#4ade80" },
    { icon: <Target size={16} />, label: "Score", desc: "Cumulative targets hit", c: "#60a5fa" },
    { icon: <TrendingUp size={16} />, label: "ELO", desc: "Rating points gained / lost", c: "#b97fff" },
    { icon: <Users size={16} />, label: "Matches", desc: "Total games played this season", c: "#fbbf24" },
  ];
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <Sec id="season" tint="rgba(59,130,246,.022)">
      <Head
        label="Season System"
        title="Compete Weekly. Rise Permanently."
        sub="SAISEN runs 7-day competitive seasons. Prove your skill, secure your rank, and earn your place in the arena's permanent record."
      />

      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,.32)",
            letterSpacing: ".22em",
            fontFamily: "'Orbitron',monospace",
            marginBottom: 18,
            textTransform: "uppercase",
          }}
        >
          Season 1 Resets In
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          {(
            [
              ["DAYS", cd.d],
              ["HRS", cd.h],
              ["MIN", cd.m],
              ["SEC", cd.s],
            ] as const
          ).map(([l, v]) => (
            <div
              key={l}
              style={{
                background: "rgba(159,95,255,.07)",
                border: "1px solid rgba(159,95,255,.2)",
                borderRadius: 14,
                padding: "20px 24px",
                minWidth: 72,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "'Orbitron',monospace",
                  fontSize: 36,
                  fontWeight: 900,
                  color: "#b97fff",
                  lineHeight: 1,
                  textShadow: "0 0 14px rgba(159,95,255,.5)",
                }}
              >
                {pad(v)}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "rgba(255,255,255,.28)",
                  letterSpacing: ".2em",
                  marginTop: 6,
                  fontFamily: "'Orbitron',monospace",
                }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          gap: 22,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,.02)",
            border: "1px solid rgba(255,255,255,.07)",
            borderRadius: 18,
            padding: 28,
          }}
        >
          <div
            style={{
              fontFamily: "'Orbitron',monospace",
              fontSize: 11,
              fontWeight: 700,
              color: "rgba(255,255,255,.4)",
              marginBottom: 20,
              letterSpacing: ".18em",
            }}
          >
            ðŸ“Š WHAT&apos;S TRACKED
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {tracked.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    color: t.c,
                    width: 34,
                    height: 34,
                    background: `${t.c}14`,
                    borderRadius: 9,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {t.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Orbitron',monospace",
                      fontWeight: 700,
                      fontSize: 13,
                      color: "#fff",
                    }}
                  >
                    {t.label}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,.35)",
                      fontFamily: "'Rajdhani',sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    {t.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,.02)",
            border: "1px solid rgba(255,255,255,.07)",
            borderRadius: 18,
            padding: 28,
          }}
        >
          <div
            style={{
              fontFamily: "'Orbitron',monospace",
              fontSize: 11,
              fontWeight: 700,
              color: "rgba(255,255,255,.4)",
              marginBottom: 20,
              letterSpacing: ".18em",
            }}
          >
            ðŸ† END-OF-SEASON HONOURS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {rewards.map((r, i) => (
              <div
                key={r.title}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  padding: "13px 15px",
                  background: "rgba(255,255,255,.025)",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,.06)",
                }}
              >
                <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>{r.badge}</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <span
                      style={{
                        fontFamily: "'Orbitron',monospace",
                        fontWeight: 700,
                        fontSize: 13,
                        color: "#fff",
                      }}
                    >
                      {r.title}
                    </span>
                    <Tag color={i === 0 ? "#9f5fff" : i === 1 ? "#fbbf24" : "#94a3b8"}>{r.rank}</Tag>
                  </div>
                  {r.perks.map((p, j) => (
                    <div
                      key={j}
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,.4)",
                        fontFamily: "'Rajdhani',sans-serif",
                        fontWeight: 500,
                        lineHeight: 1.6,
                      }}
                    >
                      â€¢ {p}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          padding: "14px 22px",
          background: "rgba(159,95,255,.04)",
          border: "1px dashed rgba(159,95,255,.18)",
          borderRadius: 12,
        }}
      >
        <span
          style={{
            color: "rgba(255,255,255,.32)",
            fontSize: 13,
            fontFamily: "'Rajdhani',sans-serif",
            fontWeight: 500,
          }}
        >
          Additional features will be introduced as the system evolves. Additional rewards and systems are in development.
        </span>
      </div>
    </Sec>
  );
}


function Leaderboard({
  leaders,
  loading,
  playerAddr,
  onRefresh,
}: {
  leaders: LBRow[];
  loading: boolean;
  playerAddr: string;
  onRefresh: () => void;
}) {
  const [sortBy, setSortBy] = useState<"elo" | "wins" | "score" | "matches">("elo");
  const sorted = [...leaders].sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <Sec id="leaderboard" tint="rgba(244,63,94,.018)">
      <Head
        label="Live Leaderboard"
        title="Global Rankings"
        sub="Real-time standings updated after every match. Connect your wallet and play to appear here."
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 22,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(
            [
              ["elo", "ELO Rating"],
              ["wins", "Wins"],
              ["score", "Score"],
              ["matches", "Matches"],
            ] as const
          ).map(([k, l]) => (
            <button
              type="button"
              key={k}
              onClick={() => setSortBy(k)}
              style={{
                padding: "7px 14px",
                borderRadius: 8,
                border: "1px solid",
                cursor: "pointer",
                fontFamily: "'Orbitron',monospace",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: ".1em",
                transition: "all .2s",
                background: sortBy === k ? "rgba(159,95,255,.2)" : "transparent",
                borderColor: sortBy === k ? "rgba(159,95,255,.5)" : "rgba(255,255,255,.1)",
                color: sortBy === k ? "#b97fff" : "rgba(255,255,255,.4)",
              }}
            >
              {l}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "rgba(255,255,255,.3)",
              fontFamily: "'Rajdhani',sans-serif",
              fontWeight: 500,
            }}
          >
            <span
              className="pulse-dot"
              style={{
                width: 6,
                height: 6,
                background: "#10b981",
                borderRadius: "50%",
                display: "inline-block",
              }}
            />
            Live Â· auto-refreshes every 5s
          </div>
          <button
            type="button"
            onClick={onRefresh}
            style={{
              background: "none",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 8,
              color: "rgba(255,255,255,.4)",
              cursor: "pointer",
              padding: "6px 10px",
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              fontFamily: "'Orbitron',monospace",
              transition: "all .2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(159,95,255,.4)";
              e.currentTarget.style.color = "#b97fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,.1)";
              e.currentTarget.style.color = "rgba(255,255,255,.4)";
            }}
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "40px 1fr 80px 60px 60px 70px",
          gap: 8,
          padding: "8px 18px",
          fontSize: 9,
          color: "rgba(255,255,255,.25)",
          fontFamily: "'Orbitron',monospace",
          letterSpacing: ".15em",
          marginBottom: 6,
        }}
      >
        <div>#</div>
        <div>PLAYER</div>
        <div style={{ textAlign: "right" }}>ELO</div>
        <div style={{ textAlign: "right" }}>WINS</div>
        <div style={{ textAlign: "right" }}>SCORE</div>
        <div style={{ textAlign: "right" }}>MATCHES</div>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "42px 0",
            color: "rgba(255,255,255,.3)",
            fontSize: 13,
            fontFamily: "'Rajdhani',sans-serif",
          }}
        >
          <Spinner size={24} />
          <div style={{ marginTop: 12 }}>Loading leaderboardâ€¦</div>
        </div>
      ) : sorted.length === 0 ? (
        <div style={{ textAlign: "center", padding: "52px 22px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>ðŸ†</div>
          <div
            style={{
              fontFamily: "'Orbitron',monospace",
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 8,
              color: "rgba(255,255,255,.6)",
            }}
          >
            No entries yet
          </div>
          <div
            style={{
              color: "rgba(255,255,255,.3)",
              fontSize: 14,
              fontFamily: "'Rajdhani',sans-serif",
              fontWeight: 500,
            }}
          >
            Be the first to play and claim the #1 spot.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {sorted.map((p, i) => {
            const tier = getRank(p.elo);
            const isMe =
              playerAddr && p.addr.toLowerCase() === playerAddr.toLowerCase();
            return (
              <div
                key={p.addr}
                className="lb-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "40px 1fr 80px 60px 60px 70px",
                  gap: 8,
                  alignItems: "center",
                  padding: "13px 18px",
                  borderRadius: 13,
                  background: isMe
                    ? "rgba(159,95,255,.09)"
                    : i < 3
                      ? "rgba(255,255,255,.025)"
                      : "rgba(255,255,255,.015)",
                  border: isMe
                    ? "1px solid rgba(159,95,255,.35)"
                    : i < 3
                      ? "1px solid rgba(159,95,255,.1)"
                      : "1px solid rgba(255,255,255,.05)",
                  animationDelay: `${i * 0.05}s`,
                  transition: "all .2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = isMe
                    ? "rgba(159,95,255,.5)"
                    : "rgba(159,95,255,.22)";
                  e.currentTarget.style.transform = "translateX(3px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isMe
                    ? "rgba(159,95,255,.35)"
                    : i < 3
                      ? "rgba(159,95,255,.1)"
                      : "rgba(255,255,255,.05)";
                  e.currentTarget.style.transform = "";
                }}
              >
                <div
                  style={{
                    fontFamily: "'Orbitron',monospace",
                    fontWeight: 900,
                    fontSize: i < 3 ? 17 : 12,
                    color:
                      i === 0
                        ? "#f59e0b"
                        : i === 1
                          ? "#94a3b8"
                          : i === 2
                            ? "#b45309"
                            : "rgba(255,255,255,.3)",
                  }}
                >
                  {i === 0 ? "ðŸ‘‘" : i === 1 ? "ðŸ¥ˆ" : i === 2 ? "ðŸ¥‰" : `#${i + 1}`}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Orbitron',monospace",
                      fontWeight: 700,
                      fontSize: 13,
                      color: isMe ? "#b97fff" : "#fff",
                      marginBottom: 3,
                    }}
                  >
                    {isMe ? `${fmt(p.addr)} (You)` : fmt(p.addr)}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        fontSize: 11,
                        color: tier.c,
                        fontFamily: "'Orbitron',monospace",
                        fontWeight: 700,
                      }}
                    >
                      {tier.e} {tier.name}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,.2)",
                        fontFamily: "'Rajdhani',sans-serif",
                      }}
                    >
                      {p.wins}W/{p.losses}L
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "right",
                    fontFamily: "'Orbitron',monospace",
                    fontWeight: 700,
                    fontSize: 14,
                    color: tier.c,
                  }}
                >
                  {p.elo}
                </div>
                <div
                  style={{
                    textAlign: "right",
                    fontFamily: "'Orbitron',monospace",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#4ade80",
                  }}
                >
                  {p.wins}
                </div>
                <div
                  style={{
                    textAlign: "right",
                    fontFamily: "'Orbitron',monospace",
                    fontSize: 13,
                    color: "rgba(255,255,255,.55)",
                  }}
                >
                  {p.score}
                </div>
                <div
                  style={{
                    textAlign: "right",
                    fontFamily: "'Orbitron',monospace",
                    fontSize: 13,
                    color: "rgba(255,255,255,.35)",
                  }}
                >
                  {p.matches}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Sec>
  );
}

function Roadmap() {
  const phases = [
    {
      ph: "01",
      title: "Foundation",
      status: "active" as const,
      label: "Live Now",
      desc: "The arena is open. Core competitive systems are running.",
      items: [
        "Website & game launch (alpha)",
        "Real wallet connection (MetaMask / WalletConnect)",
        "Real-time global leaderboard",
        "Weekly competitive season system",
      ],
    },
    {
      ph: "02",
      title: "Core Systems",
      status: "upcoming" as const,
      label: "Improving Core",
      desc: "Deepening the gameplay experience and performance.",
      items: [
        "Game performance optimization",
        "Improved hit detection & responsiveness",
        "Enhanced visual feedback & animations",
        "Mobile optimization",
      ],
    },
    {
      ph: "03",
      title: "Competitive Layer",
      status: "upcoming" as const,
      label: "Expanding Competition",
      desc: "Building a true competitive ecosystem for serious players.",
      items: [
        "Advanced matchmaking & ELO refinement",
        "Rank tiers (Bronze â†’ Diamond)",
        "Anti-cheat system",
        "Player progression & badge system",
      ],
    },
    {
      ph: "04",
      title: "Arena Expansion",
      status: "upcoming" as const,
      label: "Building the Arena",
      desc: "Growing SAISEN into a full competitive platform.",
      items: [
        "Tournament mode",
        "Spectator mode",
        "Clan & team system",
        "Seasonal events & community competitions",
      ],
    },
  ];

  return (
    <Sec id="roadmap">
      <Head
        label="Roadmap"
        title="The Path Forward"
        sub="Four phases to build the ultimate skill-based competitive platform. Focused on product, performance, and players."
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
          gap: 18,
        }}
      >
        {phases.map((r, i) => (
          <div
            key={i}
            className="card"
            style={{
              padding: 28,
              position: "relative",
              overflow: "hidden",
              background:
                r.status === "active" ? "rgba(159,95,255,.07)" : "rgba(255,255,255,.02)",
              border:
                r.status === "active"
                  ? "1px solid rgba(159,95,255,.3)"
                  : "1px solid rgba(255,255,255,.07)",
            }}
          >
            {r.status === "active" && (
              <div style={{ position: "absolute", top: 16, right: 16 }}>
                <Tag color="#10b981">LIVE</Tag>
              </div>
            )}
            <div
              style={{
                fontFamily: "'Orbitron',monospace",
                fontSize: 42,
                fontWeight: 900,
                color: "rgba(159,95,255,.17)",
                marginBottom: 4,
                lineHeight: 1,
              }}
            >
              {r.ph}
            </div>
            <div
              style={{
                fontFamily: "'Orbitron',monospace",
                fontWeight: 700,
                fontSize: 17,
                marginBottom: 4,
                color: "#fff",
              }}
            >
              {r.title}
            </div>
            <div
              style={{
                fontSize: 11,
                color:
                  r.status === "active" ? "#10b981" : "rgba(255,255,255,.28)",
                fontFamily: "'Orbitron',monospace",
                letterSpacing: ".12em",
                marginBottom: 10,
              }}
            >
              {r.label}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,.38)",
                fontFamily: "'Rajdhani',sans-serif",
                fontWeight: 500,
                lineHeight: 1.55,
                marginBottom: 16,
              }}
            >
              {r.desc}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {r.items.map((item, j) => (
                <div
                  key={j}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 9,
                    fontSize: 13,
                    color:
                      r.status === "active"
                        ? "rgba(255,255,255,.7)"
                        : "rgba(255,255,255,.3)",
                    fontFamily: "'Rajdhani',sans-serif",
                    fontWeight: 500,
                  }}
                >
                  <span
                    style={{
                      color:
                        r.status === "active" ? "#10b981" : "rgba(255,255,255,.2)",
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {r.status === "active" ? "âœ“" : "â—‹"}
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p
        style={{
          textAlign: "center",
          marginTop: 28,
          fontSize: 12,
          color: "rgba(255,255,255,.2)",
          fontFamily: "'Rajdhani',sans-serif",
          fontWeight: 500,
        }}
      >
        Additional features will be introduced as the system evolves.
      </p>
    </Sec>
  );
}

function Footer() {
  const links = [
    ["Platform", ["Game", "Leaderboard", "Season", "Roadmap"]],
    ["Community", ["Twitter/X", "Discord", "Telegram"]],
  ] as const;
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(159,95,255,.1)",
        padding: "48px 22px",
        background: "rgba(0,0,0,.25)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 32,
            marginBottom: 36,
          }}
        >
          <div style={{ maxWidth: 270 }}>
            <div style={{ marginBottom: 14 }}>
              <LogoMark size={30} />
            </div>
            <p
              style={{
                color: "rgba(255,255,255,.3)",
                fontSize: 13,
                lineHeight: 1.7,
                fontFamily: "'Rajdhani',sans-serif",
                fontWeight: 500,
              }}
            >
              The premiere skill-based Web3 competitive game platform. Compete, perform, and dominate the arena.
            </p>
          </div>
          <div style={{ display: "flex", gap: 44, flexWrap: "wrap" }}>
            {links.map(([title, items]) => (
              <div key={title}>
                <div
                  style={{
                    fontFamily: "'Orbitron',monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "rgba(255,255,255,.25)",
                    letterSpacing: ".2em",
                    marginBottom: 16,
                  }}
                >
                  {title}
                </div>
                {items.map((l) => (
                  <div key={l} style={{ marginBottom: 10 }}>
                    <a
                      href="#"
                      style={{
                        color: "rgba(255,255,255,.42)",
                        fontSize: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontFamily: "'Rajdhani',sans-serif",
                        fontWeight: 500,
                        transition: "color .2s",
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#b97fff")}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "rgba(255,255,255,.42)")
                      }
                    >
                      {l} <ExternalLink size={10} />
                    </a>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            textAlign: "center",
            color: "rgba(255,255,255,.16)",
            fontSize: 12,
            fontFamily: "'Rajdhani',sans-serif",
            lineHeight: 1.7,
          }}
        >
          Â© {new Date().getFullYear()} SAISEN. All rights reserved. &nbsp;|&nbsp;
          <span style={{ color: "rgba(159,95,255,.5)" }}>
            Skill-based competitive platform. Additional features will be introduced as the system evolves.
          </span>
        </div>
      </div>
    </footer>
  );
}


type GameTarget = {
  id: string;
  x: number;
  y: number;
  sz: number;
  c: string;
  life: number;
};
type Burst = { id: string; x: number; y: number; c: string };
type Pop = { id: string; x: number; y: number; txt: string };
type GameResult = { won: boolean; ps: number; os: number };

function GameView({
  onBack,
  wallet,
  openModal,
  onGameEnd,
}: {
  onBack: () => void;
  wallet: Wallet;
  openModal: () => void;
  onGameEnd: (addr: string, won: boolean, score: number) => Promise<LBRow[]>;
}) {
  const [phase, setPhase] = useState("lobby");
  const [cdNum, setCdNum] = useState(3);
  const [tLeft, setTLeft] = useState(GAME_SECS);
  const [pScore, setPScore] = useState(0);
  const [oScore, setOScore] = useState(0);
  const [targets, setTgts] = useState<GameTarget[]>([]);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [popups, setPops] = useState<Pop[]>([]);
  const [combo, setCombo] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const [saving, setSaving] = useState(false);
  const r = useRef<{
    ps: number;
    os: number;
    combo: number;
    lastHit: number;
    spawnId: ReturnType<typeof setInterval> | undefined;
    oppId: ReturnType<typeof setInterval> | undefined;
    timerId: ReturnType<typeof setInterval> | undefined;
  }>({
    ps: 0,
    os: 0,
    combo: 0,
    lastHit: 0,
    spawnId: undefined,
    oppId: undefined,
    timerId: undefined,
  });

  const cleanup = () => {
    const x = r.current;
    if (x.spawnId !== undefined) clearInterval(x.spawnId);
    if (x.oppId !== undefined) clearInterval(x.oppId);
    if (x.timerId !== undefined) clearInterval(x.timerId);
  };

  const doEnd = useCallback(async () => {
    cleanup();
    setTgts([]);
    const won = r.current.ps > r.current.os;
    const res: GameResult = { won, ps: r.current.ps, os: r.current.os };
    setResult(res);
    setPhase("result");
    if (wallet.connected) {
      setSaving(true);
      await onGameEnd(wallet.address, won, r.current.ps);
      setSaving(false);
    }
  }, [wallet.connected, wallet.address, onGameEnd]);

  const startGame = () => {
    cleanup();
    r.current = {
      ps: 0,
      os: 0,
      combo: 0,
      lastHit: 0,
      spawnId: undefined,
      oppId: undefined,
      timerId: undefined,
    };
    setPScore(0);
    setOScore(0);
    setCombo(0);
    setTgts([]);
    setBursts([]);
    setPops([]);
    setTLeft(GAME_SECS);

    r.current.spawnId = setInterval(() => {
      const id = Math.random().toString(36).slice(2, 8);
      const life = Math.random() * 1200 + 850;
      const t: GameTarget = {
        id,
        x: Math.random() * 80 + 5,
        y: Math.random() * 72 + 8,
        sz: Math.floor(Math.random() * 18) + 34,
        c: TC[Math.floor(Math.random() * TC.length)]!,
        life,
      };
      setTgts((prev) => [...prev.slice(-14), t]);
      setTimeout(() => setTgts((prev) => prev.filter((x) => x.id !== id)), life);
    }, 640);

    r.current.oppId = setInterval(() => {
      if (Math.random() < 0.62) {
        r.current.os++;
        setOScore(r.current.os);
      }
    }, 1000);

    let tl = GAME_SECS;
    r.current.timerId = setInterval(() => {
      tl--;
      setTLeft(tl);
      if (tl <= 0) void doEnd();
    }, 1000);
    setPhase("playing");
  };

  const startCountdown = () => {
    setPhase("countdown");
    setCdNum(3);
    let c = 3;
    const iv = setInterval(() => {
      c--;
      setCdNum(c);
      if (c <= 0) {
        clearInterval(iv);
        startGame();
      }
    }, 800);
  };

  const hitTarget = (t: GameTarget, e: ReactMouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setTgts((prev) => prev.filter((x) => x.id !== t.id));
    r.current.ps++;
    setPScore(r.current.ps);
    const now = Date.now();
    const nc = now - r.current.lastHit < 550 ? r.current.combo + 1 : 1;
    r.current.combo = nc;
    r.current.lastHit = now;
    setCombo(nc);
    const bid = Math.random().toString(36).slice(2, 7);
    setBursts((prev) => [...prev.slice(-8), { id: bid, x: t.x, y: t.y, c: t.c }]);
    setTimeout(
      () => setBursts((prev) => prev.filter((b) => b.id !== bid)),
      500,
    );
    const pid = Math.random().toString(36).slice(2, 7);
    setPops((prev) => [
      ...prev.slice(-6),
      {
        id: pid,
        x: t.x,
        y: t.y,
        txt: nc > 2 ? `+1 ðŸ”¥Ã—${nc}` : "+1",
      },
    ]);
    setTimeout(() => setPops((prev) => prev.filter((p) => p.id !== pid)), 900);
  };

  const timePct = (tLeft / GAME_SECS) * 100;
  const timerC = tLeft > 15 ? "#9f5fff" : tLeft > 7 ? "#f59e0b" : "#f43f5e";
  const circ = 2 * Math.PI * 30;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#06060f",
        display: "flex",
        flexDirection: "column",
        color: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "11px 20px",
          borderBottom: "1px solid rgba(159,95,255,.09)",
          background: "rgba(6,6,15,.9)",
          backdropFilter: "blur(14px)",
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,.4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            padding: "6px 10px",
            borderRadius: 8,
            fontFamily: "'Rajdhani',sans-serif",
            fontWeight: 600,
            transition: "all .2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,.05)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "";
            e.currentTarget.style.color = "rgba(255,255,255,.4)";
          }}
        >
          â† Back
        </button>
        <LogoMark size={28} />
        <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
          {wallet.connected ? (
            <div
              style={{
                background: "rgba(16,185,129,.09)",
                border: "1px solid rgba(16,185,129,.22)",
                borderRadius: 8,
                padding: "4px 11px",
                fontSize: 11,
                fontFamily: "'Orbitron',monospace",
                color: "#34d399",
                fontWeight: 700,
              }}
            >
              {fmt(wallet.address)}
            </div>
          ) : (
            <Btn sz="xs" v="outline" onClick={openModal}>
              <Wallet size={10} /> Connect to save stats
            </Btn>
          )}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "22px 18px",
        }}
      >
        {phase === "lobby" && (
          <div style={{ textAlign: "center", maxWidth: 480, width: "100%" }}>
            <div className="float" style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <ToriiIcon size={72} glowing />
            </div>
            <h2
              style={{
                fontFamily: "'Orbitron',monospace",
                fontSize: "clamp(22px,4vw,34px)",
                fontWeight: 900,
                marginBottom: 10,
              }}
            >
              Ready to Compete?
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,.4)",
                marginBottom: 24,
                lineHeight: 1.7,
                fontSize: 15,
                fontFamily: "'Rajdhani',sans-serif",
                fontWeight: 500,
              }}
            >
              Click targets faster than your opponent in 30 seconds. Outscore them to claim the win.
            </p>
            {!wallet.connected && (
              <div
                style={{
                  marginBottom: 24,
                  padding: "13px 18px",
                  background: "rgba(251,191,36,.06)",
                  border: "1px solid rgba(251,191,36,.2)",
                  borderRadius: 12,
                  fontSize: 13,
                  color: "#fbbf24",
                  fontFamily: "'Rajdhani',sans-serif",
                  fontWeight: 500,
                }}
              >
                âš ï¸ Connect your wallet to save stats to the leaderboard.{" "}
                <button
                  type="button"
                  onClick={openModal}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#fbbf24",
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontFamily: "'Rajdhani',sans-serif",
                    fontSize: 13,
                  }}
                >
                  Connect now
                </button>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginBottom: 32 }}>
              {[
                ["ðŸŽ¯ Objective", "Highest score wins", "#b97fff"],
                ["â±ï¸ Duration", "30 seconds", "#60a5fa"],
                ["ðŸ† Win ELO", "+22 rating points", "#4ade80"],
                ["ðŸ’” Loss ELO", "-13 rating points", "#f87171"],
              ].map(([k, v, c]) => (
                <div
                  key={String(k)}
                  style={{
                    background: "rgba(255,255,255,.03)",
                    border: "1px solid rgba(255,255,255,.07)",
                    borderRadius: 12,
                    padding: "14px 16px",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,.35)",
                      marginBottom: 5,
                      fontFamily: "'Rajdhani',sans-serif",
                    }}
                  >
                    {k}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Orbitron',monospace",
                      fontWeight: 700,
                      fontSize: 13,
                      color: c,
                    }}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>
            <Btn sz="xl" onClick={startCountdown} pulse>
              <Zap size={15} /> Start Match
            </Btn>
          </div>
        )}

        {phase === "countdown" && (
          <div style={{ textAlign: "center" }}>
            <div
              key={cdNum}
              style={{
                fontFamily: "'Orbitron',monospace",
                fontSize: 120,
                fontWeight: 900,
                color: "#9f5fff",
                textShadow: "0 0 50px rgba(159,95,255,.8)",
                animation: "cd-zoom .45s cubic-bezier(.34,1.56,.64,1)",
                lineHeight: 1,
              }}
            >
              {cdNum > 0 ? cdNum : "GO!"}
            </div>
            <div
              style={{
                fontFamily: "'Orbitron',monospace",
                fontSize: 13,
                color: "rgba(255,255,255,.38)",
                marginTop: 18,
                letterSpacing: ".28em",
              }}
            >
              GET READY
            </div>
          </div>
        )}

        {phase === "playing" && (
          <div style={{ width: "100%", maxWidth: 900, display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center",
                gap: 14,
                padding: "12px 20px",
                background: "rgba(0,0,0,.55)",
                borderRadius: 16,
                border: "1px solid rgba(159,95,255,.13)",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "'Orbitron',monospace",
                    fontSize: 9,
                    color: "rgba(255,255,255,.3)",
                    letterSpacing: ".18em",
                    marginBottom: 3,
                  }}
                >
                  YOU
                </div>
                <div
                  style={{
                    fontFamily: "'Orbitron',monospace",
                    fontSize: 42,
                    fontWeight: 900,
                    color: "#4ade80",
                    lineHeight: 1,
                    textShadow: "0 0 16px rgba(74,222,128,.5)",
                  }}
                >
                  {pScore}
                </div>
                {combo > 1 && (
                  <div
                    style={{
                      fontFamily: "'Orbitron',monospace",
                      fontSize: 11,
                      color: "#f87171",
                      marginTop: 3,
                    }}
                  >
                    ðŸ”¥ Ã—{combo}
                  </div>
                )}
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ position: "relative", width: 72, height: 72 }}>
                  <svg width="72" height="72" style={{ transform: "rotate(-90deg)", display: "block" }}>
                    <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="5" />
                    <circle
                      cx="36"
                      cy="36"
                      r="30"
                      fill="none"
                      stroke={timerC}
                      strokeWidth="5"
                      strokeDasharray={`${(circ * timePct) / 100} ${circ}`}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dasharray .6s linear,stroke .5s" }}
                    />
                  </svg>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'Orbitron',monospace",
                      fontSize: 20,
                      fontWeight: 900,
                      color: timerC,
                    }}
                  >
                    {tLeft}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "'Orbitron',monospace",
                    fontSize: 9,
                    color: "rgba(255,255,255,.22)",
                    letterSpacing: ".18em",
                    marginTop: 4,
                  }}
                >
                  VS
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: "'Orbitron',monospace",
                    fontSize: 9,
                    color: "rgba(255,255,255,.3)",
                    letterSpacing: ".18em",
                    marginBottom: 3,
                  }}
                >
                  OPP
                </div>
                <div
                  style={{
                    fontFamily: "'Orbitron',monospace",
                    fontSize: 42,
                    fontWeight: 900,
                    color: "#f87171",
                    lineHeight: 1,
                    textShadow: "0 0 16px rgba(248,113,113,.5)",
                  }}
                >
                  {oScore}
                </div>
              </div>
            </div>

            <div
              style={{
                width: "100%",
                height: "min(480px,54vh)",
                background: "#080818",
                borderRadius: 20,
                border: "1px solid rgba(159,95,255,.12)",
                position: "relative",
                overflow: "hidden",
                cursor: "crosshair",
                backgroundImage:
                  "linear-gradient(rgba(159,95,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(159,95,255,.04) 1px,transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 50%, rgba(0,0,0,.4) 100%)",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />
              {targets.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  className="target-node"
                  onClick={(e) => hitTarget(t, e)}
                  style={{
                    position: "absolute",
                    left: `${t.x}%`,
                    top: `${t.y}%`,
                    transform: "translate(-50%,-50%)",
                    width: t.sz,
                    height: t.sz,
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 38% 34%,${t.c}ff,${t.c}88)`,
                    boxShadow: `0 0 12px ${t.c}88,0 0 28px ${t.c}44`,
                    border: `2px solid ${t.c}dd`,
                    cursor: "crosshair",
                    padding: 0,
                    outline: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: t.sz * 0.36,
                    color: "rgba(255,255,255,.5)",
                    fontFamily: "monospace",
                    fontWeight: 700,
                    zIndex: 2,
                  }}
                >
                  Ã—
                </button>
              ))}
              {bursts.map((b) => (
                <div
                  key={b.id}
                  style={{
                    position: "absolute",
                    left: `${b.x}%`,
                    top: `${b.y}%`,
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: `${b.c}30`,
                    border: `2px solid ${b.c}99`,
                    animation: "burst .5s ease-out forwards",
                    pointerEvents: "none",
                    zIndex: 3,
                  }}
                />
              ))}
              {popups.map((p) => (
                <div
                  key={p.id}
                  style={{
                    position: "absolute",
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    transform: "translateX(-50%)",
                    fontFamily: "'Orbitron',monospace",
                    fontWeight: 900,
                    fontSize: 16,
                    color: "#fff",
                    textShadow: "0 0 10px rgba(159,95,255,.8)",
                    animation: "score-pop .9s ease-out forwards",
                    pointerEvents: "none",
                    whiteSpace: "nowrap",
                    zIndex: 4,
                  }}
                >
                  {p.txt}
                </div>
              ))}
              <div
                style={{
                  position: "absolute",
                  bottom: 10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontFamily: "'Orbitron',monospace",
                  fontSize: 9,
                  color: "rgba(255,255,255,.1)",
                  letterSpacing: ".2em",
                  pointerEvents: "none",
                }}
              >
                CLICK TARGETS TO SCORE
              </div>
            </div>
          </div>
        )}

        {phase === "result" && result && (
          <div style={{ textAlign: "center", maxWidth: 500, width: "100%" }}>
            <div className="float" style={{ fontSize: 72, marginBottom: 16 }}>
              {result.won ? "ðŸ†" : "ðŸ’€"}
            </div>
            <h2
              className={result.won ? "win-txt font-display" : "lose-txt font-display"}
              style={{
                fontFamily: "'Orbitron',monospace",
                fontSize: "clamp(34px,6vw,52px)",
                fontWeight: 900,
                marginBottom: 10,
                color: result.won ? "#4ade80" : "#f87171",
              }}
            >
              {result.won ? "VICTORY!" : "DEFEAT"}
            </h2>
            <div
              style={{
                fontFamily: "'Orbitron',monospace",
                fontSize: 24,
                fontWeight: 900,
                color: "rgba(255,255,255,.4)",
                marginBottom: 28,
              }}
            >
              {result.ps} â€” {result.os}
            </div>
            <div
              style={{
                background: result.won ? "rgba(74,222,128,.07)" : "rgba(248,113,113,.07)",
                border: `1px solid ${result.won ? "rgba(74,222,128,.2)" : "rgba(248,113,113,.2)"}`,
                borderRadius: 16,
                padding: "22px 28px",
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  fontFamily: "'Orbitron',monospace",
                  fontSize: 10,
                  color: "rgba(255,255,255,.3)",
                  letterSpacing: ".2em",
                  marginBottom: 12,
                }}
              >
                ELO CHANGE
              </div>
              <div
                style={{
                  fontFamily: "'Orbitron',monospace",
                  fontSize: 34,
                  fontWeight: 900,
                  color: result.won ? "#4ade80" : "#f87171",
                  textShadow: `0 0 20px ${result.won ? "rgba(74,222,128,.5)" : "rgba(248,113,113,.5)"}`,
                }}
              >
                {result.won ? "+22" : "-13"} ELO
              </div>
              {saving && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    marginTop: 12,
                    fontSize: 12,
                    color: "rgba(255,255,255,.3)",
                    fontFamily: "'Rajdhani',sans-serif",
                  }}
                >
                  <Spinner size={12} /> Saving to leaderboardâ€¦
                </div>
              )}
              {!wallet.connected && (
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 12,
                    color: "rgba(251,191,36,.7)",
                    fontFamily: "'Rajdhani',sans-serif",
                  }}
                >
                  Connect wallet to save your stats.{" "}
                  <button
                    type="button"
                    onClick={openModal}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#fbbf24",
                      textDecoration: "underline",
                      cursor: "pointer",
                      fontFamily: "'Rajdhani',sans-serif",
                      fontSize: 12,
                    }}
                  >
                    Connect
                  </button>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Btn sz="lg" onClick={startCountdown} pulse>
                <Zap size={14} /> Play Again
              </Btn>
              <Btn
                sz="lg"
                v="outline"
                onClick={() => {
                  cleanup();
                  setPhase("lobby");
                  setResult(null);
                }}
              >
                Lobby
              </Btn>
              <Btn sz="lg" v="ghost" onClick={onBack}>
                Menu
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SaisenApp() {
  const [view, setView] = useState<"landing" | "game">("landing");
  const [wallet, setWallet] = useState<Wallet>({
    connected: false,
    address: "",
    elo: 1200,
  });
  const [showModal, setShowModal] = useState(false);
  const [leaders, setLeaders] = useState<LBRow[]>([]);
  const [lbLoading, setLbLoading] = useState(true);
  const [weekStart, setWeekStart] = useState<number | null>(null);

  useEffect(() => {
    void getWeekStart().then(setWeekStart);
    void refreshLB();
    const iv = setInterval(() => void refreshLB(), 5000);
    return () => clearInterval(iv);
  }, []);

  const refreshLB = async () => {
    const data = await loadLB();
    setLeaders(data);
    setLbLoading(false);
  };

  const connectWallet = (addr: string) => {
    const p = leaders.find((x) => x.addr.toLowerCase() === addr.toLowerCase());
    setWallet({ connected: true, address: addr, elo: p?.elo ?? 1200 });
    setShowModal(false);
  };

  const onGameEnd = useCallback(async (addr: string, won: boolean, score: number) => {
    const updated = await upsertPlayer(addr, won, score);
    setLeaders(updated);
    const me = updated.find((p) => p.addr.toLowerCase() === addr.toLowerCase());
    if (me) setWallet((prev) => ({ ...prev, elo: me.elo }));
    return updated;
  }, []);

  if (view === "game") {
    return (
      <>
        <style>{CSS}</style>
        {showModal && (
          <WalletModal onConnect={connectWallet} onClose={() => setShowModal(false)} />
        )}
        <GameView
          onBack={() => setView("landing")}
          wallet={wallet}
          openModal={() => setShowModal(true)}
          onGameEnd={onGameEnd}
        />
      </>
    );
  }

  return (
    <div style={{ background: "#06060f", minHeight: "100vh", color: "#fff" }}>
      <style>{CSS}</style>
      {showModal && (
        <WalletModal onConnect={connectWallet} onClose={() => setShowModal(false)} />
      )}
      <Nav wallet={wallet} openModal={() => setShowModal(true)} onPlay={() => setView("game")} />
      <Hero onPlay={() => setView("game")} openModal={() => setShowModal(true)} wallet={wallet} />
      <About />
      <Gameplay onPlay={() => setView("game")} />
      <Season weekStart={weekStart} />
      <Leaderboard
        leaders={leaders}
        loading={lbLoading}
        playerAddr={wallet.address}
        onRefresh={refreshLB}
      />
      <Roadmap />
      <Footer />
    </div>
  );
}

