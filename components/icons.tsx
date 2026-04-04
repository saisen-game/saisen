import React from "react";

// ─── Torii Gate SVG ──────────────────────────────────────────
export function ToriiIcon({
  size = 32,
  glowing = false,
  className = "",
}: {
  size?:      number;
  glowing?:   boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.9)}
      viewBox="0 0 40 36"
      fill="none"
      className={className}
      style={
        glowing
          ? { filter: "drop-shadow(0 0 7px rgba(159,95,255,.9))", transition: "filter .3s" }
          : { transition: "filter .3s" }
      }
    >
      {/* Kasagi (top crossbeam — curved) */}
      <path d="M1 12.5Q20 3.5 39 12.5L37.5 16Q20 7 2.5 16Z" fill="#9f5fff" />
      {/* Nuki (lower crossbeam) */}
      <rect x="5"    y="15.5" width="30"  height="2.8"  rx="1.4"  fill="#7c3aed" />
      {/* Shimaki (mid beam) */}
      <rect x="9"    y="20.5" width="22"  height="2.5"  rx="1.25" fill="#9f5fff" />
      {/* Left pillar */}
      <rect x="11.2" y="15"   width="3.2" height="21"   rx="1.6"  fill="#9f5fff" />
      {/* Right pillar */}
      <rect x="25.6" y="15"   width="3.2" height="21"   rx="1.6"  fill="#9f5fff" />
      {/* Left top accent */}
      <rect x="13.2" y="6.5"  width="2.2" height="9"    rx="1.1"  fill="#b97fff" />
      {/* Right top accent */}
      <rect x="24.6" y="6.5"  width="2.2" height="9"    rx="1.1"  fill="#b97fff" />
    </svg>
  );
}

// ─── Logo Mark (icon + wordmark) ─────────────────────────────
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: size, height: size,
          background: "linear-gradient(135deg,rgba(159,95,255,.18),rgba(59,130,246,.18))",
          border: "1px solid rgba(159,95,255,.32)", borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 14px rgba(159,95,255,.28)", transition: "box-shadow .3s,border-color .3s",
          cursor: "pointer",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px rgba(159,95,255,.75)";
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(159,95,255,.6)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = "0 0 14px rgba(159,95,255,.28)";
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(159,95,255,.32)";
        }}
      >
        <ToriiIcon size={Math.round(size * 0.66)} glowing />
      </div>
      <span
        className="animate-flicker"
        style={{
          fontFamily: "'Orbitron',monospace",
          fontWeight: 900,
          fontSize: Math.round(size * 0.5),
          letterSpacing: ".18em",
        }}
      >
        SAISEN
      </span>
    </div>
  );
}