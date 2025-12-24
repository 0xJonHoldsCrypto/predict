
import { ethers } from "hardhat";

async function main() {
    const MARKET_ID = "0x20d0412558ad9d630c8f7153bd784fcd557ca596bf2c6588a94da67c6f8684d4";
    const MARKET_CORE = "0xfE854d934bc338a71d3EB2FDC07627DeB29eFcA6"; // From deployment.json

    console.log(`Debugging Market ${MARKET_ID} on Contract ${MARKET_CORE}...`);

    const abi = [
        "function getMarketParams(bytes32 marketId) external view returns (address collateralToken, uint64 marketDeadline, uint8 configFlags, uint8 numOutcomes, address oracle, bytes32 questionId)"
    ];

    const marketCore = await ethers.getContractAt(abi, MARKET_CORE);

    try {
        const params = await marketCore.getMarketParams(MARKET_ID);
        console.log("Raw Params:", params);

        console.log("Accessing properties:");
        console.log("params.marketDeadline:", params.marketDeadline);
        console.log("params[1]:", params[1]);
        console.log("params.length:", params.length);

        if (params.marketDeadline) {
            const d = new Date(Number(params.marketDeadline) * 1000);
            console.log("Date:", d.toLocaleString());
        }

    } catch (error) {
        console.error("❌ Failed to get market params.");
        console.error(error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
