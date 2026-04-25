"use client";

import {
  createContext, useContext, useState, useEffect, useCallback,
  type ReactNode,
} from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  getSolBalance, getSaiBalance, isHolder as checkHolder,
  makeAuthNonce, loadSession, saveSession, clearSession,
} from "@/lib/walletAuth";

interface WalletCtx {
  address:         string | null;
  solBalance:      number;
  saiBalance:      number;
  isHolder:        boolean;
  isAuthenticated: boolean;
  authenticate:    () => Promise<boolean>;
  refreshBalances: () => Promise<void>;
}

const Ctx = createContext<WalletCtx>({
  address:         null,
  solBalance:      0,
  saiBalance:      0,
  isHolder:        false,
  isAuthenticated: false,
  authenticate:    async () => false,
  refreshBalances: async () => {},
});

export function useWalletCtx() {
  return useContext(Ctx);
}

export function WalletCtxProvider({ children }: { children: ReactNode }) {
  const { connection }                       = useConnection();
  const { publicKey, connected, signMessage, disconnect } = useWallet();

  const address = publicKey?.toBase58() ?? null;

  const [solBalance,      setSol]    = useState(0);
  const [saiBalance,      setSai]    = useState(0);
  const [isAuthenticated, setAuth]   = useState(false);

  const refreshBalances = useCallback(async () => {
    if (!address) { setSol(0); setSai(0); return; }
    const [sol, sai] = await Promise.all([
      getSolBalance(connection, address),
      getSaiBalance(connection, address),
    ]);
    setSol(sol);
    setSai(sai);
  }, [connection, address]);

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!address || !signMessage) return false;
    try {
      const existing = loadSession();
      if (existing?.address === address) {
        setAuth(true);
        return true;
      }
      const nonce = makeAuthNonce(address);
      const enc   = new TextEncoder();
      const sig   = await signMessage(enc.encode(nonce));
      const sigHex = Buffer.from(sig).toString("hex");
      saveSession({ address, signature: sigHex, ts: Date.now() });
      setAuth(true);
      return true;
    } catch {
      return false;
    }
  }, [address, signMessage]);

  // On wallet connect: restore session or prompt auth
  useEffect(() => {
    if (!connected || !address) {
      setAuth(false);
      setSol(0);
      setSai(0);
      return;
    }

    const existing = loadSession();
    if (existing?.address === address) {
      setAuth(true);
    } else {
      setAuth(false);
    }

    refreshBalances();
  }, [connected, address, refreshBalances]);

  // On wallet disconnect: clear session
  const handleDisconnect = useCallback(() => {
    clearSession();
    setAuth(false);
  }, []);

  useEffect(() => {
    if (!connected) handleDisconnect();
  }, [connected, handleDisconnect]);

  return (
    <Ctx.Provider value={{
      address,
      solBalance,
      saiBalance,
      isHolder: checkHolder(saiBalance),
      isAuthenticated,
      authenticate,
      refreshBalances,
    }}>
      {children}
    </Ctx.Provider>
  );
}
