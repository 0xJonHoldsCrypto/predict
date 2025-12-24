import { ethers } from "hardhat";
import deployment from "../frontend/contracts/deployment.json";
import { ABIS } from "../frontend/contracts/abis";

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("Testing Price Market Deployment with signer:", signer.address);

    const deployer = new ethers.Contract(deployment.predictionMarketDeployer, ABIS.PredictionMarketDeployer, signer);

    // Mock Params for a Price spec Market (ETH > 3000)
    const asset = {
        symbol: 'ETH',
        name: 'Ether',
        pool: '0x9580D4519C9F27642e21085E763E761a74eF3735',
        baseToken: '0x4200000000000000000000000000000000000006',
        quoteToken: '0xad11a8BEb98bbf61dbb1aa0F6d6F2ECD87b35afA'
    };

    const threshold = ethers.parseUnits("3000", 6); // USDC 6 decimals
    const date = new Date(Date.now() + 3600 * 1000); // 1 hour from now
    const evalTime = BigInt(Math.floor(date.getTime() / 1000));
    const marketDeadline = evalTime;
    const twapWindow = 1800;

    // Collateral
    const collateralToken = deployment.mockToken;
    const liquidityParameterB = ethers.parseUnits('1000', 18);

    const params = {
        oracleAdapter: deployment.oracleAdapter,
        pool: asset.pool,
        baseToken: asset.baseToken,
        quoteToken: asset.quoteToken,
        collateralToken: collateralToken,
        threshold: threshold,
        liquidityParameterB: liquidityParameterB,
        evalTime: evalTime,
        marketDeadline: marketDeadline,
        twapWindow: twapWindow,
        configFlags: 0,
        greaterThan: true
    };

    const metadata = {
        question: "Will ETH be above $3000?",
        description: "Test Market",
    };
    const metadataURI = `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString('base64')}`;

    console.log("Calling deployEthUsdThresholdMarket...");
    console.log("Params:", JSON.stringify(params, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));

    try {
        const tx = await deployer.deployEthUsdThresholdMarket(params, metadataURI);
        console.log("Tx sent:", tx.hash);
        const receipt = await tx.wait();
        console.log("Tx mined. Status:", receipt.status);

        if (receipt.status === 1) {
            console.log("Price Market Deployment Successful!");
        } else {
            console.error("Deployment Failed (Reverted)");
        }
    } catch (error) {
        console.error("Deployment Error:", error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
