import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  parseAbi,
} from "viem";
import { base, baseSepolia } from "viem/chains";

// ─── Config ──────────────────────────────────────────────────
export const CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "0x0") as `0x${string}`;

const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? "8453");
export const TARGET_CHAIN = CHAIN_ID === 8453 ? base : baseSepolia;

// ─── ABI ─────────────────────────────────────────────────────
export const ABI = parseAbi([
  "function submitScore(uint256 score, bool win, uint256 matchDuration) external",
  "function getPlayerStats(address player) external view returns ((uint256 totalScore, uint256 wins, uint256 losses, uint256 rating, uint256 totalMatches, uint256 lastSubmission))",
  "function getRegisteredCount() external view returns (uint256)",
  "function getBatchStats(address[] calldata addrs) external view returns ((uint256 totalScore, uint256 wins, uint256 losses, uint256 rating, uint256 totalMatches, uint256 lastSubmission)[])",
  "function registeredPlayers(uint256) external view returns (address)",
  "event ScoreSubmitted(address indexed player, uint256 score, bool win, uint256 newRating, uint256 timestamp)",
]);

// ─── Public client (read-only, no wallet needed) ─────────────
export const publicClient = createPublicClient({
  chain:     TARGET_CHAIN,
  transport: http(),
});

// ─── Write: submit a match result on-chain ───────────────────
export async function submitScoreOnChain(
  score:         number,
  win:           boolean,
  matchDuration: number  // seconds
): Promise<`0x${string}`> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No injected wallet found");
  }

  const walletClient = createWalletClient({
    chain:     TARGET_CHAIN,
    transport: custom(window.ethereum as any),
  });

  const [account] = await walletClient.getAddresses();
  if (!account) throw new Error("No account connected");

  const hash = await walletClient.writeContract({
    address:      CONTRACT_ADDRESS,
    abi:          ABI,
    functionName: "submitScore",
    args:         [BigInt(score), win, BigInt(matchDuration)],
    account,
  });

  return hash;
}

// ─── Read: single player stats ───────────────────────────────
export async function fetchOnChainStats(player: `0x${string}`) {
  return publicClient.readContract({
    address:      CONTRACT_ADDRESS,
    abi:          ABI,
    functionName: "getPlayerStats",
    args:         [player],
  });
}

// ─── Read: leaderboard (first `limit` registered players) ────
export async function fetchOnChainLeaderboard(limit = 100) {
  const count = await publicClient.readContract({
    address:      CONTRACT_ADDRESS,
    abi:          ABI,
    functionName: "getRegisteredCount",
  });

  const n = Math.min(Number(count), limit);
  if (n === 0) return [];

  const addrs = await Promise.all(
    Array.from({ length: n }, (_, i) =>
      publicClient.readContract({
        address:      CONTRACT_ADDRESS,
        abi:          ABI,
        functionName: "registeredPlayers",
        args:         [BigInt(i)],
      })
    )
  );

  const stats = await publicClient.readContract({
    address:      CONTRACT_ADDRESS,
    abi:          ABI,
    functionName: "getBatchStats",
    args:         [addrs as `0x${string}`[]],
  });

  return (stats as any[]).map((s, i) => ({
    address:  addrs[i] as string,
    rating:   Number(s.rating),
    wins:     Number(s.wins),
    losses:   Number(s.losses),
    score:    Number(s.totalScore),
    matches:  Number(s.totalMatches),
  }));
}