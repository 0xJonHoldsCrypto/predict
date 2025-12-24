import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
    const deploymentPath = path.join(__dirname, "../frontend/contracts/deployment.json");
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

    console.log("Current Deployment config:");
    console.log("MarketCore:", deployment.marketCore);
    console.log("FpmmAMM:", deployment.fpmmAMM);
    console.log("OutcomeToken1155:", deployment.outcomeToken1155);

    if (!deployment.marketCore || !deployment.fpmmAMM || !deployment.outcomeToken1155) {
        throw new Error("Missing dependency addresses in deployment.json");
    }

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    const PredictionMarketDeployer = await ethers.getContractFactory("PredictionMarketDeployer");
    const predictionMarketDeployer = await PredictionMarketDeployer.deploy(
        deployment.marketCore,
        deployment.fpmmAMM,
        deployment.outcomeToken1155
    );
    await predictionMarketDeployer.waitForDeployment();
    const deployerAddr = await predictionMarketDeployer.getAddress();

    console.log("PredictionMarketDeployer redeployed to:", deployerAddr);

    // Update deployment.json
    deployment.predictionMarketDeployer = deployerAddr;
    fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 4));
    console.log("Updated deployment.json");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
