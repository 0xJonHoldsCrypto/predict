import { ethers } from "hardhat";
import deployment from "../frontend/contracts/deployment.json";
import { ABIS } from "../frontend/contracts/abis";

async function main() {
    console.log("Debugging Market Resolution on Hemi Mainnet...");

    const [signer] = await ethers.getSigners();
    console.log("Signer:", signer.address);

    // Contract Instances
    const marketCore = new ethers.Contract(deployment.marketCore, ABIS.MarketCore, signer);
    const oracleAdapter = new ethers.Contract(deployment.oracleAdapter, [
        "function getQuestionConfig(bytes32 questionId) external view returns (address pool, address baseToken, address quoteToken, uint256 threshold, uint32 twapWindow, uint64 evalTime, bool greaterThan)",
        "function getOutcome(bytes32 questionId) external view returns (uint8 winningOutcomeIndex, bool isInvalid, bool resolved, uint256 resolutionTime)",
        "function requestResolution(bytes32 questionId) external",
        "function getHemiEthUsdPrice() external view returns (uint256)"
    ], signer);

    // Fetch Logs to find recent markets
    // Filter: MarketCreated
    const filter = marketCore.filters.MarketCreated();
    const logs = await marketCore.queryFilter(filter, -5000); // Check last 5000 blocks

    console.log(`Found ${logs.length} markets in recent blocks.`);

    for (const log of logs.reverse().slice(0, 5)) { // Check last 5 markets
        const args = log.args;
        const marketId = args.marketId;
        const oracleAddress = args.oracle;
        const questionId = args.questionId;
        const deadline = args.marketDeadline;

        console.log(`\n--------------------------------------------------`);
        console.log(`Market ID: ${marketId}`);
        console.log(`Question ID: ${questionId}`);
        console.log(`Oracle Address used: ${oracleAddress}`);

        if (oracleAddress.toLowerCase() === deployment.oracleAdapter.toLowerCase()) {
            console.log("✅ Uses NEW Oracle Adapter");
        } else {
            console.log("⚠️ Uses OLD/DIFFERENT Oracle Adapter");
        }

        const deadlineDate = new Date(Number(deadline) * 1000);
        console.log(`Deadline: ${deadline} (${deadlineDate.toLocaleString()})`);

        const now = Math.floor(Date.now() / 1000);
        const hasPassed = now > Number(deadline);
        console.log(`Deadline Passed? ${hasPassed ? "YES" : "NO"}`);

        // Check Contract State
        const marketState = await marketCore.getMarketState(marketId);
        // enum: 0=Open, 1=Resolvable, 2=Resolved
        const statusMap = ["Open", "Resolvable", "Resolved"];
        console.log(`Market Status: ${statusMap[Number(marketState[0])]}`);

        if (oracleAddress.toLowerCase() !== deployment.oracleAdapter.toLowerCase()) {
            console.log("Skipping detailed oracle check for mismatched adapter.");
            continue;
        }

        // Check Oracle State
        try {
            const config = await oracleAdapter.getQuestionConfig(questionId);
            console.log(`Oracle Config: TwapWindow=${config.twapWindow}, EvalTime=${config.evalTime}`);

            const outcome = await oracleAdapter.getOutcome(questionId);
            console.log(`Oracle Outcome: Resolved=${outcome.resolved}, Winner=${outcome.winningOutcomeIndex}`);

            if (hasPassed && !outcome.resolved) {
                console.log("❓ Market passed deadline but Oracle not resolved.");
                // Try simulating requestResolution
                try {
                    await oracleAdapter.requestResolution.staticCall(questionId);
                    console.log("✅ `requestResolution` simulation SUCCESS. You can execute this transaction.");
                } catch (e: any) {
                    console.log("❌ `requestResolution` simulation FAILED:", e.reason || e.message);
                }
            } else if (marketState[0] === 1n && outcome.resolved) {
                console.log("✅ Ready to Finalize. Oracle resolved.");
            }

        } catch (e) {
            console.log("Error checking oracle:", e);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
