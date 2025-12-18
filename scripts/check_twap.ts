
import { ethers } from "hardhat";

async function main() {
    const ORACLE_ADDRESS = '0x777bF4362df3D40182d7Fe0a5E3359e11b18caF5';
    console.log(`Checking TWAP on Oracle at ${ORACLE_ADDRESS}...`);

    const abi = [
        "function getHemiEthUsdPrice(uint32 twapWindow) external view returns (uint256)",
        "function getCurrentTwapPrice(address pool, address baseToken, address quoteToken, uint32 twapWindow) external view returns (uint256)"
    ];

    const oracle = await ethers.getContractAt(abi, ORACLE_ADDRESS);

    try {
        const twapWindow = 1800; // 30 minutes
        console.log(`Querying getHemiEthUsdPrice(${twapWindow})...`);

        // Attempt standard call
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
