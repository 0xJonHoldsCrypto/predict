
import { ethers } from "hardhat";

async function main() {
    const POOL_ADDRESS = '0x9580D4519C9F27642e21085E763E761a74eF3735';
    console.log(`Verifying Pool at ${POOL_ADDRESS} on Hemi Mainnet...`);

    const abi = [
        "function token0() external view returns (address)",
        "function token1() external view returns (address)",
        "function fee() external view returns (uint24)",
        "function liquidity() external view returns (uint128)",
        "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
        "function observe(uint32[] calldata secondsAgos) external view returns (int56[] memory tickCumulatives, uint160[] memory secondsPerLiquidityCumulativeX128s)"
    ];

    const pool = await ethers.getContractAt(abi, POOL_ADDRESS);

    try {
        const token0 = await pool.token0();
        const token1 = await pool.token1();
        const liquidity = await pool.liquidity();
        const slot0 = await pool.slot0();

        console.log("✅ Contract call succeeded!");
        console.log(`- Token0: ${token0}`);
        console.log(`- Token1: ${token1}`);
        console.log(`- Liquidity: ${liquidity.toString()}`);
        console.log(`- SqrtPriceX96: ${slot0.sqrtPriceX96.toString()}`);
        console.log(`- Tick: ${slot0.tick}`);

    } catch (error) {
        console.error("❌ Verification Failed. Address might not be a pool or is empty.");
        console.error(error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
