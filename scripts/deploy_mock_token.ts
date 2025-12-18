import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    console.log("Deploying Mock USDC...");

    const MockERC20 = await ethers.getContractFactory("contracts/mocks/MockERC20.sol:MockERC20");
    const mockToken = await MockERC20.deploy("Mock USDC", "mUSDC", 18);
    await mockToken.waitForDeployment();

    const address = await mockToken.getAddress();
    console.log(`Mock USDC deployed to: ${address}`);

    // Update deployment.json
    const deploymentPath = path.join(__dirname, "../frontend/contracts/deployment.json");
    let deployment: any = {};

    if (fs.existsSync(deploymentPath)) {
        deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    }

    deployment.mockToken = address;
    // Also set it as the collateral token we'll use by default if we want
    // deployment.collateralToken = address; 

    fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
    console.log("Updated frontend/contracts/deployment.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
