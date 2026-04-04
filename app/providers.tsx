"use client";

import { type ReactNode }          from "react";
import { WagmiProvider }            from "wagmi";
import { RainbowKitProvider }       from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getDefaultConfig }         from "@rainbow-me/rainbowkit";
import { base, baseSepolia }        from "wagmi/chains";

import "@rainbow-me/rainbowkit/styles.css";

const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? "8453");

const wagmiConfig = getDefaultConfig({
  appName:   "SAISEN",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo",
  chains:    [CHAIN_ID === 8453 ? base : baseSepolia] as any,
  ssr:       true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000 },
  },
});

export default function Providers({ children }: { children: ReactNode }) {
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