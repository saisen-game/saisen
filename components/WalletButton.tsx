"use client";

import { useState, useCallback } from "react";
import { useWallet }             from "@solana/wallet-adapter-react";
import type { WalletName }       from "@solana/wallet-adapter-base";
import { Wallet, X }             from "lucide-react";

export default function WalletButton() {
  const { publicKey, connected, connecting, select, connect, disconnect, wallets } = useWallet();
  const [showPicker, setShowPicker] = useState(false);

  const handleSelect = useCallback(async (name: WalletName) => {
    setShowPicker(false);
    select(name);
    try { await connect(); } catch {}
  }, [select, connect]);

  if (connected && publicKey) {
    const addr = publicKey.toBase58();
    return (
      <button
        onClick={() => disconnect()}
        title="Click to disconnect"
        style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "rgba(16,185,129,.08)",
          border: "1px solid rgba(16,185,129,.25)",
          borderRadius: 9, padding: "7px 14px", cursor: "pointer",
          fontFamily: "'Orbitron',monospace", fontSize: 10,
          fontWeight: 700, color: "#34d399", transition: "all .2s",
        }}
      >
        <div style={{
          width: 7, height: 7, background: "#10b981", borderRadius: "50%",
          boxShadow: "0 0 5px #10b981",
        }} />
        {addr.slice(0, 4)}…{addr.slice(-4)}
      </button>
    );
  }

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
                  textAlign: "center", padding: "20px 0",
                  color: "rgba(255,255,255,.38)", fontSize: 13,
                  fontFamily: "'Rajdhani',sans-serif", lineHeight: 1.7,
                }}>
                  No Solana wallet detected.<br />
                  Install Phantom or Solflare to continue.
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
