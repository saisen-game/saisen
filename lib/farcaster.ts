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
    const { default: sdk } = await import("@farcaster/frame-sdk");

    const context = await Promise.race([
      sdk.context as Promise<any>, // 🔥 FIX: no FrameContext
      new Promise<null>((res) => setTimeout(() => res(null), 3000)),
    ]);

    if (context?.user?.fid) {
      await sdk.actions.ready({ disableNativeGestures: true });

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