"use client";

import { type ReactNode, useEffect } from "react";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, baseSepolia } from "wagmi/chains";

import "@rainbow-me/rainbowkit/styles.css";

// 🔥 Tambahan Farcaster
import { actions } from "@farcaster/miniapp-sdk";

const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? "8453");

const wagmiConfig = getDefaultConfig({
  appName: "SAISEN",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "aa78432f88b013f2334261d3e81fa1a1",
  chains: [CHAIN_ID === 8453 ? base : baseSepolia] as any,
  ssr: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000 },
  },
});

export default function Providers({ children }: { children: ReactNode }) {

  // 🔥 Farcaster Mini App ready signal
  useEffect(() => {
    try {
      actions.ready();
    } catch (e) {
      // Not in Farcaster — ignore
      console.log("Not running inside Farcaster");
    }
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}