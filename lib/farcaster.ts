export interface FarcasterUser {
  fid:         number;
  username:    string;
  displayName: string;
  pfpUrl:      string;
}

export interface SaisenContext {
  user:          FarcasterUser | null;
  isInFarcaster: boolean;
  sdk:           typeof import("@farcaster/frame-sdk").default | null;
}

// Singleton — only initialised once per page lifecycle
let _ctx: SaisenContext | null = null;

export async function initFarcaster(): Promise<SaisenContext> {
  if (_ctx) return _ctx;

  // SSR guard
  if (typeof window === "undefined") {
    _ctx = { user: null, isInFarcaster: false, sdk: null };
    return _ctx;
  }

  try {
    // 🔥 1. Detect Mini App (NEW SYSTEM)
    let isMiniApp = false;

    try {
      const { isInMiniApp } = await import("@farcaster/miniapp-sdk");
      isMiniApp = isInMiniApp();
    } catch {
      isMiniApp = false;
    }

    // 🔥 2. Try Frame SDK (LEGACY SUPPORT)
    const { default: sdk } = await import("@farcaster/frame-sdk");

    const context = await Promise.race([
      sdk.context as Promise<any>,
      new Promise<null>((res) => setTimeout(() => res(null), 3000)),
    ]);

    if (context?.user?.fid) {
      try {
        await sdk.actions.ready({ disableNativeGestures: true });
      } catch {}

      _ctx = {
        sdk,
        isInFarcaster: true,
        user: {
          fid:         context.user.fid,
          username:    context.user.username    ?? `fid:${context.user.fid}`,
          displayName: context.user.displayName ?? context.user.username ?? "Player",
          pfpUrl:      context.user.pfpUrl      ?? "",
        },
      };
    } else if (isMiniApp) {
      // 🔥 3. Mini App fallback (no context yet, but still Farcaster)
      _ctx = {
        sdk: null,
        isInFarcaster: true,
        user: null, // nanti bisa diisi via auth kalau mau
      };
    } else {
      _ctx = { sdk: null, isInFarcaster: false, user: null };
    }
  } catch {
    _ctx = { sdk: null, isInFarcaster: false, user: null };
  }

  return _ctx;
}

export function resetFarcasterContext(): void {
  _ctx = null;
}