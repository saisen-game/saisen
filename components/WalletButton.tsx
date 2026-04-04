"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet }        from "lucide-react";

export default function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
        if (!mounted) return null;

        if (!account) {
          return (
            <button
              onClick={openConnectModal}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "transparent",
                border: "1px solid rgba(159,95,255,.35)",
                borderRadius: 9, padding: "7px 15px", cursor: "pointer",
                fontFamily: "'Orbitron',monospace", fontSize: 10,
                fontWeight: 700, letterSpacing: ".08em", color: "#b97fff",
                transition: "all .2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(159,95,255,.09)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <Wallet size={11} /> Connect Wallet
            </button>
          );
        }

        return (
          <button
            onClick={openAccountModal}
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
            {account.address.slice(0, 6)}…{account.address.slice(-4)}
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}