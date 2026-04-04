import { NextRequest } from "next/server";

const APP   = process.env.NEXT_PUBLIC_APP_URL ?? "https://saisen.vercel.app/";
const FRAME = `${APP}/frame.png`;
const PREV  = `${APP}/game-preview.png`;

// ─── Helper: build a Farcaster Frame HTML response ───────────
function frameResponse(options: {
  image:   string;
  buttons: { label: string; action?: "post" | "link"; target?: string }[];
  postUrl: string;
}): Response {
  const btnMeta = options.buttons
    .map((b, i) => {
      const n = i + 1;
      const action = b.action ?? "post";
      const target = b.target ?? options.postUrl;
      return [
        `<meta name="fc:frame:button:${n}"        content="${b.label}" />`,
        `<meta name="fc:frame:button:${n}:action" content="${action}" />`,
        action === "link"
          ? `<meta name="fc:frame:button:${n}:target" content="${target}" />`
          : "",
      ]
        .filter(Boolean)
        .join("\n    ");
    })
    .join("\n    ");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta property="og:image"                  content="${options.image}" />
  <meta name="fc:frame"                      content="vNext" />
  <meta name="fc:frame:image"                content="${options.image}" />
  <meta name="fc:frame:image:aspect_ratio"   content="1.91:1" />
  ${btnMeta}
  <meta name="fc:frame:post_url"             content="${options.postUrl}" />
</head>
<body></body>
</html>`;

  return new Response(html, {
    status:  200,
    headers: {
      "Content-Type":  "text/html",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

// ─── GET — initial frame shown when cast is viewed ───────────
//     Anyone who sees a SAISEN cast will see this frame.
export async function GET() {
  return frameResponse({
    image:   FRAME,
    postUrl: `${APP}/api/frame`,
    buttons: [
      { label: "⚡ Play SAISEN" },
    ],
  });
}

// ─── POST — user tapped a button in the cast feed ────────────
//     Show a second frame with two options.
export async function POST(_req: NextRequest) {
  return frameResponse({
    image:   PREV,
    postUrl: `${APP}/api/frame/play`,
    buttons: [
      { label: "🎮 Launch Game"   },
      { label: "🏆 Leaderboard"  },
    ],
  });
}