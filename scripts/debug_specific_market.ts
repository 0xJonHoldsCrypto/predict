import { ethers } from "ethers";
import fs from "fs";
import path from "path";

async function main() {
    const deploymentPath = path.join(__dirname, "../frontend/contracts/deployment.json");
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    const marketId = "0x6b17db7608584ec90c4a9bf4cdc86af336a3abe219ea134cb3fa5d107b7da28e";

    const rpcUrl = "https://testnet.rpc.hemi.network/rpc";
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const marketCoreAbi = [
        "function getMarketParams(bytes32 marketId) external view returns (address oracle, address collateralToken, uint256 marketDeadline, uint256 evalTime, uint256 twapWindow, uint256 configFlags, bool greaterThan, string metadataURI)"
    ];

    const marketCore = new ethers.Contract(deployment.marketCore, marketCoreAbi, provider);

    console.log(`Fetching params for Market ${marketId}...`);
    try {
        const params = await marketCore.getMarketParams(marketId);
        console.log("On-Chain Params:");
        console.log("- Oracle:", params.oracle);
        console.log("- Deadline:", params.marketDeadline.toString(), `(${new Date(Number(params.marketDeadline) * 1000).toUTCString()})`);
        console.log("- EvalTime:", params.evalTime.toString(), `(${new Date(Number(params.evalTime) * 1000).toUTCString()})`);

        const now = Math.floor(Date.now() / 1000);
        console.log("- Current Time:", now);
        console.log("- Time Remaining:", Number(params.marketDeadline) - now, "seconds");

        if (Number(params.marketDeadline) < now) {
            console.error("ALERT: Market deadline is in the past!");
        } else {
            console.log("STATUS: Market is OPEN and deadline is in the future.");
        }

    } catch (e) {
        console.error("Global fetch failed:", e);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
