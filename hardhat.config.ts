import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// 🔐 VALIDATION (WAJIB)
const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY;

if (!DEPLOYER_KEY) {
  throw new Error("❌ DEPLOYER_PRIVATE_KEY is missing in .env.local");
}

if (!BASESCAN_API_KEY) {
  console.warn("⚠️ BASESCAN_API_KEY missing (verify will fail)");
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    base: {
      url: "https://mainnet.base.org",
      accounts: [DEPLOYER_KEY],
      chainId: 8453,
    },

    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [DEPLOYER_KEY],
      chainId: 84532,
    },
  },

  etherscan: {
    apiKey: {
      base: BASESCAN_API_KEY ?? "",
      baseSepolia: BASESCAN_API_KEY ?? "",
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
};

export default config;