"use client";

import { useState, useCallback } from "react";
import { useWallet }             from "@solana/wallet-adapter-react";
import type { WalletName }       from "@solana/wallet-adapter-base";
import { Wallet, X, LogIn }      from "lucide-react";
import { useWalletCtx }          from "@/context/WalletContext";

export default function WalletButton() {
  const { publicKey, connected, connecting, select, connect, disconnect, wallets } = useWallet();
  const { solBalance, saiBalance, isHolder, isAuthenticated, authenticate }        = useWalletCtx();
  const [showPicker, setShowPicker] = useState(false);
  const [signing,    setSigning]    = useState(false);

  const handleSelect = useCallback(async (name: WalletName) => {
    setShowPicker(false);
    select(name);
    try { await connect(); } catch {}
  }, [select, connect]);

  const handleSignIn = useCallback(async () => {
    setSigning(true);
    await authenticate();
    setSigning(false);
  }, [authenticate]);

  if (connected && publicKey) {
    const addr = publicKey.toBase58();
    return (
      <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
        {/* Balances */}
        <div style={{
          display: "flex", gap: 6, alignItems: "center",
          background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)",
          borderRadius: 8, padding: "5px 10px",
          fontFamily: "'Orbitron',monospace", fontSize: 9,
        }}>
          <span style={{ color: "rgba(255,255,255,.4)" }}>{solBalance.toFixed(2)} SOL</span>
          {saiBalance > 0 && (
            <span style={{ color: isHolder ? "#a78bfa" : "rgba(255,255,255,.35)" }}>
              {saiBalance >= 1_000_000
                ? `${(saiBalance / 1_000_000).toFixed(1)}M`
                : saiBalance.toLocaleString()} $SAI
              {isHolder && " ✓"}
            </span>
          )}
        </div>

        {/* Sign-in if not authenticated */}
        {!isAuthenticated && (
          <button
            onClick={handleSignIn}
            disabled={signing}
            title="Sign to verify wallet ownership"
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              background: "rgba(159,95,255,.1)", border: "1px solid rgba(159,95,255,.3)",
              borderRadius: 8, padding: "6px 10px", cursor: "pointer",
              fontFamily: "'Orbitron',monospace", fontSize: 9,
              fontWeight: 700, color: "#b97fff", opacity: signing ? .5 : 1,
            }}
          >
            <LogIn size={10} />
            {signing ? "Signing…" : "Sign In"}
          </button>
        )}

        {/* Address / disconnect */}
        <button
          onClick={() => disconnect()}
          title="Click to disconnect"
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: isAuthenticated ? "rgba(16,185,129,.08)" : "rgba(245,158,11,.08)",
            border: `1px solid ${isAuthenticated ? "rgba(16,185,129,.25)" : "rgba(245,158,11,.25)"}`,
            borderRadius: 9, padding: "7px 14px", cursor: "pointer",
            fontFamily: "'Orbitron',monospace", fontSize: 10,
            fontWeight: 700, color: isAuthenticated ? "#34d399" : "#f59e0b",
            transition: "all .2s",
          }}
        >
          <div style={{
            width: 7, height: 7,
            background: isAuthenticated ? "#10b981" : "#f59e0b",
            borderRadius: "50%",
            boxShadow: `0 0 5px ${isAuthenticated ? "#10b981" : "#f59e0b"}`,
          }} />
          {addr.slice(0, 4)}…{addr.slice(-4)}
        </button>
      </div>
    );
  }

  // Mobile deep-link hints
  const isMobile = typeof window !== "undefined" && /iPhone|Android/i.test(navigator.userAgent);

  return (
    <>
      <button
        onClick={() => setShowPicker(true)}
        disabled={connecting}
        style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "transparent",
          border: "1px solid rgba(159,95,255,.35)",
          borderRadius: 9, padding: "7px 15px", cursor: "pointer",
          fontFamily: "'Orbitron',monospace", fontSize: 10,
          fontWeight: 700, letterSpacing: ".08em", color: "#b97fff",
          transition: "all .2s", opacity: connecting ? .6 : 1,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(159,95,255,.09)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
      >
        <Wallet size={11} />
        {connecting ? "Connecting…" : "Connect Wallet"}
      </button>

      {showPicker && (
        <div
          onClick={() => setShowPicker(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,.65)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#0e0e1f", border: "1px solid rgba(159,95,255,.3)",
              borderRadius: 18, padding: "24px 22px", width: 320,
              boxShadow: "0 0 40px rgba(159,95,255,.2)",
            }}
          >
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 18,
            }}>
              <span style={{
                fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700,
                color: "#b97fff", letterSpacing: ".1em",
              }}>
                SELECT WALLET
              </span>
              <button
                onClick={() => setShowPicker(false)}
                style={{
                  background: "none", border: "none", color: "rgba(255,255,255,.35)",
                  cursor: "pointer", padding: 4,
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {wallets.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: "16px 0",
                  color: "rgba(255,255,255,.38)", fontSize: 13,
                  fontFamily: "'Rajdhani',sans-serif", lineHeight: 1.7,
                }}>
                  No Solana wallet detected.
                  {isMobile ? (
                    <>
                      <br />
                      <a
                        href={`https://phantom.app/ul/browse/${encodeURIComponent(window.location.href)}?ref=${encodeURIComponent(window.location.origin)}`}
                        style={{ color: "#9f5fff", textDecoration: "none", display: "block", marginTop: 12 }}
                      >
                        Open in Phantom ↗
                      </a>
                      <a
                        href={`https://solflare.com/ul/v1/browse/${encodeURIComponent(window.location.href)}?ref=${encodeURIComponent(window.location.origin)}`}
                        style={{ color: "#f97316", textDecoration: "none", display: "block", marginTop: 8 }}
                      >
                        Open in Solflare ↗
                      </a>
                    </>
                  ) : (
                    <><br />Install Phantom or Solflare to continue.</>
                  )}
                </div>
              ) : (
                wallets.map(w => (
                  <button
                    key={w.adapter.name}
                    onClick={() => handleSelect(w.adapter.name as WalletName)}
                    style={{
                      display: "flex", alignItems: "center", gap: 13,
                      padding: "13px 16px", borderRadius: 12, cursor: "pointer",
                      background: "rgba(255,255,255,.03)",
                      border: "1px solid rgba(255,255,255,.08)",
                      transition: "all .2s", textAlign: "left",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(159,95,255,.08)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(159,95,255,.35)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.03)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.08)";
                    }}
                  >
                    {w.adapter.icon ? (
                      <img
                        src={w.adapter.icon}
                        alt={w.adapter.name}
                        width={28} height={28}
                        style={{ borderRadius: 8, flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: "rgba(159,95,255,.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16,
                      }}>⚡</div>
                    )}
                    <div>
                      <div style={{
                        fontFamily: "'Orbitron',monospace", fontSize: 12,
                        fontWeight: 700, color: "#fff",
                      }}>
                        {w.adapter.name}
                      </div>
                      <div style={{
                        fontSize: 11, color: "rgba(255,255,255,.35)",
                        fontFamily: "'Rajdhani',sans-serif", marginTop: 2,
                      }}>
                        {w.readyState === "Installed" ? "Detected" : "Not installed"}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div style={{
              marginTop: 16, padding: "10px 14px",
              background: "rgba(159,95,255,.05)", border: "1px solid rgba(159,95,255,.12)",
              borderRadius: 10, fontSize: 11, color: "rgba(255,255,255,.3)",
              fontFamily: "'Rajdhani',sans-serif", textAlign: "center", lineHeight: 1.6,
            }}>
              Supports Phantom · Solflare · Backpack
            </div>
          </div>
        </div>
      )}
    </>
  );
}
