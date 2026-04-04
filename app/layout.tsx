import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://saisen.xyz";

export const metadata: Metadata = {
  title:       "SAISEN — Compete. Perform. Dominate.",
  description: "Skill-based 1v1 reaction game. Compete on-chain via Farcaster.",
  openGraph: {
    title:       "SAISEN",
    description: "Skill-based 1v1 reaction game. Compete on-chain.",
    images:      [{ url: `${APP_URL}/game-preview.png`, width: 1200, height: 630 }],
    url:         APP_URL,
    type:        "website",
  },
  // ── Farcaster Frame v1 meta tags ────────────────────────────
  other: {
    "fc:frame":                    "vNext",
    "fc:frame:image":              `${APP_URL}/frame.png`,
    "fc:frame:image:aspect_ratio": "1.91:1",
    "fc:frame:button:1":           "⚡ Play SAISEN",
    "fc:frame:post_url":           `${APP_URL}/api/frame`,
    // Mini App manifest (Warpcast v2)
    "fc:frame:miniapp": JSON.stringify({
      version:  "1",
      imageUrl: `${APP_URL}/frame.png`,
      button: {
        title:  "Play SAISEN",
        action: {
          type: "launch_frame",
          url:  APP_URL,
        },
      },
    }),
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}