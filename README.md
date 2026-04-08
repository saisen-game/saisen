# SAISEN Arena
### Competitive Engine for Humans and Agents

> Skill-based 1v1 reaction duels · Programmable agents · On-chain ELO · Farcaster-native

---

## Architecture

```
saisen/
├── packages/
│   ├── core/       # game engine, battle logic, ELO, anti-cheat
│   ├── agents/     # agent class, skill registry, built-in skills
│   └── cli/        # `saisen` CLI tool
├── services/
│   ├── leaderboard/  # KV-backed leaderboard abstraction
│   └── security/     # rate limiting + score validation
└── apps/
    └── web/          # Next.js (UI + API routes)
```

---

## Prerequisites

| Tool       | Version |
|------------|---------|
| Node.js    | ≥ 20    |
| pnpm       | ≥ 9     |

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/ClawParallel/saisen && cd saisen

# 2. Install all workspace dependencies
pnpm install

# 3. Build all packages
pnpm build

# 4. Set up environment
cp .env.example apps/web/.env.local
# → Fill in WalletConnect project ID, Vercel KV vars, etc.

# 5. Deploy the smart contract (Base Sepolia first)
pnpm --filter @saisen/web deploy:base-sepolia
# → Copy contract address into apps/web/.env.local

# 6. Run the web app
pnpm web
# → http://localhost:3000

# 7. Link the CLI globally
pnpm cli:link
# → `saisen` is now available globally
```

---

## CLI Usage

```bash
# Show help
saisen --help

# Check API status
saisen status

# ── Agents ────────────────────────────────────────────────────
# Create an agent with default skill
saisen agent create MyBot

# Create with specific skills (priority order)
saisen agent create Apex --skills adaptive,reaction,precision

# List all local agents
saisen agent list

# Show agent config
saisen agent show MyBot

# Delete an agent
saisen agent delete MyBot

# ── Skills ────────────────────────────────────────────────────
# List registered skills
saisen skill list

# Install from marketplace (coming soon)
saisen skill install speed-clicker

# ── Battle ────────────────────────────────────────────────────
# Run a server-side agent vs agent battle
saisen battle MyBot Apex

# With difficulty and duration options
saisen battle MyBot Apex --difficulty hard --duration 20000

# ── Leaderboard ───────────────────────────────────────────────
# Show top 20 by ELO
saisen leaderboard

# Show top 50 sorted by wins
saisen leaderboard --limit 50 --sort wins

# ── Submit ────────────────────────────────────────────────────
# Manually submit a result (FID-based)
saisen submit --player 12345 --score 28 --win --username alice

# Wallet-based
saisen submit --player 0xABCD...1234 --score 22
```

---

## API Reference

| Method | Endpoint           | Description                        |
|--------|--------------------|------------------------------------|
| GET    | `/api/health`      | Health check                       |
| GET    | `/api/leaderboard` | Ranked entries (`?limit=&sort=`)   |
| POST   | `/api/submit`      | Submit match result                |
| POST   | `/api/battle`      | Run server-side agent vs agent     |
| GET    | `/api/frame`       | Farcaster Frame entry point        |
| POST   | `/api/frame`       | Frame button tap handler           |
| POST   | `/api/frame/play`  | Frame deep-link redirect           |

### POST /api/battle

```json
{
  "agentA":     { "id": "...", "name": "Alpha", "skills": ["reaction"] },
  "agentB":     { "id": "...", "name": "Beta",  "skills": ["precision"] },
  "difficulty": "medium",
  "durationMs": 30000
}
```

### POST /api/submit

```json
{
  "fid":      12345,
  "username": "alice",
  "win":      true,
  "score":    28,
  "elo":      1040
}
```

---

## Built-in Skills

| Skill      | Strategy                                              |
|------------|-------------------------------------------------------|
| `reaction` | Clicks newest target with realistic reaction lag      |
| `precision`| Prioritises largest target — maximises hit certainty  |
| `adaptive` | Adjusts aggression based on score gap + match state   |

---

## Running Tests

```bash
# All packages
pnpm test

# Core only
pnpm --filter @saisen/core test

# Watch mode
pnpm --filter @saisen/core exec vitest
```

---

## Deployment

```bash
# Deploy to Vercel
vercel --prod

# Or push to GitHub — Vercel auto-deploys on push to main

# Required Vercel env vars:
# NEXT_PUBLIC_APP_URL
# NEXT_PUBLIC_CHAIN_ID
# NEXT_PUBLIC_CONTRACT_ADDRESS
# NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
# KV_URL + KV_REST_API_URL + KV_REST_API_TOKEN
```

---

## Farcaster Frame

Test your frame at:
```
https://warpcast.com/~/developers/frames?url=https://saisen.xyz/api/frame
```

Test Mini App at:
```
https://warpcast.com/~/developers/mini-apps
→ URL: https://saisen.xyz
```

---

## Extending SAISEN

### Add a custom skill

```typescript
// packages/agents/src/skills/mySkill.ts
import type { SkillDefinition } from "@saisen/core";

export const mySkill: SkillDefinition = {
  name:        "my-skill",
  version:     "1.0.0",
  description: "My custom strategy",
  execute({ state, elapsedMs }) {
    // Return index of target to click, or -1 to skip
    if (state.targets.length === 0) return -1;
    return 0; // always click first available target
  },
};
```

```typescript
// Register it
import { skillRegistry } from "@saisen/agents";
import { mySkill }       from "./skills/mySkill.js";
skillRegistry.register(mySkill);
```

```bash
# Use it in an agent
saisen agent create Tactician --skills my-skill,reaction
saisen battle Tactician MyBot
```

---

> Additional features will be introduced as the system evolves.