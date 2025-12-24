import { ethers } from "hardhat";
import deployment from "../frontend/contracts/deployment.json";
import { ABIS } from "../frontend/contracts/abis";

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("Testing deployment with signer:", signer.address);

    const deployer = new ethers.Contract(deployment.predictionMarketDeployer, ABIS.PredictionMarketDeployer, signer);

    // Mock Params for a Custom Market
    const questionId = ethers.keccak256(ethers.toUtf8Bytes("Test Question " + Date.now()));
    const collateralToken = deployment.mockToken;
    const deadline = Math.floor(Date.now() / 1000) + 3600;
    const outcomes = 2;
    const b = ethers.parseUnits("100", 18);
    const metadataURI = "data:application/json;base64,e30=";

    console.log("Calling deployMarketWithExistingQuestion...");
    console.log("Deployer Address:", deployment.predictionMarketDeployer);

    // We expect this to fail if there's a contract issue, or succeed if it's fine.
    const tx = await deployer.deployMarketWithExistingQuestion(
        deployment.mockOracle,
        questionId,
        collateralToken,
        deadline,
        outcomes,
        b,
        0, // flags
        metadataURI
    );

    console.log("Tx sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("Tx mined. Status:", receipt.status);

    if (receipt.status === 1) {
        console.log("Deployment Successful!");
        // Find MarketCreated log
        // The Deployer emits MarketCreated(marketId, ...)
        // We can just look for logs
        const log = receipt.logs.find(l => l.address.toLowerCase() === deployment.predictionMarketDeployer.toLowerCase());
        if (log) {
            console.log("Found Deployer Log");
        }
    } else {
        console.error("Deployment Failed");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
