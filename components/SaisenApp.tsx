"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type CSSProperties,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";

type WalletState = { connected: boolean; address: string };
type GameTarget = {
  id: string;
  x: number;
  y: number;
  sz: number;
  c: string;
  life: number;
};
type BurstFx = { id: string; x: number; y: number; c: string };
type ScorePopup = { id: string; x: number; y: number; txt: string };
type GameEndResult = {
  won: boolean;
  playerScore: number;
  opponentScore: number;
};
type GameTimerRef = {
  ps: number;
  os: number;
  combo: number;
  lastHit: number;
  spawnId: ReturnType<typeof setInterval> | undefined;
  oppId: ReturnType<typeof setInterval> | undefined;
  timerId: ReturnType<typeof setInterval> | undefined;
};
type BtnVariant = "primary" | "outline" | "blue" | "danger" | "ghost";
type BtnSize = "xs" | "sm" | "md" | "lg" | "xl";

const GAME_SECS = 30;

const LEADERS = [
  { rank: 1, name: "0xNe0n", wins: 247, pts: "1,235,000", elo: 2847, badge: "👑" },
  { rank: 2, name: "CyberSlash", wins: 198, pts: "990,000", elo: 2712, badge: "⚡" },
  { rank: 3, name: "GhostByte", wins: 175, pts: "875,000", elo: 2634, badge: "🔥" },
  { rank: 4, name: "NeonViper", wins: 142, pts: "710,000", elo: 2521, badge: "" },
  { rank: 5, name: "ShadowX", wins: 131, pts: "655,000", elo: 2487, badge: "" },
  { rank: 6, name: "Quantz", wins: 118, pts: "590,000", elo: 2401, badge: "" },
  { rank: 7, name: "RiftWalker", wins: 105, pts: "525,000", elo: 2356, badge: "" },
  {
    rank: 8,
    name: "YOU",
    wins: 0,
    pts: "—",
    elo: 1200,
    badge: "🎮",
    isPlayer: true,
  },
];
const NFTS = [
  { name: "Neon Phantom", rarity: "LEGENDARY", price: "5,000 PTS", emoji: "🌌", c: "#9f5fff" },
  { name: "Cyber Samurai", rarity: "EPIC", price: "2,500 PTS", emoji: "⚔️", c: "#3b82f6" },
  { name: "Ghost Protocol", rarity: "RARE", price: "1,000 PTS", emoji: "👻", c: "#10b981" },
  { name: "Red Daemon", rarity: "EPIC", price: "2,000 PTS", emoji: "🔮", c: "#f43f5e" },
  { name: "Zero Unit", rarity: "RARE", price: "800 PTS", emoji: "🤖", c: "#06b6d4" },
  { name: "Void Walker", rarity: "UNCOMMON", price: "400 PTS", emoji: "🌑", c: "#6366f1" },
];
const ROADMAP = [
  {
    ph: "01",
    title: "Alpha Launch",
    status: "active",
    items: ["Game live", "Website", "Mock wallet", "Leaderboard"],
  },
  {
    ph: "02",
    title: "NFT Drop",
    status: "upcoming",
    items: ["Character skins", "On-chain market", "Trait system", "Holder perks"],
  },
  {
    ph: "03",
    title: "Ecosystem",
    status: "upcoming",
    items: ["Token launch", "Reward rails", "Staking roadmap", "DAO vote"],
  },
  {
    ph: "04",
    title: "Tournaments",
    status: "upcoming",
    items: ["Seasonal cups", "Prize pools", "Sponsorships", "Pro league"],
  },
];
const RARITY_CLR = {
  LEGENDARY: "#f59e0b",
  EPIC: "#9f5fff",
  RARE: "#3b82f6",
  UNCOMMON: "#10b981",
} as const;
const TARGET_COLORS = [
  "#9f5fff",
  "#3b82f6",
  "#f43f5e",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');

  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-track{background:#06060f}
  ::-webkit-scrollbar-thumb{background:linear-gradient(#9f5fff,#3b82f6);border-radius:2px}

  @keyframes glow-pulse{
    0%,100%{text-shadow:0 0 8px #9f5fff,0 0 20px rgba(159,95,255,.4)}
    50%{text-shadow:0 0 16px #b97fff,0 0 40px #9f5fff,0 0 60px rgba(159,95,255,.3)}
  }
  @keyframes grid-drift{from{background-position:0 0}to{background-position:50px 50px}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
  @keyframes btn-glow{
    0%,100%{box-shadow:0 0 16px rgba(159,95,255,.45),0 4px 24px rgba(0,0,0,.4)}
    50%{box-shadow:0 0 32px rgba(159,95,255,.8),0 4px 24px rgba(0,0,0,.4)}
  }
  @keyframes slide-up{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
  @keyframes appear{from{transform:scale(.4) rotate(-15deg);opacity:0}to{transform:scale(1) rotate(0);opacity:1}}
  @keyframes burst{0%{transform:translate(-50%,-50%) scale(0);opacity:.7}100%{transform:translate(-50%,-50%) scale(3.5);opacity:0}}
  @keyframes score-pop{0%{transform:translateY(0) scale(1.2);opacity:1}100%{transform:translateY(-55px) scale(.9);opacity:0}}
  @keyframes cd-zoom{from{transform:scale(2.5);opacity:0}to{transform:scale(1);opacity:1}}
  @keyframes shimmer{from{background-position:-200% center}to{background-position:200% center}}
  @keyframes flicker{0%,100%{opacity:1}91%,95%{opacity:.7}93%{opacity:.45}}
  @keyframes scan{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}

  .font-display{font-family:'Orbitron',monospace}
  .font-body{font-family:'Rajdhani',sans-serif}
  .glow{animation:glow-pulse 2.5s ease-in-out infinite}
  .float{animation:float 3.8s ease-in-out infinite}
  .pulse{animation:btn-glow 2s ease-in-out infinite}
  .slide-up{animation:slide-up .55s ease-out both}
  .flicker{animation:flicker 6s ease-in-out infinite}
  .shimmer{
    background:linear-gradient(90deg,rgba(255,255,255,.6) 0%,#fff 35%,rgba(255,255,255,.6) 65%,rgba(255,255,255,.35) 100%);
    background-size:200% auto;
    animation:shimmer 3.5s linear infinite;
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text
  }
  .card{
    background:rgba(255,255,255,.025);
    border:1px solid rgba(159,95,255,.13);
    border-radius:16px;
    backdrop-filter:blur(12px);
    transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease
  }
  .card:hover{
    transform:translateY(-5px);
    box-shadow:0 24px 48px rgba(159,95,255,.14);
    border-color:rgba(159,95,255,.35)
  }
  .target-node{
    animation:appear .16s cubic-bezier(.34,1.56,.64,1);
    transition:transform .08s ease
  }
  .target-node:hover{transform:translate(-50%,-50%) scale(1.12)!important}
  .target-node:active{transform:translate(-50%,-50%) scale(.88)!important}
`;

const Btn = ({
  children,
  onClick,
  v = "primary",
  sz = "md",
  pulse = false,
  style: sx = {},
}: {
  children: ReactNode;
  onClick?: () => void;
  v?: BtnVariant;
  sz?: BtnSize;
  pulse?: boolean;
  style?: CSSProperties;
}) => {
  const base: CSSProperties = {
    cursor: "pointer",
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
  };
  const variants: Record<BtnVariant, CSSProperties> = {
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
    blue: {
      background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
      color: "#fff",
      boxShadow: "0 0 20px rgba(59,130,246,.4)",
    },
    danger: {
      background: "linear-gradient(135deg,#f43f5e,#be123c)",
      color: "#fff",
      boxShadow: "0 0 20px rgba(244,63,94,.4)",
    },
    ghost: {
      background: "rgba(255,255,255,.05)",
      color: "rgba(255,255,255,.65)",
      border: "1px solid rgba(255,255,255,.1)",
    },
  };
  const sizes: Record<BtnSize, CSSProperties> = {
    xs: { padding: "5px 10px", fontSize: 10, borderRadius: 6 },
    sm: { padding: "8px 16px", fontSize: 11, borderRadius: 8 },
    md: { padding: "11px 22px", fontSize: 12, borderRadius: 10 },
    lg: { padding: "15px 34px", fontSize: 14, borderRadius: 12 },
    xl: { padding: "18px 44px", fontSize: 15, borderRadius: 13 },
  };
  return (
    <button
      type="button"
      className={pulse ? "pulse" : ""}
      style={{ ...base, ...variants[v], ...sizes[sz], ...sx }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.filter = "brightness(1.18)";
        e.currentTarget.style.transform = "scale(1.045)";
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
  children: ReactNode;
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
  children: ReactNode;
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
        background: "linear-gradient(135deg,#fff 0%,rgba(255,255,255,.65) 100%)",
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

function Nav({
  wallet,
  connect,
  onPlay,
}: {
  wallet: WalletState;
  connect: () => void;
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
    ["Token", "#token"],
    ["NFTs", "#nfts"],
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
          fontFamily: "'Orbitron',monospace",
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
          <a
            href="#hero"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              color: "white",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                background: "linear-gradient(135deg,#9f5fff,#3b82f6)",
                borderRadius: 9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 17,
                boxShadow: "0 0 14px rgba(159,95,255,.5)",
              }}
            >
              ⚡
            </div>
            <span
              className="flicker"
              style={{ fontWeight: 900, fontSize: 19, letterSpacing: ".18em" }}
            >
              SAISEN
            </span>
          </a>

          <div
            className="hidden min-[900px]:flex"
            style={{ gap: 32 }}
          >
            {links.map(([lbl, href]) => (
              <a
                key={lbl}
                href={href}
                style={{
                  color: "rgba(255,255,255,.5)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".12em",
                  transition: "color .2s",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#b97fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255,255,255,.5)";
                }}
              >
                {lbl}
              </a>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {wallet.connected && (
              <div
                className="hidden min-[480px]:block"
                style={{
                  background: "rgba(16,185,129,.1)",
                  border: "1px solid rgba(16,185,129,.25)",
                  borderRadius: 8,
                  padding: "5px 12px",
                  fontSize: 11,
                  color: "#34d399",
                  fontWeight: 700,
                }}
              >
                {wallet.address.slice(0, 6)}…{wallet.address.slice(-4)}
              </div>
            )}
            {!wallet.connected && (
              <Btn sz="sm" v="outline" onClick={connect}>
                <Wallet size={12} /> Connect
              </Btn>
            )}
            <Btn sz="sm" onClick={onPlay} pulse>
              <Zap size={12} /> Play
            </Btn>
            <button
              type="button"
              className="min-[900px]:hidden"
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
              {open ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
      </nav>

      {open && (
        <div
          className="min-[900px]:hidden"
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
          {links.map(([lbl, href]) => (
            <a
              key={lbl}
              href={href}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                padding: "12px 0",
                color: "rgba(255,255,255,.7)",
                fontSize: 15,
                fontWeight: 600,
                borderBottom: "1px solid rgba(255,255,255,.04)",
                textDecoration: "none",
                fontFamily: "'Rajdhani',sans-serif",
                letterSpacing: ".06em",
              }}
            >
              {lbl}
            </a>
          ))}
          <div
            style={{
              marginTop: 16,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {!wallet.connected && (
              <Btn
                sz="sm"
                v="outline"
                onClick={() => {
                  connect();
                  setOpen(false);
                }}
              >
                <Wallet size={12} /> Connect Wallet
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
              <Zap size={12} /> Play Now
            </Btn>
          </div>
        </div>
      )}
    </>
  );
}

function Hero({
  onPlay,
  connect,
  wallet,
}: {
  onPlay: () => void;
  connect: () => void;
  wallet: WalletState;
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
          opacity: 0.13,
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
            "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(159,95,255,.14) 0%, transparent 70%)",
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
            "radial-gradient(circle,rgba(59,130,246,.1) 0%,transparent 65%)",
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
            "radial-gradient(circle,rgba(244,63,94,.07) 0%,transparent 65%)",
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
            background: "rgba(159,95,255,.1)",
            border: "1px solid rgba(159,95,255,.28)",
            borderRadius: 999,
            padding: "6px 18px",
            marginBottom: 36,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".18em",
            color: "#b97fff",
            fontFamily: "'Orbitron',monospace",
            animationDelay: ".1s",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              background: "#10b981",
              borderRadius: "50%",
              boxShadow: "0 0 6px #10b981",
              display: "inline-block",
            }}
          />
          SEASON 1 — LIVE NOW
        </div>

        <motion.h1
          className="glow font-display slide-up"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          style={{
            fontSize: "clamp(56px,12vw,160px)",
            fontWeight: 900,
            letterSpacing: "-.02em",
            lineHeight: 0.88,
            marginBottom: 20,
          }}
        >
          SAISEN
        </motion.h1>

        <p
          className="shimmer font-display slide-up"
          style={{
            fontSize: "clamp(14px,2vw,20px)",
            letterSpacing: ".25em",
            marginBottom: 16,
            animationDelay: ".36s",
          }}
        >
          COMPETE · EARN · DOMINATE
        </p>

        <p
          className="slide-up"
          style={{
            color: "rgba(255,255,255,.42)",
            fontSize: 15,
            maxWidth: 460,
            margin: "0 auto 42px",
            lineHeight: 1.75,
            fontFamily: "'Rajdhani',sans-serif",
            fontWeight: 500,
            animationDelay: ".48s",
          }}
        >
          The first fully skill-based competitive arena. Win reaction duels, climb
          the leaderboard, and get ready for rewards when the token system goes
          live.
        </p>

        <div
          className="slide-up"
          style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 52,
            animationDelay: ".58s",
          }}
        >
          <Btn sz="xl" onClick={onPlay} pulse>
            <Zap size={17} /> Play Now
          </Btn>
          {!wallet.connected ? (
            <Btn sz="xl" v="outline" onClick={connect}>
              <Wallet size={17} /> Connect Wallet
            </Btn>
          ) : (
            <Btn
              sz="xl"
              v="outline"
              style={{ pointerEvents: "none" }}
            >
              <Award size={17} /> Connected ✓
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
            animationDelay: ".7s",
          }}
        >
          {[
            ["12,847", "Players Online"],
            ["Season 1", "Live"],
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
                  color: "rgba(255,255,255,.35)",
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
      icon: <Zap size={22} />,
      title: "Skill Over Luck",
      desc: "Every match is a pure test of reflexes and precision. Zero randomness, zero pay-to-win mechanics.",
      c: "#9f5fff",
    },
    {
      icon: <Trophy size={22} />,
      title: "Climb the Ranks",
      desc: "Performance shapes your standing. Better runs earn bragging rights, badges, and future-season perks.",
      c: "#f59e0b",
    },
    {
      icon: <Shield size={22} />,
      title: "Not Gambling",
      desc: "No house edge. No random outcomes. Pure 1v1 competitive gameplay.",
      c: "#10b981",
    },
    {
      icon: <TrendingUp size={22} />,
      title: "Seasonal Goals",
      desc: "Seasons reset the ladder, add new cosmetics, and unlock fresh challenges for everyone.",
      c: "#3b82f6",
    },
  ];
  return (
    <Sec id="about" tint="rgba(159,95,255,.025)">
      <Head
        label="About SAISEN"
        title="Compete. Improve. Dominate."
        sub="SAISEN is a skill-first arena where outcomes follow your reflexes and strategy — not chance."
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
            style={{ padding: 28, animationDelay: `${i * 0.1}s` }}
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
                color: "rgba(255,255,255,.48)",
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
    {
      icon: "⚡",
      title: "1v1 Fast Matches",
      desc: "30-second adrenaline duels. No downtime, no stalling.",
    },
    {
      icon: "🎯",
      title: "Reaction-Based",
      desc: "Click targets faster than your opponent. Pure reflex skill.",
    },
    {
      icon: "🏆",
      title: "ELO / MMR Ladder",
      desc: "Compete globally. Your rank determines your matchmaking tier.",
    },
    {
      icon: "🎖️",
      title: "Seasonal Perks",
      desc: "Top ranks unlock cosmetics, badges, and tournament seeds.",
    },
  ];
  return (
    <Sec id="game">
      <Head
        label="Gameplay"
        title="Fast. Brutal. Rewarding."
        sub="Reaction-based duels where every millisecond counts and skill is the only currency."
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
          gap: 44,
          alignItems: "center",
        }}
      >
        <div
          className="float"
          style={{
            background: "rgba(6,6,15,.9)",
            border: "1px solid rgba(159,95,255,.22)",
            borderRadius: 22,
            padding: 5,
            boxShadow: "0 0 50px rgba(159,95,255,.12)",
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
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontSize: 9,
                    color: "rgba(255,255,255,.35)",
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
                    color: "rgba(255,255,255,.35)",
                    letterSpacing: ".15em",
                    fontFamily: "'Orbitron',monospace",
                    marginBottom: 2,
                  }}
                >
                  BOT
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
              { l: "18%", t: "40%", c: "#9f5fff" },
              { l: "58%", t: "22%", c: "#3b82f6" },
              { l: "72%", t: "60%", c: "#f43f5e" },
              { l: "32%", t: "65%", c: "#10b981" },
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
                  background: `radial-gradient(circle at 35% 35%, ${t.c}, ${t.c}88)`,
                  boxShadow: `0 0 14px ${t.c}90`,
                  border: `2px solid ${t.c}cc`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  cursor: "crosshair",
                }}
              >
                ✕
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
              🔥 COMBO ×3
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {feats.map((f, i) => (
            <div
              key={i}
              className="card"
              style={{
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
                padding: "18px 22px",
              }}
            >
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
                    color: "rgba(255,255,255,.45)",
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
          <Btn sz="lg" onClick={onPlay} style={{ marginTop: 6 }} pulse>
            <Zap size={16} /> Enter the Arena
          </Btn>
        </div>
      </div>
    </Sec>
  );
}

function TokenPlaceholder() {
  return (
    <Sec id="token" tint="rgba(59,130,246,.025)">
      <Head
        label="Token"
        title="Coming Soon"
        sub="On-chain rewards and economics will be announced with the public deployment."
      />
      <div
        className="card"
        style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: "32px 28px",
          textAlign: "center",
          borderColor: "rgba(59,130,246,.2)",
        }}
      >
        <p
          style={{
            color: "rgba(255,255,255,.55)",
            fontSize: 17,
            lineHeight: 1.75,
            fontFamily: "'Rajdhani',sans-serif",
            fontWeight: 500,
          }}
        >
          Token system will be activated after deployment.
        </p>
      </div>
    </Sec>
  );
}

function NFTs() {
  return (
    <Sec id="nfts">
      <Head
        label="NFT Collection"
        title="Own Look. Own Status."
        sub="Cosmetic identities and arena flair — optional, skill-first, and built for collectors."
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(185px,1fr))",
          gap: 14,
          marginBottom: 28,
        }}
      >
        {NFTS.map((n, i) => (
          <div
            key={i}
            className="card"
            style={{
              overflow: "hidden",
              cursor: "pointer",
              border: `1px solid ${n.c}28`,
              padding: 0,
            }}
          >
            <div
              style={{
                height: 145,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 62,
                background: `radial-gradient(circle at 50% 60%, ${n.c}1a, transparent 70%), #0a0a1a`,
              }}
            >
              {n.emoji}
            </div>
            <div style={{ padding: "14px 16px" }}>
              <div
                style={{
                  fontFamily: "'Orbitron',monospace",
                  fontWeight: 700,
                  fontSize: 13,
                  marginBottom: 8,
                  color: "#fff",
                }}
              >
                {n.name}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Tag
                  color={
                    RARITY_CLR[n.rarity as keyof typeof RARITY_CLR] ?? "#9f5fff"
                  }
                >
                  {n.rarity}
                </Tag>
                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,.45)",
                    fontFamily: "'Orbitron',monospace",
                  }}
                >
                  {n.price}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          textAlign: "center",
          padding: "18px 22px",
          background: "rgba(159,95,255,.04)",
          border: "1px dashed rgba(159,95,255,.2)",
          borderRadius: 14,
        }}
      >
        <span
          style={{
            color: "rgba(255,255,255,.38)",
            fontSize: 14,
            fontFamily: "'Rajdhani',sans-serif",
            fontWeight: 500,
          }}
        >
          🚀 Full marketplace launches in{" "}
          <strong
            style={{
              color: "#b97fff",
              fontFamily: "'Orbitron',monospace",
              fontSize: 12,
            }}
          >
            PHASE 2
          </strong>{" "}
          — details after deployment.
        </span>
      </div>
    </Sec>
  );
}

function Leaderboard() {
  return (
    <Sec id="leaderboard" tint="rgba(244,63,94,.025)">
      <Head
        label="Leaderboard"
        title="Top Competitors"
        sub="Season 1 global rankings. Prove your skill, earn your spot."
      />
      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 9,
        }}
      >
        {LEADERS.map((p, i) => (
          <div
            key={p.rank}
            className={p.isPlayer ? "" : "card"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "13px 18px",
              borderRadius: 13,
              background: p.isPlayer
                ? "rgba(159,95,255,.1)"
                : "rgba(255,255,255,.025)",
              border: p.isPlayer
                ? "1px solid rgba(159,95,255,.38)"
                : "1px solid rgba(255,255,255,.055)",
              transition: "all .2s",
            }}
            onMouseEnter={(e) => {
              if (!p.isPlayer) {
                e.currentTarget.style.borderColor = "rgba(159,95,255,.28)";
                e.currentTarget.style.transform = "translateX(3px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!p.isPlayer) {
                e.currentTarget.style.borderColor = "rgba(255,255,255,.055)";
                e.currentTarget.style.transform = "";
              }
            }}
          >
            <div
              style={{
                width: 34,
                textAlign: "center",
                fontFamily: "'Orbitron',monospace",
                fontSize: i < 3 ? 19 : 13,
                fontWeight: 900,
                color:
                  i === 0
                    ? "#f59e0b"
                    : i === 1
                      ? "#94a3b8"
                      : i === 2
                        ? "#b45309"
                        : "rgba(255,255,255,.35)",
              }}
            >
              {p.badge || `#${p.rank}`}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "'Orbitron',monospace",
                  fontWeight: 700,
                  fontSize: 14,
                  color: p.isPlayer ? "#b97fff" : "#fff",
                }}
              >
                {p.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,.3)",
                  fontFamily: "'Rajdhani',sans-serif",
                  marginTop: 2,
                }}
              >
                ELO {p.elo}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontFamily: "'Orbitron',monospace",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "#4ade80",
                }}
              >
                {p.wins} W
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,.35)",
                  fontFamily: "'Rajdhani',sans-serif",
                  marginTop: 2,
                }}
              >
                {p.pts} PTS
              </div>
            </div>
          </div>
        ))}
      </div>
    </Sec>
  );
}

function Roadmap() {
  return (
    <Sec id="roadmap">
      <Head
        label="Roadmap"
        title="The Journey Ahead"
        sub="Four phases toward the ultimate skill-first competitive platform."
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
          gap: 18,
        }}
      >
        {ROADMAP.map((r, i) => (
          <div
            key={i}
            className="card"
            style={{
              padding: 28,
              position: "relative",
              overflow: "hidden",
              background:
                r.status === "active"
                  ? "rgba(159,95,255,.07)"
                  : "rgba(255,255,255,.02)",
              border:
                r.status === "active"
                  ? "1px solid rgba(159,95,255,.32)"
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
                fontSize: 44,
                fontWeight: 900,
                color: "rgba(159,95,255,.18)",
                marginBottom: 6,
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
                marginBottom: 18,
                color: "#fff",
              }}
            >
              {r.title}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {r.items.map((item, j) => (
                <div
                  key={j}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    fontSize: 14,
                    color:
                      r.status === "active"
                        ? "rgba(255,255,255,.72)"
                        : "rgba(255,255,255,.35)",
                    fontFamily: "'Rajdhani',sans-serif",
                    fontWeight: 500,
                  }}
                >
                  <span
                    style={{
                      color:
                        r.status === "active"
                          ? "#10b981"
                          : "rgba(255,255,255,.18)",
                      fontSize: 15,
                      lineHeight: 1,
                    }}
                  >
                    {r.status === "active" ? "✓" : "○"}
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Sec>
  );
}

function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(159,95,255,.1)",
        padding: "48px 22px",
        background: "rgba(0,0,0,.28)",
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: "linear-gradient(135deg,#9f5fff,#3b82f6)",
                  borderRadius: 9,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  boxShadow: "0 0 12px rgba(159,95,255,.45)",
                }}
              >
                ⚡
              </div>
              <span
                style={{
                  fontFamily: "'Orbitron',monospace",
                  fontWeight: 900,
                  fontSize: 18,
                  letterSpacing: ".18em",
                }}
              >
                SAISEN
              </span>
            </div>
            <p
              style={{
                color: "rgba(255,255,255,.32)",
                fontSize: 13,
                lineHeight: 1.7,
                fontFamily: "'Rajdhani',sans-serif",
                fontWeight: 500,
              }}
            >
              The premiere skill-based arena. Compete, climb, and own the board.
            </p>
          </div>
          <div style={{ display: "flex", gap: 44, flexWrap: "wrap" }}>
            {(
              [
                ["Platform", ["Game", "Leaderboard", "NFT Market", "Docs"]],
                ["Community", ["Twitter/X", "Discord", "Telegram"]],
              ] as const
            ).map(([title, items]) => (
              <div key={title}>
                <div
                  style={{
                    fontFamily: "'Orbitron',monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "rgba(255,255,255,.28)",
                    letterSpacing: ".2em",
                    textTransform: "uppercase",
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
                        color: "rgba(255,255,255,.45)",
                        fontSize: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontFamily: "'Rajdhani',sans-serif",
                        fontWeight: 500,
                        transition: "color .2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#b97fff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "rgba(255,255,255,.45)";
                      }}
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "13px 20px",
            background: "rgba(159,95,255,.05)",
            border: "1px solid rgba(159,95,255,.14)",
            borderRadius: 12,
            marginBottom: 28,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,.45)",
              fontFamily: "'Rajdhani',sans-serif",
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            Token system will be activated after deployment.
          </span>
        </div>

        <div
          style={{
            textAlign: "center",
            color: "rgba(255,255,255,.18)",
            fontSize: 12,
            fontFamily: "'Rajdhani',sans-serif",
            lineHeight: 1.7,
          }}
        >
          © {new Date().getFullYear()} SAISEN. All rights reserved. &nbsp;|&nbsp;
          <span style={{ color: "rgba(159,95,255,.6)" }}>
            Not financial advice.
          </span>
        </div>
      </div>
    </footer>
  );
}

function GameView({
  onBack,
  onGameEnd,
  wallet,
  streak,
}: {
  onBack: () => void;
  onGameEnd: (r: GameEndResult) => void;
  wallet: WalletState;
  streak: number;
}) {
  const [phase, setPhase] = useState("lobby");
  const [cdNum, setCdNum] = useState(3);
  const [timeLeft, setTL] = useState(GAME_SECS);
  const [pScore, setPScore] = useState(0);
  const [oScore, setOScore] = useState(0);
  const [targets, setTgts] = useState<GameTarget[]>([]);
  const [bursts, setBursts] = useState<BurstFx[]>([]);
  const [popups, setPops] = useState<ScorePopup[]>([]);
  const [combo, setCombo] = useState(0);
  const [result, setResult] = useState<GameEndResult | null>(null);

  const ref = useRef<GameTimerRef>({
    ps: 0,
    os: 0,
    combo: 0,
    lastHit: 0,
    spawnId: undefined,
    oppId: undefined,
    timerId: undefined,
  });

  const cleanup = () => {
    const r = ref.current;
    if (r.spawnId !== undefined) clearInterval(r.spawnId);
    if (r.oppId !== undefined) clearInterval(r.oppId);
    if (r.timerId !== undefined) clearInterval(r.timerId);
  };

  const doStartGame = () => {
    cleanup();
    ref.current = {
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
    setTL(GAME_SECS);

    ref.current.spawnId = setInterval(() => {
      const id = Math.random().toString(36).slice(2, 9);
      const life = Math.random() * 1200 + 900;
      const t: GameTarget = {
        id,
        x: Math.random() * 80 + 5,
        y: Math.random() * 72 + 8,
        sz: Math.floor(Math.random() * 18) + 34,
        c: TARGET_COLORS[Math.floor(Math.random() * TARGET_COLORS.length)]!,
        life,
      };
      setTgts((prev) => [...prev.slice(-14), t]);
      setTimeout(() => setTgts((prev) => prev.filter((x) => x.id !== id)), life);
    }, 650);

    const oppRate = 0.62;
    ref.current.oppId = setInterval(() => {
      if (Math.random() < oppRate) {
        ref.current.os++;
        setOScore(ref.current.os);
      }
    }, 1000);

    let tl = GAME_SECS;
    ref.current.timerId = setInterval(() => {
      tl--;
      setTL(tl);
      if (tl <= 0) doEndGame();
    }, 1000);

    setPhase("playing");
  };

  const doEndGame = useCallback(() => {
    cleanup();
    setTgts([]);
    const ps = ref.current.ps;
    const os = ref.current.os;
    const won = ps > os;
    onGameEnd({ won, playerScore: ps, opponentScore: os });
    setResult({ won, playerScore: ps, opponentScore: os });
    setPhase("result");
  }, [onGameEnd]);

  const startCountdown = () => {
    setPhase("countdown");
    setCdNum(3);
    let c = 3;
    const iv = setInterval(() => {
      c--;
      setCdNum(c);
      if (c <= 0) {
        clearInterval(iv);
        doStartGame();
      }
    }, 800);
  };

  const hitTarget = (t: GameTarget, e: ReactMouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setTgts((prev) => prev.filter((x) => x.id !== t.id));
    ref.current.ps++;
    setPScore(ref.current.ps);

    const now = Date.now();
    const nc =
      now - ref.current.lastHit < 550 ? ref.current.combo + 1 : 1;
    ref.current.combo = nc;
    ref.current.lastHit = now;
    setCombo(nc);

    const bid = Math.random().toString(36).slice(2, 7);
    setBursts((prev) => [
      ...prev.slice(-8),
      { id: bid, x: t.x, y: t.y, c: t.c },
    ]);
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
        txt: nc > 2 ? `+1 🔥×${nc}` : "+1",
      },
    ]);
    setTimeout(
      () => setPops((prev) => prev.filter((x) => x.id !== pid)),
      900,
    );
  };

  const reset = () => {
    cleanup();
    setPhase("lobby");
    setResult(null);
  };

  const timePct = (timeLeft / GAME_SECS) * 100;
  const timerC =
    timeLeft > 15 ? "#9f5fff" : timeLeft > 7 ? "#f59e0b" : "#f43f5e";
  const circ = 2 * Math.PI * 30;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#06060f",
        display: "flex",
        flexDirection: "column",
        color: "#fff",
        fontFamily: "'Rajdhani',sans-serif",
      }}
    >
      <style>
        {`${CSS}
        @keyframes cd-zoom{from{transform:scale(2.4);opacity:0}to{transform:scale(1);opacity:1}}
        @keyframes win-glow{0%,100%{text-shadow:0 0 20px rgba(74,222,128,.5)}50%{text-shadow:0 0 40px #4ade80,0 0 80px rgba(74,222,128,.3)}}
        @keyframes lose-glow{0%,100%{text-shadow:0 0 20px rgba(248,113,113,.5)}50%{text-shadow:0 0 40px #f87171,0 0 80px rgba(248,113,113,.3)}}
        .win-txt{animation:win-glow 2s ease-in-out infinite}
        .lose-txt{animation:lose-glow 2s ease-in-out infinite}
      `}
      </style>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "11px 20px",
          borderBottom: "1px solid rgba(159,95,255,.1)",
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
            color: "rgba(255,255,255,.45)",
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
            e.currentTarget.style.color = "rgba(255,255,255,.45)";
          }}
        >
          ← Back to Menu
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              background: "linear-gradient(135deg,#9f5fff,#3b82f6)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              boxShadow: "0 0 10px rgba(159,95,255,.5)",
            }}
          >
            ⚡
          </div>
          <span
            style={{
              fontFamily: "'Orbitron',monospace",
              fontWeight: 900,
              fontSize: 16,
              letterSpacing: ".14em",
            }}
          >
            SAISEN
          </span>
        </div>
        <div
          style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 12 }}
        >
          {streak > 0 && (
            <div
              style={{
                background: "rgba(244,63,94,.12)",
                border: "1px solid rgba(244,63,94,.28)",
                borderRadius: 8,
                padding: "4px 11px",
                color: "#f87171",
                fontWeight: 700,
                fontFamily: "'Orbitron',monospace",
                fontSize: 11,
              }}
            >
              🔥 {streak}
            </div>
          )}
          {wallet.connected && (
            <div
              style={{
                color: "rgba(255,255,255,.38)",
                fontFamily: "'Orbitron',monospace",
                fontSize: 11,
              }}
            >
              {wallet.address.slice(0, 6)}…{wallet.address.slice(-4)}
            </div>
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
          position: "relative",
        }}
      >
        {phase === "lobby" && (
          <div style={{ textAlign: "center", maxWidth: 480, width: "100%" }}>
            <div className="float" style={{ fontSize: 72, marginBottom: 18 }}>
              🎯
            </div>
            <h2
              style={{
                fontFamily: "'Orbitron',monospace",
                fontSize: "clamp(24px,4vw,36px)",
                fontWeight: 900,
                marginBottom: 10,
              }}
            >
              Ready to Compete?
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,.42)",
                marginBottom: 32,
                lineHeight: 1.7,
                fontSize: 15,
              }}
            >
              Click targets faster than the bot opponent. Highest score after{" "}
              {GAME_SECS} seconds wins the round.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 32,
              }}
            >
              {[
                ["⏱️ Match time", `${GAME_SECS} seconds`, "#60a5fa"],
                ["🎯 Objective", "Highest score wins", "#b97fff"],
                ["🔥 Combos", "Chain hits for flair", "#f87171"],
                ["🏁 Result", "Recorded locally", "#4ade80"],
              ].map(([k, v, c]) => (
                <div
                  key={String(k)}
                  style={{
                    background: "rgba(255,255,255,.03)",
                    border: "1px solid rgba(255,255,255,.07)",
                    borderRadius: 13,
                    padding: "15px 17px",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,.38)",
                      marginBottom: 5,
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
              <Zap size={16} /> Start Match
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
                color: "rgba(255,255,255,.4)",
                marginTop: 18,
                letterSpacing: ".28em",
              }}
            >
              GET READY
            </div>
          </div>
        )}

        {phase === "playing" && (
          <div
            style={{
              width: "100%",
              maxWidth: 880,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center",
                gap: 14,
                padding: "12px 20px",
                background: "rgba(0,0,0,.55)",
                borderRadius: 16,
                border: "1px solid rgba(159,95,255,.14)",
              }}
            >
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontFamily: "'Orbitron',monospace",
                    fontSize: 9,
                    color: "rgba(255,255,255,.32)",
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
                    🔥 ×{combo}
                  </div>
                )}
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ position: "relative", width: 72, height: 72 }}>
                  <svg
                    width="72"
                    height="72"
                    style={{ transform: "rotate(-90deg)", display: "block" }}
                  >
                    <circle
                      cx="36"
                      cy="36"
                      r="30"
                      fill="none"
                      stroke="rgba(255,255,255,.06)"
                      strokeWidth="5"
                    />
                    <circle
                      cx="36"
                      cy="36"
                      r="30"
                      fill="none"
                      stroke={timerC}
                      strokeWidth="5"
                      strokeDasharray={`${(circ * (timePct * 0.01)).toFixed(2)} ${circ}`}
                      strokeLinecap="round"
                      style={{
                        transition:
                          "stroke-dasharray .6s linear,stroke .5s",
                      }}
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
                    {timeLeft}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "'Orbitron',monospace",
                    fontSize: 9,
                    color: "rgba(255,255,255,.25)",
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
                    color: "rgba(255,255,255,.32)",
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
                border: "1px solid rgba(159,95,255,.13)",
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
                  key={t.id}
                  type="button"
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
                    background: `radial-gradient(circle at 38% 34%, ${t.c}ff, ${t.c}88)`,
                    boxShadow: `0 0 12px ${t.c}88, 0 0 28px ${t.c}44`,
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
                  ×
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

              {popups.map((popup) => (
                <div
                  key={popup.id}
                  style={{
                    position: "absolute",
                    left: `${popup.x}%`,
                    top: `${popup.y}%`,
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
                  {popup.txt}
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
                  color: "rgba(255,255,255,.12)",
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
            <div className="float" style={{ fontSize: 80, marginBottom: 18 }}>
              {result.won ? "🏆" : "💀"}
            </div>
            <h2
              className={
                result.won ? "win-txt font-display" : "lose-txt font-display"
              }
              style={{
                fontFamily: "'Orbitron',monospace",
                fontSize: "clamp(36px,6vw,56px)",
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
                color: "rgba(255,255,255,.45)",
                marginBottom: 24,
              }}
            >
              {result.playerScore} — {result.opponentScore}
            </div>
            <p
              style={{
                color: "rgba(255,255,255,.38)",
                fontSize: 15,
                lineHeight: 1.7,
                marginBottom: 32,
                fontFamily: "'Rajdhani',sans-serif",
              }}
            >
              Token system will be activated after deployment.
            </p>
            <div
              style={{
                display: "flex",
                gap: 11,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Btn sz="lg" onClick={startCountdown} pulse>
                <Zap size={15} /> Play Again
              </Btn>
              <Btn sz="lg" v="outline" onClick={reset}>
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
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: "",
  });
  const [streak, setStreak] = useState(0);

  const handleEnd = useCallback((res: GameEndResult) => {
    setStreak((prev) => (res.won ? prev + 1 : 0));
  }, []);

  const connect = () => {
    const a =
      "0x" +
      [...Array(40)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("");
    setWallet({ connected: true, address: a });
  };

  if (view === "game") {
    return (
      <GameView
        onBack={() => setView("landing")}
        onGameEnd={handleEnd}
        wallet={wallet}
        streak={streak}
      />
    );
  }

  return (
    <div style={{ background: "#06060f", minHeight: "100vh", color: "#fff" }}>
      <style>{CSS}</style>
      <Nav wallet={wallet} connect={connect} onPlay={() => setView("game")} />
      <Hero onPlay={() => setView("game")} connect={connect} wallet={wallet} />
      <About />
      <Gameplay onPlay={() => setView("game")} />
      <TokenPlaceholder />
      <NFTs />
      <Leaderboard />
      <Roadmap />
      <Footer />
    </div>
  );
}
