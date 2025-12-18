export const ABIS = {
  "SimpleRouter": [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_marketCore",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_fpmmAMM",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_outcomeToken1155",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "InvalidOutcomeIndex",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "MarketNotResolved",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ReentrancyGuardReentrantCall",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        }
      ],
      "name": "SafeERC20FailedOperation",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ZeroAddress",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ZeroAmount",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "provider",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "collateralAmount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "lpShares",
          "type": "uint256"
        }
      ],
      "name": "LiquidityProvided",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "provider",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "lpShares",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "collateralOut",
          "type": "uint256"
        }
      ],
      "name": "LiquidityWithdrawn",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "outcomeIndex",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "collateralIn",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "tokensOut",
          "type": "uint256"
        }
      ],
      "name": "OutcomeBought",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "outcomeIndex",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "tokensIn",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "collateralOut",
          "type": "uint256"
        }
      ],
      "name": "OutcomeSold",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "outcomeIndex",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "collateralReceived",
          "type": "uint256"
        }
      ],
      "name": "WinningsRedeemed",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "collateralAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minLpShares",
          "type": "uint256"
        }
      ],
      "name": "addLiquidity",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "lpShares",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "internalType": "uint8",
          "name": "outcomeIndex",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "collateralIn",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minTokensOut",
          "type": "uint256"
        }
      ],
      "name": "buyOutcome",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "tokensOut",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "internalType": "uint8",
          "name": "outcomeIndex",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "collateralIn",
          "type": "uint256"
        }
      ],
      "name": "estimateBuy",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "tokensOut",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "internalType": "uint8",
          "name": "outcomeIndex",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "tokensIn",
          "type": "uint256"
        }
      ],
      "name": "estimateSell",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "collateralOut",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "fpmmAMM",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        }
      ],
      "name": "getCollateralToken",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        }
      ],
      "name": "getMarketConfig",
      "outputs": [
        {
          "internalType": "address",
          "name": "collateralToken",
          "type": "address"
        },
        {
          "internalType": "uint8",
          "name": "numOutcomes",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "liquidityParameterB",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        }
      ],
      "name": "getMarketStatus",
      "outputs": [
        {
          "internalType": "enum IMarketCore.MarketStatus",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "winningOutcome",
          "type": "uint8"
        },
        {
          "internalType": "bool",
          "name": "isInvalid",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        }
      ],
      "name": "getOutcomePrices",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "prices",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getUserAllOutcomeBalances",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "balances",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getUserLpShares",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "lpBalance",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "internalType": "uint8",
          "name": "outcomeIndex",
          "type": "uint8"
        },
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getUserOutcomeBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "balance",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "marketCore",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        },
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "name": "onERC1155BatchReceived",
      "outputs": [
        {
          "internalType": "bytes4",
          "name": "",
          "type": "bytes4"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "name": "onERC1155Received",
      "outputs": [
        {
          "internalType": "bytes4",
          "name": "",
          "type": "bytes4"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "outcomeToken1155",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "redeem",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "collateralOut",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "internalType": "uint8",
          "name": "outcomeIndex",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "redeemOutcome",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "collateralOut",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "lpSharesIn",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minCollateralOut",
          "type": "uint256"
        }
      ],
      "name": "removeLiquidity",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "collateralOut",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "internalType": "uint8",
          "name": "outcomeIndex",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "tokensIn",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minCollateralOut",
          "type": "uint256"
        }
      ],
      "name": "sellOutcome",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "collateralOut",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  "MarketCore": [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_outcomeToken1155",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "DeadlineNotPassed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "EarlyResolutionNotAllowed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidCollateralToken",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidMarketInvalid",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidNumOutcomes",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidOracle",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidOutcomeIndex",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "MarketAlreadyExists",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "MarketAlreadyResolved",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "MarketNotFound",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "MarketNotOpen",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "MarketNotResolvable",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "MarketNotResolved",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotWinningOutcome",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "OracleNotResolved",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ReentrancyGuardReentrantCall",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        }
      ],
      "name": "SafeERC20FailedOperation",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ZeroAmount",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "depositor",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "CollateralDeposited",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "collateralToken",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "oracle",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "questionId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "marketDeadline",
          "type": "uint64"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "numOutcomes",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "metadataURI",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "creator",
          "type": "address"
        }
      ],
      "name": "MarketCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "winningOutcomeIndex",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "isInvalid",
          "type": "bool"
        }
      ],
      "name": "MarketFinalized",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "requester",
          "type": "address"
        }
      ],
      "name": "ResolutionRequested",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "redeemer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "outcomeIndex",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "collateralPaid",
          "type": "uint256"
        }
      ],
      "name": "WinningsRedeemed",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "FLAG_EARLY_RESOLUTION",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "FLAG_INVALID_REFUND",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "MAX_OUTCOMES",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "MIN_OUTCOMES",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "internalType": "uint8",
          "name": "outcomeIndex",
          "type": "uint8"
        }
      ],
      "name": "computeOutcomeTokenId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "collateralToken",
              "type": "address"
            },
            {
              "internalType": "uint64",
              "name": "marketDeadline",
              "type": "uint64"
            },
            {
              "internalType": "uint8",
              "name": "configFlags",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "numOutcomes",
              "type": "uint8"
            },
            {
              "internalType": "address",
              "name": "oracle",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "questionId",
              "type": "bytes32"
            }
          ],
          "internalType": "struct MarketCore.MarketParams",
          "name": "params",
          "type": "tuple"
        },
        {
          "internalType": "string",
          "name": "metadataURI",
          "type": "string"
        }
      ],
      "name": "createMarket",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "depositCollateral",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        }
      ],
      "name": "finalizeMarket",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        }
      ],
      "name": "getMarketMetadataURI",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        }
      ],
      "name": "getMarketParams",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "collateralToken",
              "type": "address"
            },
            {
              "internalType": "uint64",
              "name": "marketDeadline",
              "type": "uint64"
            },
            {
              "internalType": "uint8",
              "name": "configFlags",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "numOutcomes",
              "type": "uint8"
            },
            {
              "internalType": "address",
              "name": "oracle",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "questionId",
              "type": "bytes32"
            }
          ],
          "internalType": "struct MarketCore.MarketParams",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        }
      ],
      "name": "getMarketState",
      "outputs": [
        {
          "internalType": "enum MarketCore.MarketStatus",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "winningOutcomeIndex",
          "type": "uint8"
        },
        {
          "internalType": "bool",
          "name": "isInvalid",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        }
      ],
      "name": "isMarketOpen",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "marketCollateralBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "marketExists",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "outcomeToken1155",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "internalType": "uint8",
          "name": "outcomeIndex",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "redeemWinnings",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        }
      ],
      "name": "requestResolution",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  "FpmmAMM": [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_marketCore",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_outcomeToken1155",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "ArrayLengthMismatch",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InsufficientCollateral",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InsufficientLpShares",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InsufficientOutcomeTokens",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidLiquidityParameter",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidMarketId",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidNumOutcomes",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidOutcomeIndex",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "MarketAlreadyRegistered",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "MarketCoreMismatch",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "MarketNotOpen",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "MarketNotRegistered",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NoLiquidity",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ReentrancyGuardReentrantCall",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        }
      ],
      "name": "SafeERC20FailedOperation",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "SlippageExceeded",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ZeroAmount",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "collateralToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "numOutcomes",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "liquidityParameterB",
          "type": "uint256"
        }
      ],
      "name": "FpmmMarketRegistered",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "provider",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "collateralAmount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "lpSharesMinted",
          "type": "uint256"
        }
      ],
      "name": "LiquidityAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "provider",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "lpSharesBurned",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "collateralOut",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256[]",
          "name": "outcomeTokensOut",
          "type": "uint256[]"
        }
      ],
      "name": "LiquidityRemoved",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "outcomeIndex",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "collateralIn",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "outcomeTokensOut",
          "type": "uint256"
        }
      ],
      "name": "OutcomeBought",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "outcomeIndex",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "outcomeTokensIn",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "collateralOut",
          "type": "uint256"
        }
      ],
      "name": "OutcomeSold",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "collateralAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minLpSharesOut",
          "type": "uint256"
        }
      ],
      "name": "addLiquidity",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "lpSharesOut",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "internalType": "uint8",
          "name": "outcomeIndex",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "collateralIn",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minOutcomeOut",
          "type": "uint256"
        }
      ],
      "name": "buyOutcome",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "outcomeOut",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "internalType": "uint8",
          "name": "outcomeIndex",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "collateralIn",
          "type": "uint256"
        }
      ],
      "name": "calcBuyAmount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "internalType": "uint8",
          "name": "outcomeIndex",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "outcomeIn",
          "type": "uint256"
        }
      ],
      "name": "calcSellReturn",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        }
      ],
      "name": "getFpmmMarketConfig",
      "outputs": [
        {
          "internalType": "address",
          "name": "collateralToken",
          "type": "address"
        },
        {
          "internalType": "uint8",
          "name": "numOutcomes",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "liquidityParameterB",
          "type": "uint256"
        },
        {
          "internalType": "uint256[]",
          "name": "outcomeTokenIds",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        }
      ],
      "name": "getFpmmMarketState",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "collateralBalance",
          "type": "uint256"
        },
        {
          "internalType": "int256[]",
          "name": "netTokensSold",
          "type": "int256[]"
        },
        {
          "internalType": "uint256",
          "name": "lpShareSupply",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        }
      ],
      "name": "getOutcomePrices",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "prices",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "isRegistered",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "lpShares",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "marketCore",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        },
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "name": "netOutcomeTokensSold",
      "outputs": [
        {
          "internalType": "int256",
          "name": "",
          "type": "int256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        },
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "name": "onERC1155BatchReceived",
      "outputs": [
        {
          "internalType": "bytes4",
          "name": "",
          "type": "bytes4"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "name": "onERC1155Received",
      "outputs": [
        {
          "internalType": "bytes4",
          "name": "",
          "type": "bytes4"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "outcomeToken1155",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "liquidityParameterB",
          "type": "uint256"
        }
      ],
      "name": "registerFpmmMarket",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "lpSharesIn",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minCollateralOut",
          "type": "uint256"
        },
        {
          "internalType": "uint256[]",
          "name": "minOutcomeAmounts",
          "type": "uint256[]"
        }
      ],
      "name": "removeLiquidity",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "collateralOut",
          "type": "uint256"
        },
        {
          "internalType": "uint256[]",
          "name": "outcomeTokensOut",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "internalType": "uint8",
          "name": "outcomeIndex",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "outcomeIn",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minCollateralOut",
          "type": "uint256"
        }
      ],
      "name": "sellOutcome",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "collateralOut",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    }
  ],
  "OutcomeToken1155": [
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "minters",
          "type": "address[]"
        },
        {
          "internalType": "string",
          "name": "uri_",
          "type": "string"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "ArrayLengthMismatch",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ERC1155ReceiverRejected",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InsufficientBalance",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotAuthorizedMinter",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotERC1155Receiver",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotOwnerOrApproved",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "SelfApproval",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TransferToZeroAddress",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "ApprovalForAll",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256[]",
          "name": "ids",
          "type": "uint256[]"
        },
        {
          "indexed": false,
          "internalType": "uint256[]",
          "name": "values",
          "type": "uint256[]"
        }
      ],
      "name": "TransferBatch",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "TransferSingle",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "value",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "URI",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "accounts",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "ids",
          "type": "uint256[]"
        }
      ],
      "name": "balanceOfBatch",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "burn",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "uint256[]",
          "name": "ids",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "amounts",
          "type": "uint256[]"
        }
      ],
      "name": "burnBatch",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "internalType": "uint8",
          "name": "outcomeIndex",
          "type": "uint8"
        }
      ],
      "name": "computeOutcomeTokenId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        }
      ],
      "name": "isApprovedForAll",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "isMinter",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256[]",
          "name": "ids",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "amounts",
          "type": "uint256[]"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "mintBatch",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256[]",
          "name": "ids",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "amounts",
          "type": "uint256[]"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "safeBatchTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "setApprovalForAll",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "uri",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ],
  "PredictionMarketDeployer": [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_marketCore",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_fpmmAMM",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_outcomeToken1155",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "FpmmRegistrationFailed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "MarketCreationFailed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ZeroAddress",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "questionId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "oracle",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "collateralToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "numOutcomes",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "liquidityParameterB",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "metadataURI",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "deployer",
          "type": "address"
        }
      ],
      "name": "PredictionMarketDeployed",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "HEMI_ETH_USDC_POOL",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "HEMI_USDC",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "HEMI_WETH",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "internalType": "uint8",
          "name": "numOutcomes",
          "type": "uint8"
        }
      ],
      "name": "computeOutcomeTokenIds",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "tokenIds",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "oracleAdapter",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "pool",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "baseToken",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "quoteToken",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "collateralToken",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "threshold",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "liquidityParameterB",
              "type": "uint256"
            },
            {
              "internalType": "uint64",
              "name": "evalTime",
              "type": "uint64"
            },
            {
              "internalType": "uint64",
              "name": "marketDeadline",
              "type": "uint64"
            },
            {
              "internalType": "uint32",
              "name": "twapWindow",
              "type": "uint32"
            },
            {
              "internalType": "uint8",
              "name": "configFlags",
              "type": "uint8"
            },
            {
              "internalType": "bool",
              "name": "greaterThan",
              "type": "bool"
            }
          ],
          "internalType": "struct PredictionMarketDeployer.ThresholdMarketParams",
          "name": "p",
          "type": "tuple"
        },
        {
          "internalType": "string",
          "name": "metadataURI",
          "type": "string"
        }
      ],
      "name": "deployEthUsdThresholdMarket",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "questionId",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "oracleAdapter",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "threshold",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "liquidityParameterB",
              "type": "uint256"
            },
            {
              "internalType": "uint64",
              "name": "evalTime",
              "type": "uint64"
            },
            {
              "internalType": "uint64",
              "name": "marketDeadline",
              "type": "uint64"
            },
            {
              "internalType": "uint32",
              "name": "twapWindow",
              "type": "uint32"
            },
            {
              "internalType": "uint8",
              "name": "configFlags",
              "type": "uint8"
            },
            {
              "internalType": "bool",
              "name": "greaterThan",
              "type": "bool"
            }
          ],
          "internalType": "struct PredictionMarketDeployer.HemiMarketParams",
          "name": "p",
          "type": "tuple"
        },
        {
          "internalType": "string",
          "name": "metadataURI",
          "type": "string"
        }
      ],
      "name": "deployHemiEthUsdMarket",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "questionId",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "oracle",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "questionId",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "collateralToken",
          "type": "address"
        },
        {
          "internalType": "uint64",
          "name": "marketDeadline",
          "type": "uint64"
        },
        {
          "internalType": "uint8",
          "name": "numOutcomes",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "liquidityParameterB",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "configFlags",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "metadataURI",
          "type": "string"
        }
      ],
      "name": "deployMarketWithExistingQuestion",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "fpmmAMM",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "marketId",
          "type": "bytes32"
        }
      ],
      "name": "getBinaryTokenIds",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "yesTokenId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "noTokenId",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "marketCore",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "outcomeToken1155",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "threshold",
          "type": "uint256"
        },
        {
          "internalType": "uint32",
          "name": "twapWindow",
          "type": "uint32"
        },
        {
          "internalType": "uint64",
          "name": "evalTime",
          "type": "uint64"
        },
        {
          "internalType": "bool",
          "name": "greaterThan",
          "type": "bool"
        }
      ],
      "name": "previewHemiQuestionId",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "collateralToken",
              "type": "address"
            },
            {
              "internalType": "uint64",
              "name": "marketDeadline",
              "type": "uint64"
            },
            {
              "internalType": "uint8",
              "name": "configFlags",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "numOutcomes",
              "type": "uint8"
            },
            {
              "internalType": "address",
              "name": "oracle",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "questionId",
              "type": "bytes32"
            }
          ],
          "internalType": "struct IMarketCore.MarketParams",
          "name": "params",
          "type": "tuple"
        }
      ],
      "name": "previewMarketId",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "baseToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "quoteToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "threshold",
          "type": "uint256"
        },
        {
          "internalType": "uint32",
          "name": "twapWindow",
          "type": "uint32"
        },
        {
          "internalType": "uint64",
          "name": "evalTime",
          "type": "uint64"
        },
        {
          "internalType": "bool",
          "name": "greaterThan",
          "type": "bool"
        }
      ],
      "name": "previewQuestionId",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    }
  ],
  "UniV3EthUsdTwapOracleAdapter": [
    {
      "inputs": [
        {
          "internalType": "uint32",
          "name": "twapWindow",
          "type": "uint32"
        }
      ],
      "name": "getHemiEthUsdPrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "InvalidEvalTime",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidPool",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidTwapWindow",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PoolObserveFailed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "QuestionAlreadyExists",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "QuestionAlreadyResolved",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "QuestionNotFound",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ResolutionTooEarly",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TickOutOfRange",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "questionId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "baseToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "quoteToken",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "threshold",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint32",
          "name": "twapWindow",
          "type": "uint32"
        },
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "evalTime",
          "type": "uint64"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "greaterThan",
          "type": "bool"
        }
      ],
      "name": "ThresholdQuestionRegistered",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "questionId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "winningOutcomeIndex",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "resolutionTime",
          "type": "uint64"
        }
      ],
      "name": "ThresholdQuestionResolved",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "HEMI_ETH_USDC_POOL",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "HEMI_USDC",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "HEMI_WETH",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "questionId",
          "type": "bytes32"
        }
      ],
      "name": "canResolve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "threshold",
          "type": "uint256"
        },
        {
          "internalType": "uint32",
          "name": "twapWindow",
          "type": "uint32"
        },
        {
          "internalType": "uint64",
          "name": "evalTime",
          "type": "uint64"
        },
        {
          "internalType": "bool",
          "name": "greaterThan",
          "type": "bool"
        }
      ],
      "name": "computeHemiQuestionId",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "baseToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "quoteToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "threshold",
          "type": "uint256"
        },
        {
          "internalType": "uint32",
          "name": "twapWindow",
          "type": "uint32"
        },
        {
          "internalType": "uint64",
          "name": "evalTime",
          "type": "uint64"
        },
        {
          "internalType": "bool",
          "name": "greaterThan",
          "type": "bool"
        }
      ],
      "name": "computeQuestionId",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "baseToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "quoteToken",
          "type": "address"
        },
        {
          "internalType": "uint32",
          "name": "twapWindow",
          "type": "uint32"
        }
      ],
      "name": "getCurrentTwapPrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint32",
          "name": "twapWindow",
          "type": "uint32"
        }
      ],
      "name": "getHemiEthUsdPrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "questionId",
          "type": "bytes32"
        }
      ],
      "name": "getOutcome",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "winningOutcomeIndex",
          "type": "uint8"
        },
        {
          "internalType": "bool",
          "name": "isInvalid",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "resolved",
          "type": "bool"
        },
        {
          "internalType": "uint64",
          "name": "resolutionTime",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "questionId",
          "type": "bytes32"
        }
      ],
      "name": "getQuestionConfig",
      "outputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "baseToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "quoteToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "threshold",
          "type": "uint256"
        },
        {
          "internalType": "uint32",
          "name": "twapWindow",
          "type": "uint32"
        },
        {
          "internalType": "uint64",
          "name": "evalTime",
          "type": "uint64"
        },
        {
          "internalType": "bool",
          "name": "greaterThan",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "questions",
      "outputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "uint32",
          "name": "twapWindow",
          "type": "uint32"
        },
        {
          "internalType": "uint64",
          "name": "evalTime",
          "type": "uint64"
        },
        {
          "internalType": "address",
          "name": "baseToken",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "greaterThan",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "exists",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "resolved",
          "type": "bool"
        },
        {
          "internalType": "uint8",
          "name": "winningOutcomeIndex",
          "type": "uint8"
        },
        {
          "internalType": "address",
          "name": "quoteToken",
          "type": "address"
        },
        {
          "internalType": "uint64",
          "name": "resolutionTime",
          "type": "uint64"
        },
        {
          "internalType": "uint256",
          "name": "threshold",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "threshold",
          "type": "uint256"
        },
        {
          "internalType": "uint32",
          "name": "twapWindow",
          "type": "uint32"
        },
        {
          "internalType": "uint64",
          "name": "evalTime",
          "type": "uint64"
        },
        {
          "internalType": "bool",
          "name": "greaterThan",
          "type": "bool"
        }
      ],
      "name": "registerHemiEthUsdQuestion",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "questionId",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "pool",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "baseToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "quoteToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "threshold",
          "type": "uint256"
        },
        {
          "internalType": "uint32",
          "name": "twapWindow",
          "type": "uint32"
        },
        {
          "internalType": "uint64",
          "name": "evalTime",
          "type": "uint64"
        },
        {
          "internalType": "bool",
          "name": "greaterThan",
          "type": "bool"
        }
      ],
      "name": "registerThresholdQuestion",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "questionId",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "questionId",
          "type": "bytes32"
        }
      ],
      "name": "requestResolution",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "questionId",
          "type": "bytes32"
        }
      ],
      "name": "timeUntilResolution",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "secondsRemaining",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ],
  "MockERC20": [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name_",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "symbol_",
          "type": "string"
        },
        {
          "internalType": "uint8",
          "name": "decimals_",
          "type": "uint8"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "allowance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "needed",
          "type": "uint256"
        }
      ],
      "name": "ERC20InsufficientAllowance",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "balance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "needed",
          "type": "uint256"
        }
      ],
      "name": "ERC20InsufficientBalance",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "approver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidApprover",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidReceiver",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSender",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSpender",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "burn",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  "MockOracle": [
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "questionId",
          "type": "bytes32"
        }
      ],
      "name": "getOutcome",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "winningOutcomeIndex",
          "type": "uint8"
        },
        {
          "internalType": "bool",
          "name": "isInvalid",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "resolved",
          "type": "bool"
        },
        {
          "internalType": "uint64",
          "name": "resolutionTime",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "questions",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "winningOutcomeIndex",
          "type": "uint8"
        },
        {
          "internalType": "bool",
          "name": "isInvalid",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "resolved",
          "type": "bool"
        },
        {
          "internalType": "uint64",
          "name": "resolutionTime",
          "type": "uint64"
        },
        {
          "internalType": "bool",
          "name": "exists",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "questionId",
          "type": "bytes32"
        }
      ],
      "name": "registerQuestion",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "questionId",
          "type": "bytes32"
        }
      ],
      "name": "requestResolution",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "questionId",
          "type": "bytes32"
        },
        {
          "internalType": "uint8",
          "name": "winningOutcomeIndex",
          "type": "uint8"
        },
        {
          "internalType": "bool",
          "name": "isInvalid",
          "type": "bool"
        }
      ],
      "name": "setOutcome",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  "IERC20": [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
};
