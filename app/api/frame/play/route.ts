import { NextRequest } from "next/server";

const APP  = process.env.NEXT_PUBLIC_APP_URL ?? "https://saisen.vercel.app/";
const PREV = `${APP}/game-preview.png`;

// ─── POST — final step: deep-link into the Mini App ──────────
//     Button 1 → open game
//     Button 2 → open leaderboard
export async function POST(req: NextRequest) {
  // Parse button index from Farcaster payload
  let buttonIndex = 1;
  try {
    const body = await req.json();
    buttonIndex = body?.untrustedData?.buttonIndex ?? 1;
  } catch {}

  // Resolve destination URL
  const target =
    buttonIndex === 2
      ? `${APP}/?view=leaderboard`  // leaderboard deep-link
      : APP;                         // home → auto-starts game

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta http-equiv="refresh" content="0;url=${target}" />

  <!-- Frame meta so the client can render it before redirecting -->
  <meta property="og:image"                content="${PREV}" />
  <meta name="fc:frame"                    content="vNext" />
  <meta name="fc:frame:image"              content="${PREV}" />
  <meta name="fc:frame:image:aspect_ratio" content="1.91:1" />

  <!-- Single "Open" button that links directly to the Mini App -->
  <meta name="fc:frame:button:1"           content="🚀 Open SAISEN" />
  <meta name="fc:frame:button:1:action"    content="link" />
  <meta name="fc:frame:button:1:target"    content="${target}" />
</head>
<body style="background:#06060f;color:#fff;font-family:sans-serif;text-align:center;padding:40px">
  <p>Redirecting to SAISEN…</p>
  <a href="${target}" style="color:#9f5fff">Click here if not redirected</a>
</body>
</html>`;

  return new Response(html, {
    status:  200,
    headers: {
      "Content-Type":  "text/html",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}