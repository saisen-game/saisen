"use client";

import { RARITY_COLORS } from "@/lib/skills";

export interface ActiveSkillState {
  id:            string;
  name:          string;
  icon:          string;
  rarity:        "common" | "rare" | "legendary";
  activeUntil:   number; // epoch ms; 0 = not active
  cooldownUntil: number; // epoch ms; 0 = ready
  onActivate:    () => void;
}

interface Props {
  skills:  ActiveSkillState[];
  nowMs:   number;
}

export default function SkillBar({ skills, nowMs }: Props) {
  if (!skills.length) return null;

  return (
    <div style={{
      display: "flex", gap: 8, justifyContent: "center",
      padding: "8px 0",
    }}>
      {skills.map(sk => {
        const isActive   = sk.activeUntil > nowMs;
        const onCooldown = !isActive && sk.cooldownUntil > nowMs;
        const ready      = !isActive && !onCooldown;

        const cdLeft = onCooldown ? Math.ceil((sk.cooldownUntil - nowMs) / 1000) : 0;
        const acLeft = isActive   ? Math.ceil((sk.activeUntil - nowMs)   / 1000) : 0;

        const color = RARITY_COLORS[sk.rarity];

        return (
          <button
            key={sk.id}
            onClick={ready ? sk.onActivate : undefined}
            disabled={!ready}
            title={`${sk.name}${onCooldown ? ` (${cdLeft}s)` : isActive ? " ACTIVE" : ""}`}
            style={{
              position: "relative",
              width: 54, height: 54, borderRadius: 12,
              border: `2px solid ${isActive ? color : ready ? `${color}88` : "rgba(255,255,255,.1)"}`,
              background: isActive
                ? `${color}22`
                : ready
                ? "rgba(255,255,255,.04)"
                : "rgba(0,0,0,.4)",
              cursor: ready ? "pointer" : "default",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 2,
              boxShadow: isActive ? `0 0 14px ${color}66` : "none",
              transition: "all .2s",
              overflow: "hidden",
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>{sk.icon}</span>
            {onCooldown && (
              <>
                {/* Dark overlay */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "rgba(0,0,0,.6)", borderRadius: 10,
                }} />
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Orbitron',monospace", fontSize: 11, fontWeight: 700,
                  color: "rgba(255,255,255,.6)",
                }}>
                  {cdLeft}
                </div>
              </>
            )}
            {isActive && (
              <div style={{
                fontFamily: "'Orbitron',monospace", fontSize: 9, fontWeight: 700,
                color, letterSpacing: ".05em",
              }}>
                {acLeft}s
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
