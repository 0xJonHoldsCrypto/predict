
import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer Address:", deployer.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
