
import { ethers } from "hardhat";

async function main() {
    const ORACLE_ADDRESS = '0x0DA21b63218f762db9Ca20521567522FA4df7734';
    console.log(`Checking TWAP on Fixed Oracle at ${ORACLE_ADDRESS}...`);

    const abi = [
        "function getHemiEthUsdPrice(uint32 twapWindow) external view returns (uint256)"
    ];

    const oracle = await ethers.getContractAt(abi, ORACLE_ADDRESS);

    try {
        const twapWindow = 1800;
        const price = await oracle.getHemiEthUsdPrice(twapWindow);
        console.log(`✅ Price returned: ${price.toString()}`);
        console.log(`Formatted: $${Number(price) / 1e6}`);

    } catch (error) {
        console.error("❌ Failed to get TWAP price.");
        console.error(error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
