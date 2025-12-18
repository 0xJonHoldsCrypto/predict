import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: false,
      evmVersion: "paris",
    },
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },

  networks: {
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: false,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    hemi: {
      url: process.env.HEMI_RPC_URL || "https://rpc.hemi.network/rpc",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    hemi_testnet: {
      url: "https://testnet.rpc.hemi.network/rpc",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    gasPrice: 20,
  },

  etherscan: {
    apiKey: {
      hemi: "abc",
      hemi_testnet: "abc",
    },
    customChains: [
      {
        network: "hemi",
        chainId: 43111,
        urls: {
          apiURL: "https://explorer.hemi.xyz/api",
          browserURL: "https://explorer.hemi.xyz",
        },
      },
      {
        network: "hemi_testnet",
        chainId: 743111,
        urls: {
          apiURL: "https://testnet.explorer.hemi.xyz/api",
          browserURL: "https://testnet.explorer.hemi.xyz",
        },
      },
    ],
  },

  mocha: {
    timeout: 60000,
  },
};

export default config;
