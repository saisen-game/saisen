import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying SaisenScore...");
  console.log("Deployer address:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  const Factory  = await ethers.getContractFactory("SaisenScore");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("\n✅ SaisenScore deployed to:", address);
  console.log("\nAdd this to your .env.local:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log("\nVerify on Basescan:");
  console.log(`npx hardhat verify --network base-sepolia ${address}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});