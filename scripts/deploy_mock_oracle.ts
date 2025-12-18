import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    console.log("Deploying Mock Oracle...");

    const MockOracle = await ethers.getContractFactory("contracts/mocks/MockOracle.sol:MockOracle");
    const oracle = await MockOracle.deploy();
    await oracle.waitForDeployment();

    const address = await oracle.getAddress();
    console.log(`Mock Oracle deployed to: ${address}`);

    // Update deployment.json
    const deploymentPath = path.join(__dirname, "../frontend/contracts/deployment.json");
    let deployment: any = {};

    if (fs.existsSync(deploymentPath)) {
        deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    }

    deployment.mockOracle = address;

    fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
    console.log("Updated deployment.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
