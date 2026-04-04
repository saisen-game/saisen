import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🚀 Deploying SaisenScore...");
  console.log("👤 Deployer:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH");

  if (balance === BigInt(0)) {
    throw new Error("❌ Wallet has no ETH. Fund it before deploying.");
  }

  const Factory = await ethers.getContractFactory("SaisenScore");
  const contract = await Factory.deploy();

  console.log("⏳ Deploying contract...");
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("\n✅ SaisenScore deployed to:", address);

  console.log("\n📌 Add this to your .env.local:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);

  console.log("\n🔎 Verify on Basescan:");
  console.log(`npx hardhat verify --network base ${address}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:");
  console.error(error);
  process.exit(1);
});