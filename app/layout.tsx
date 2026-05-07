import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import ErrorBoundary from "@/components/ErrorBoundary";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.saisen.fun";

export const metadata: Metadata = {
  title:       "SAISEN — Compete. Perform. Dominate.",
  description: "Skill-based 1v1 reaction game. Compete on-chain via Farcaster.",

  openGraph: {
    title:       "SAISEN",
    description: "Skill-based 1v1 reaction game. Compete on-chain.",
    images:      [
      {
        url: `${APP_URL}/game-preview.png`,
        width: 1200,
        height: 630,
      },
    ],
    url:  APP_URL,
    type: "website",
  },

  other: {
    // ── FRAME (fallback, tetap dipakai) ──────────────────────
    "fc:frame":                    "vNext",
    "fc:frame:image":              `${APP_URL}/frame.png`,
    "fc:frame:image:aspect_ratio": "1.91:1",
    "fc:frame:button:1":           "⚡ Play SAISEN",
    "fc:frame:post_url":           `${APP_URL}/api/frame`,

    // ── MINI APP (FIXED FORMAT 🔥) ───────────────────────────
    "fc:miniapp": "v1",
    "fc:miniapp:url": APP_URL,
    "fc:miniapp:button:title": "Play SAISEN",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}