import { ethers } from "hardhat";
import deployment from "../frontend/contracts/deployment.json";
import { ABIS } from "../frontend/contracts/abis";

async function main() {
    const marketId = "0xa215011ab5adf1c24cb3598fdfec0a560a41cc5289634fcd8af15980efd4cf2e";
    const userAddress = "0x8b838891d8Bdf63C4939bad3Ca8e0DFb5C854E32"; // The address from the screenshot (Add LP)
    // const otherAddress = "0xf99b...7a51"; // The buyer in the screenshot - we'll check logs

    console.log(`Analyzing Market: ${marketId}`);
    console.log(`User: ${userAddress}`);

    const [signer] = await ethers.getSigners();
    const marketCore = new ethers.Contract(deployment.marketCore, ABIS.MarketCore, signer);
    const simpleRouter = new ethers.Contract(deployment.simpleRouter, ABIS.SimpleRouter, signer);
    const fpmm = new ethers.Contract(deployment.fpmmAMM, [
        "function lpShares(bytes32, address) view returns (uint256)",
        "event LiquidityProvided(bytes32 indexed marketId, address indexed provider, uint256 collateralAmount, uint256 lpShares)",
        "event LiquidityWithdrawn(bytes32 indexed marketId, address indexed provider, uint256 lpShares, uint256 collateralOut)",
        "event OutcomeBought(bytes32 indexed marketId, address indexed buyer, uint8 outcomeIndex, uint256 collateralIn, uint256 outcomeTokensOut)"
    ], signer);

    // 1. Check Market State
    const state = await marketCore.getMarketState(marketId);
    console.log("\n--- Market State ---");
    console.log("Status:", ["Open", "Resolvable", "Resolved"][Number(state[0])]);
    console.log("Winning Outcome:", state[1]);

    // 2. Check User Balances
    const lpShares = await simpleRouter.getUserLpShares(marketId, userAddress);
    const balances = await simpleRouter.getUserAllOutcomeBalances(marketId, userAddress);

    console.log("\n--- User Balances ---");
    console.log("LP Shares:", ethers.formatUnits(lpShares, 18));
    console.log("Outcome 0 (NO):", ethers.formatUnits(balances[0], 18));
    console.log("Outcome 1 (YES):", ethers.formatUnits(balances[1], 18));

    // 3. Check Event History (Liquidity on SimpleRouter)
    console.log("\n--- Liquidity History (SimpleRouter) ---");
    const addFilter = simpleRouter.filters.LiquidityProvided(marketId, userAddress);
    const removeFilter = simpleRouter.filters.LiquidityWithdrawn(marketId, userAddress);

    const adds = await simpleRouter.queryFilter(addFilter);
    const removes = await simpleRouter.queryFilter(removeFilter);

    adds.forEach(log => {
        console.log(`[ADD LP] Block ${log.blockNumber}: +${ethers.formatUnits(log.args[3], 18)} Shares`);
    });

    if (adds.length === 0) console.log("No LiquidityProvided events found for this user.");

    removes.forEach(log => {
        console.log(`[REMOVE LP] Block ${log.blockNumber}: -${ethers.formatUnits(log.args[2], 18)} Shares`);
    });

    if (removes.length === 0) console.log("No LiquidityWithdrawn events found for this user.");

    // 4. Check Buy History (User)
    const buyFilter = fpmm.filters.OutcomeBought(marketId, userAddress);
    const buys = await fpmm.queryFilter(buyFilter);
    if (buys.length > 0) {
        console.log("\n--- Buy History ---");
        buys.forEach(log => {
            console.log(`[BUY] Block ${log.blockNumber}: Outcome ${log.args[2]} -> ${ethers.formatUnits(log.args[4], 18)} Tokens`);
        });
    } else {
        console.log("\nNo 'OutcomeBought' events found for this user.");
    }

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
