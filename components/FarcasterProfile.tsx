"use client";

import Image              from "next/image";
import type { FarcasterUser } from "@/lib/farcaster";
import { getRankTier }    from "@/lib/elo";

interface Props {
  user:     FarcasterUser;
  elo?:     number;
  compact?: boolean;
}

export default function FarcasterProfile({
  user,
  elo,
  compact = false,
}: Props) {
  const tier = elo ? getRankTier(elo) : null;

  // ── Compact pill (navbar) ────────────────────────────────────
  if (compact) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "rgba(159,95,255,.08)", border: "1px solid rgba(159,95,255,.2)",
        borderRadius: 10, padding: "5px 12px",
      }}>
        {user.pfpUrl && (
          <Image
            src={user.pfpUrl}
            alt={user.username}
            width={22}
            height={22}
            style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
            unoptimized
          />
        )}
        <span style={{
          fontFamily: "'Orbitron',monospace", fontSize: 11, fontWeight: 700, color: "#b97fff",
        }}>
          @{user.username}
        </span>
        {tier && <span style={{ fontSize: 13 }}>{tier.emoji}</span>}
      </div>
    );
  }

  // ── Full card ────────────────────────────────────────────────
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      background: "rgba(255,255,255,.03)", border: "1px solid rgba(159,95,255,.14)",
      borderRadius: 16, padding: "14px 18px",
    }}>
      {user.pfpUrl && (
        <div style={{ position: "relative", flexShrink: 0 }}>
          <Image
            src={user.pfpUrl}
            alt={user.username}
            width={48}
            height={48}
            style={{
              borderRadius: "50%", objectFit: "cover",
              boxShadow: "0 0 12px rgba(159,95,255,.35)",
            }}
            unoptimized
          />
          {/* Online dot */}
          <div style={{
            position: "absolute", bottom: -2, right: -2,
            width: 14, height: 14, background: "#10b981", borderRadius: "50%",
            border: "2px solid #06060f",
          }} />
        </div>
      )}
      <div>
        <div style={{
          fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: 15, color: "#fff",
        }}>
          {user.displayName}
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.38)", marginTop: 3 }}>
          @{user.username} · FID {user.fid}
        </div>
        {tier && elo && (
          <div style={{
            display: "flex", alignItems: "center", gap: 5, marginTop: 6,
            fontFamily: "'Orbitron',monospace", fontSize: 11,
            color: tier.color, fontWeight: 700,
          }}>
            {tier.emoji} {tier.name} · {elo} ELO
          </div>
        )}
      </div>
    </div>
  );
}