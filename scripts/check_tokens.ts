
import { ethers } from "hardhat";

async function main() {
    const WETH = '0x4200000000000000000000000000000000000006';
    const USDC = '0xad11a8BEb98bbf61dbb1aa0F6d6F2ECD87b35afA';

    const abi = [
        "function symbol() external view returns (string)",
        "function decimals() external view returns (uint8)"
    ];

    const weth = await ethers.getContractAt(abi, WETH);
    const usdc = await ethers.getContractAt(abi, USDC);

    console.log("Checking Tokens...");
    console.log(`WETH (${WETH}) -> ${await weth.symbol()} [${await weth.decimals()}]`);
    console.log(`USDC (${USDC}) -> ${await usdc.symbol()} [${await usdc.decimals()}]`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
