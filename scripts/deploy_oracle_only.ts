
import { ethers, network } from "hardhat";

async function main() {
    console.log("Deploying fixed UniV3EthUsdTwapOracleAdapter...");
    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);

    const OracleAdapter = await ethers.getContractFactory("UniV3EthUsdTwapOracleAdapter");
    const oracleAdapter = await OracleAdapter.deploy();
    await oracleAdapter.waitForDeployment();
    const address = await oracleAdapter.getAddress();

    console.log(`✅ Fixed Oracle Deployed at: ${address}`);
    console.log("Please update frontend/contracts/deployment.json with this new address.");
    return address;
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
