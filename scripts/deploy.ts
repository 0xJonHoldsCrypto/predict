import { ethers, network } from "hardhat";
import { Contract, ContractFactory } from "ethers";

/**
 * Hemi Prediction Markets - Full System Deployment Script
 *
 * Deployment Order (due to constructor dependencies):
 *
 * The system has a circular dependency:
 * - OutcomeToken1155 needs minter addresses (MarketCore, FpmmAMM)
 * - MarketCore needs OutcomeToken1155 address
 * - FpmmAMM needs both MarketCore and OutcomeToken1155 addresses
 *
 * Solution: Two-phase deployment using pre-computed addresses
 *
 * Phase 1: Compute deterministic addresses for MarketCore and FpmmAMM
 * Phase 2: Deploy in this order:
 *   1. OutcomeToken1155 (with pre-computed minter addresses)
 *   2. MarketCore (needs outcomeToken1155)
 *   3. FpmmAMM (needs marketCore, outcomeToken1155)
 *   4. UniV3EthUsdTwapOracleAdapter (standalone)
 *   5. PredictionMarketDeployer (needs marketCore, fpmmAMM, outcomeToken1155)
 *   6. SimpleRouter (needs marketCore, fpmmAMM, outcomeToken1155)
 */

// Configuration
const TOKEN_URI = "https://api.hemi.xyz/prediction-markets/tokens/";

interface DeploymentResult {
  outcomeToken1155: string;
  marketCore: string;
  fpmmAMM: string;
  oracleAdapter: string;
  predictionMarketDeployer: string;
  simpleRouter: string;
  deployer: string;
  network: string;
  chainId: number;
  timestamp: string;
}

/**
 * Compute the address a contract will be deployed to
 * Uses the standard CREATE opcode formula: address = keccak256(rlp([sender, nonce]))[12:]
 */
async function computeContractAddress(
  deployerAddress: string,
  nonce: number
): Promise<string> {
  return ethers.getCreateAddress({
    from: deployerAddress,
    nonce: nonce,
  });
}

async function main(): Promise<DeploymentResult> {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║       Hemi Prediction Markets - Deployment Script            ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const startingNonce = await ethers.provider.getTransactionCount(deployerAddress);
  const chainId = Number((await ethers.provider.getNetwork()).chainId);

  console.log("Deployment Configuration:");
  console.log("─".repeat(60));
  console.log(`  Network:        ${network.name}`);
  console.log(`  Chain ID:       ${chainId}`);
  console.log(`  Deployer:       ${deployerAddress}`);
  console.log(`  Starting Nonce: ${startingNonce}`);
  console.log(`  Token URI:      ${TOKEN_URI}`);
  console.log("─".repeat(60) + "\n");

  // ═══════════════════════════════════════════════════════════════════════════
  // Phase 1: Pre-compute addresses for circular dependency resolution
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("Phase 1: Computing Deterministic Addresses");
  console.log("─".repeat(60));

  // Deployment order and nonce assignments:
  // nonce + 0: OutcomeToken1155
  // nonce + 1: MarketCore
  // nonce + 2: FpmmAMM
  // nonce + 3: UniV3EthUsdTwapOracleAdapter
  // nonce + 4: PredictionMarketDeployer
  // nonce + 5: SimpleRouter

  const predictedOutcomeToken1155 = await computeContractAddress(deployerAddress, startingNonce);
  const predictedMarketCore = await computeContractAddress(deployerAddress, startingNonce + 1);
  const predictedFpmmAMM = await computeContractAddress(deployerAddress, startingNonce + 2);
  const predictedOracleAdapter = await computeContractAddress(deployerAddress, startingNonce + 3);
  const predictedDeployer = await computeContractAddress(deployerAddress, startingNonce + 4);
  const predictedRouter = await computeContractAddress(deployerAddress, startingNonce + 5);

  console.log("  Pre-computed addresses:");
  console.log(`    OutcomeToken1155:          ${predictedOutcomeToken1155}`);
  console.log(`    MarketCore:                ${predictedMarketCore}`);
  console.log(`    FpmmAMM:                   ${predictedFpmmAMM}`);
  console.log(`    UniV3EthUsdTwapOracle:     ${predictedOracleAdapter}`);
  console.log(`    PredictionMarketDeployer:  ${predictedDeployer}`);
  console.log(`    SimpleRouter:              ${predictedRouter}`);
  console.log("─".repeat(60) + "\n");

  // ═══════════════════════════════════════════════════════════════════════════
  // Phase 2: Deploy contracts in dependency order
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("Phase 2: Deploying Contracts");
  console.log("═".repeat(60) + "\n");

  // ───────────────────────────────────────────────────────────────────────────
  // Deploy 1: OutcomeToken1155
  // ───────────────────────────────────────────────────────────────────────────
  console.log("1/6 Deploying OutcomeToken1155...");

  // Minters are MarketCore and FpmmAMM (using pre-computed addresses)
  const minters = [predictedMarketCore, predictedFpmmAMM];

  const OutcomeToken1155 = await ethers.getContractFactory("OutcomeToken1155");
  const outcomeToken1155 = await OutcomeToken1155.deploy(minters, TOKEN_URI);
  await outcomeToken1155.waitForDeployment();
  const outcomeToken1155Address = await outcomeToken1155.getAddress();

  // Verify address matches prediction
  if (outcomeToken1155Address.toLowerCase() !== predictedOutcomeToken1155.toLowerCase()) {
    throw new Error(
      `Address mismatch! Predicted: ${predictedOutcomeToken1155}, Got: ${outcomeToken1155Address}`
    );
  }
  console.log(`   ✓ OutcomeToken1155 deployed at: ${outcomeToken1155Address}`);
  console.log(`     Minters: [${minters.join(", ")}]\n`);

  // ───────────────────────────────────────────────────────────────────────────
  // Deploy 2: MarketCore
  // ───────────────────────────────────────────────────────────────────────────
  console.log("2/6 Deploying MarketCore...");

  const MarketCore = await ethers.getContractFactory("MarketCore");
  const marketCore = await MarketCore.deploy(outcomeToken1155Address);
  await marketCore.waitForDeployment();
  const marketCoreAddress = await marketCore.getAddress();

  // Verify address matches prediction
  if (marketCoreAddress.toLowerCase() !== predictedMarketCore.toLowerCase()) {
    throw new Error(
      `Address mismatch! Predicted: ${predictedMarketCore}, Got: ${marketCoreAddress}`
    );
  }
  console.log(`   ✓ MarketCore deployed at: ${marketCoreAddress}`);
  console.log(`     OutcomeToken1155: ${outcomeToken1155Address}\n`);

  // ───────────────────────────────────────────────────────────────────────────
  // Deploy 3: FpmmAMM
  // ───────────────────────────────────────────────────────────────────────────
  console.log("3/6 Deploying FpmmAMM...");

  const FpmmAMM = await ethers.getContractFactory("FpmmAMM");
  const fpmmAMM = await FpmmAMM.deploy(marketCoreAddress, outcomeToken1155Address);
  await fpmmAMM.waitForDeployment();
  const fpmmAMMAddress = await fpmmAMM.getAddress();

  // Verify address matches prediction
  if (fpmmAMMAddress.toLowerCase() !== predictedFpmmAMM.toLowerCase()) {
    throw new Error(
      `Address mismatch! Predicted: ${predictedFpmmAMM}, Got: ${fpmmAMMAddress}`
    );
  }
  console.log(`   ✓ FpmmAMM deployed at: ${fpmmAMMAddress}`);
  console.log(`     MarketCore: ${marketCoreAddress}`);
  console.log(`     OutcomeToken1155: ${outcomeToken1155Address}\n`);

  // ───────────────────────────────────────────────────────────────────────────
  // Deploy 4: UniV3EthUsdTwapOracleAdapter
  // ───────────────────────────────────────────────────────────────────────────
  console.log("4/6 Deploying UniV3EthUsdTwapOracleAdapter...");

  const OracleAdapter = await ethers.getContractFactory("UniV3EthUsdTwapOracleAdapter");
  const oracleAdapter = await OracleAdapter.deploy();
  await oracleAdapter.waitForDeployment();
  const oracleAdapterAddress = await oracleAdapter.getAddress();

  console.log(`   ✓ UniV3EthUsdTwapOracleAdapter deployed at: ${oracleAdapterAddress}`);
  console.log(`     Hemi ETH/USDC Pool: 0x9580D4519C9F27642e21085E763E761a74eF3735`);
  console.log(`     Hemi WETH: 0x4200000000000000000000000000000000000006`);
  console.log(`     Hemi USDC.e: 0xad11a8BEb98bbf61dbb1aa0F6d6F2ECD87b35afA\n`);

  // ───────────────────────────────────────────────────────────────────────────
  // Deploy 5: PredictionMarketDeployer
  // ───────────────────────────────────────────────────────────────────────────
  console.log("5/6 Deploying PredictionMarketDeployer...");

  const PredictionMarketDeployer = await ethers.getContractFactory("PredictionMarketDeployer");
  const predictionMarketDeployer = await PredictionMarketDeployer.deploy(
    marketCoreAddress,
    fpmmAMMAddress,
    outcomeToken1155Address
  );
  await predictionMarketDeployer.waitForDeployment();
  const predictionMarketDeployerAddress = await predictionMarketDeployer.getAddress();

  console.log(`   ✓ PredictionMarketDeployer deployed at: ${predictionMarketDeployerAddress}`);
  console.log(`     MarketCore: ${marketCoreAddress}`);
  console.log(`     FpmmAMM: ${fpmmAMMAddress}`);
  console.log(`     OutcomeToken1155: ${outcomeToken1155Address}\n`);

  // ───────────────────────────────────────────────────────────────────────────
  // Deploy 6: SimpleRouter
  // ───────────────────────────────────────────────────────────────────────────
  console.log("6/6 Deploying SimpleRouter...");

  const SimpleRouter = await ethers.getContractFactory("SimpleRouter");
  const simpleRouter = await SimpleRouter.deploy(
    marketCoreAddress,
    fpmmAMMAddress,
    outcomeToken1155Address
  );
  await simpleRouter.waitForDeployment();
  const simpleRouterAddress = await simpleRouter.getAddress();

  console.log(`   ✓ SimpleRouter deployed at: ${simpleRouterAddress}`);
  console.log(`     MarketCore: ${marketCoreAddress}`);
  console.log(`     FpmmAMM: ${fpmmAMMAddress}`);
  console.log(`     OutcomeToken1155: ${outcomeToken1155Address}\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  // Verification: Check minter authorization
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("Verification: Checking Minter Authorization");
  console.log("─".repeat(60));

  const isMarketCoreMinter = await outcomeToken1155.isMinter(marketCoreAddress);
  const isFpmmAMMMinter = await outcomeToken1155.isMinter(fpmmAMMAddress);

  console.log(`  MarketCore is minter:  ${isMarketCoreMinter ? "✓ Yes" : "✗ No"}`);
  console.log(`  FpmmAMM is minter:     ${isFpmmAMMMinter ? "✓ Yes" : "✗ No"}`);

  if (!isMarketCoreMinter || !isFpmmAMMMinter) {
    throw new Error("Minter verification failed! Contracts cannot mint tokens.");
  }
  console.log("─".repeat(60) + "\n");

  // ═══════════════════════════════════════════════════════════════════════════
  // Deployment Summary
  // ═══════════════════════════════════════════════════════════════════════════

  const result: DeploymentResult = {
    outcomeToken1155: outcomeToken1155Address,
    marketCore: marketCoreAddress,
    fpmmAMM: fpmmAMMAddress,
    oracleAdapter: oracleAdapterAddress,
    predictionMarketDeployer: predictionMarketDeployerAddress,
    simpleRouter: simpleRouterAddress,
    deployer: deployerAddress,
    network: network.name,
    chainId: chainId,
    timestamp: new Date().toISOString(),
  };

  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║                   DEPLOYMENT COMPLETE                        ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  console.log("Deployed Contract Addresses:");
  console.log("─".repeat(60));
  console.log(`  OutcomeToken1155:          ${result.outcomeToken1155}`);
  console.log(`  MarketCore:                ${result.marketCore}`);
  console.log(`  FpmmAMM:                   ${result.fpmmAMM}`);
  console.log(`  UniV3EthUsdTwapOracle:     ${result.oracleAdapter}`);
  console.log(`  PredictionMarketDeployer:  ${result.predictionMarketDeployer}`);
  console.log(`  SimpleRouter:              ${result.simpleRouter}`);
  console.log("─".repeat(60) + "\n");

  console.log("Configuration Summary:");
  console.log("─".repeat(60));
  console.log("  Core contracts (use these for integrations):");
  console.log(`    MarketCore:       ${result.marketCore}`);
  console.log(`    FpmmAMM:          ${result.fpmmAMM}`);
  console.log(`    OutcomeToken1155: ${result.outcomeToken1155}\n`);

  console.log("  Helper contracts (use for convenience):");
  console.log(`    PredictionMarketDeployer: ${result.predictionMarketDeployer}`);
  console.log(`    SimpleRouter:             ${result.simpleRouter}\n`);

  console.log("  Oracle:");
  console.log(`    UniV3EthUsdTwapOracleAdapter: ${result.oracleAdapter}`);
  console.log("─".repeat(60) + "\n");

  // Output JSON for programmatic use
  console.log("JSON Output (for scripts/configs):");
  console.log(JSON.stringify(result, null, 2));

  return result;
}

// Execute deployment
main()
  .then((result) => {
    console.log("\nDeployment successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nDeployment failed!");
    console.error(error);
    process.exit(1);
  });
