# Hemi Prediction Markets

A fully decentralized, permissionless, and ungoverned prediction market protocol built for the Hemi blockchain. This system enables anyone to create, trade, and resolve prediction markets without intermediaries, admin keys, or governance mechanisms.

## Table of Contents

- [Overview](#overview)
- [Design Goals](#design-goals)
- [Theory of Operation](#theory-of-operation)
  - [Logarithmic Market Scoring Rule (LMSR)](#logarithmic-market-scoring-rule-lmsr)
  - [Outcome Tokens](#outcome-tokens)
  - [Oracle System](#oracle-system)
  - [Market Lifecycle](#market-lifecycle)
- [Architecture](#architecture)
- [Contract Descriptions](#contract-descriptions)
- [Actor Guide](#actor-guide)
  - [Market Creators](#market-creators)
  - [Traders](#traders)
  - [Liquidity Providers](#liquidity-providers)
  - [Resolvers](#resolvers)
  - [Third-Party Observers](#third-party-observers)
- [Deployment](#deployment)
- [Security Model](#security-model)
- [Gas Optimizations](#gas-optimizations)
- [Hemi Chain Addresses](#hemi-chain-addresses)
- [License](#license)

---

## Overview

Hemi Prediction Markets is a DeFi protocol that allows users to speculate on the outcomes of future events. The system uses an Automated Market Maker (AMM) based on Hanson's Logarithmic Market Scoring Rule (LMSR) to provide continuous liquidity and fair pricing for prediction market outcomes.

**Key Features:**
- 🔓 **Fully Permissionless** - Anyone can create markets, trade, provide liquidity, or trigger resolution
- 🏛️ **Ungoverned** - No admin keys, pause functions, or upgrade mechanisms
- 🔒 **Non-Custodial** - Users maintain control of their assets at all times
- ⛓️ **Immutable** - All parameters are fixed at deployment/creation time
- 📊 **Multi-Outcome Support** - Binary (YES/NO) up to 8-outcome markets
- 🔮 **Pluggable Oracles** - Extensible oracle system starting with Uniswap V3 TWAP

---

## Design Goals

### 1. Minimal Trust Assumptions
The protocol is designed to minimize trust requirements. There are no privileged roles, no governance tokens, and no ability to modify parameters after deployment. Users trust only the smart contract code itself.

### 2. Simplicity
The system uses a minimal number of contracts with clear separation of concerns:
- Token management (OutcomeToken1155)
- Market registry and resolution (MarketCore)
- Trading and liquidity (FpmmAMM)
- Price oracle (UniV3EthUsdTwapOracleAdapter)

### 3. Capital Efficiency
LMSR provides bounded loss for liquidity providers while maintaining continuous liquidity. The liquidity parameter `b` allows market creators to tune the trade-off between liquidity depth and price sensitivity.

### 4. Gas Efficiency
All operations are O(1) or O(n) where n is the number of outcomes (max 8). Structs are packed for storage efficiency, and common patterns use unchecked arithmetic where safe.

### 5. Composability
The modular design allows third parties to:
- Build custom UIs and aggregators
- Create new oracle adapters for different data sources
- Develop automated trading strategies
- Integrate with other DeFi protocols

---

## Theory of Operation

### Logarithmic Market Scoring Rule (LMSR)

The protocol uses Hanson's LMSR, a market scoring rule that provides automated market making with bounded loss for liquidity providers.

#### Cost Function

The cost function determines the total cost to reach a given state:

```
C(q) = b × ln(Σ exp(qᵢ / b))
```

Where:
- `q` = vector of net outcome tokens sold for each outcome
- `b` = liquidity parameter (higher = more liquidity, less price impact)
- `qᵢ` = net tokens sold for outcome i

#### Pricing

The instantaneous price for outcome i is:

```
pᵢ = exp(qᵢ / b) / Σ exp(qⱼ / b)
```

Prices always sum to 1 (100%), representing the market's probability assessment.

#### Trading

**Buying outcome i:**
```
cost = C(q + Δ×eᵢ) - C(q)
```

**Selling outcome i:**
```
return = C(q) - C(q - Δ×eᵢ)
```

#### Liquidity Parameter (b)

The `b` parameter controls market behavior:
- **Higher b**: More liquidity, smaller price impact per trade, higher potential LP loss
- **Lower b**: Less liquidity, larger price impact, lower potential LP loss

Typical values range from `100e18` to `10000e18` depending on expected market volume.

### Outcome Tokens

Outcome tokens are ERC-1155 tokens representing shares in specific market outcomes. Each market-outcome pair has a unique token ID computed as:

```
tokenId = (uint256(marketId) << 8) | outcomeIndex
```

This allows a single ERC-1155 contract to manage tokens for all markets efficiently.

**Token Properties:**
- 1 outcome token + winning outcome = 1 collateral token (at redemption)
- Tokens are freely transferable
- No rebasing or complex token mechanics

### Oracle System

The protocol uses a pluggable oracle architecture. Oracles implement the `IOutcomeOracle` interface:

```solidity
interface IOutcomeOracle {
    enum Outcome { Undefined, Yes, No, Invalid }
    
    function requestResolution(bytes32 questionId) external;
    function getOutcome(bytes32 questionId) external view returns (
        Outcome outcome,
        bool resolved,
        uint64 resolutionTime
    );
}
```

#### UniV3EthUsdTwapOracleAdapter

The initial oracle implementation supports ETH/USD price threshold questions using Uniswap V3 TWAP (Time-Weighted Average Price).

**Question Types:**
- "Will ETH be above $X at time T?" (`greaterThan = true`)
- "Will ETH be below $X at time T?" (`greaterThan = false`)

**TWAP Benefits:**
- Manipulation resistant (attacker must sustain price manipulation for entire window)
- Gas efficient (single `observe()` call)
- Decentralized (no trusted price feed operator)

### Market Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                        MARKET LIFECYCLE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌────────────┐    ┌─────────┐ │
│  │  Create  │───▶│   Open   │───▶│ Resolvable │───▶│Resolved │ │
│  │  Market  │    │(Trading) │    │ (Deadline) │    │(Final)  │ │
│  └──────────┘    └──────────┘    └────────────┘    └─────────┘ │
│                       │                │                │       │
│                       ▼                ▼                ▼       │
│                  Buy/Sell         Request          Redeem       │
│                  Add/Remove       Resolution       Winnings     │
│                  Liquidity                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

1. **Creation**: Market creator registers oracle question, creates market in MarketCore, registers FPMM
2. **Open**: Trading and liquidity provision enabled until deadline
3. **Resolvable**: After deadline, anyone can request oracle resolution
4. **Resolved**: Oracle result finalized, winners can redeem 1:1 for collateral

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SYSTEM ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐  │
│  │  SimpleRouter   │────▶│    FpmmAMM      │────▶│  OutcomeToken    │  │
│  │  (UX Wrapper)   │     │  (AMM Trading)  │     │     1155         │  │
│  └────────┬────────┘     └────────┬────────┘     │  (All Tokens)    │  │
│           │                       │              └──────────────────┘  │
│           │                       │                       ▲            │
│           ▼                       ▼                       │            │
│  ┌─────────────────┐     ┌─────────────────┐              │            │
│  │   MarketCore    │◀────│   MarketCore    │──────────────┘            │
│  │  (Resolution)   │     │   (Registry)    │                           │
│  └────────┬────────┘     └─────────────────┘                           │
│           │                       ▲                                    │
│           ▼                       │                                    │
│  ┌─────────────────┐     ┌─────────────────┐                           │
│  │  Oracle Adapter │     │  Prediction     │                           │
│  │  (TWAP/Other)   │     │  MarketDeployer │                           │
│  └─────────────────┘     └─────────────────┘                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Contract Descriptions

### OutcomeToken1155.sol
**Purpose:** Single ERC-1155 contract managing all outcome tokens across all markets.

**Key Features:**
- Immutable minter list (set at deployment)
- Gas-efficient batch operations
- Token ID encoding: `(marketId << 8) | outcomeIndex`
- Custom implementation (avoids OpenZeppelin overhead)

**Functions:**
- `mint()` / `mintBatch()` - Minter-only token creation
- `burn()` / `burnBatch()` - Minter-only token destruction
- `safeTransferFrom()` / `safeBatchTransferFrom()` - Standard ERC-1155 transfers

### MarketCore.sol
**Purpose:** Market registry, collateral vault, and resolution coordinator.

**Key Features:**
- Deterministic market IDs: `keccak256(abi.encode(params))`
- Holds all collateral for all markets
- Coordinates with oracles for resolution
- 1:1 redemption for winning outcomes

**Functions:**
- `createMarket()` - Register new market with oracle reference
- `requestResolution()` - Trigger oracle resolution
- `finalizeMarket()` - Read oracle result and store winner
- `redeemWinnings()` - Burn winning tokens for collateral
- `depositCollateral()` - Called by AMM when backing tokens

### FpmmAMM.sol
**Purpose:** LMSR-based automated market maker for trading and liquidity.

**Key Features:**
- Implements Hanson's LMSR cost function
- Custom fixed-point math (exp/ln in pure Solidity)
- Per-market liquidity pools
- LP share tracking

**Functions:**
- `registerFpmmMarket()` - Initialize AMM for a market
- `buyOutcome()` / `sellOutcome()` - Trade outcome tokens
- `addLiquidity()` / `removeLiquidity()` - LP management
- `getOutcomePrices()` - Current probability prices
- `calcBuyAmount()` / `calcSellReturn()` - Quote functions

### UniV3EthUsdTwapOracleAdapter.sol
**Purpose:** Oracle adapter for ETH/USD price threshold questions.

**Key Features:**
- Uses Uniswap V3 TWAP for manipulation resistance
- Permissionless question registration
- Time-locked resolution
- Hemi chain address constants included

**Functions:**
- `registerThresholdQuestion()` - Create new price question
- `registerHemiEthUsdQuestion()` - Convenience function with defaults
- `requestResolution()` - Read TWAP and determine outcome
- `getOutcome()` - Query resolution status
- `getCurrentTwapPrice()` - Live TWAP price query

### PredictionMarketDeployer.sol
**Purpose:** Convenience contract for atomic market deployment.

**Key Features:**
- Single transaction for complete market setup
- Struct parameters to avoid stack-too-deep
- Preview functions for IDs
- Hemi-specific convenience functions

**Functions:**
- `deployEthUsdThresholdMarket()` - Full deployment with custom params
- `deployHemiEthUsdMarket()` - Simplified with Hemi defaults
- `deployMarketWithExistingQuestion()` - Use pre-registered oracle question
- `previewMarketId()` / `previewQuestionId()` - Predict IDs before creation

### SimpleRouter.sol
**Purpose:** User-friendly wrapper for common operations.

**Key Features:**
- Named functions for binary outcomes (buyYes, buyNo)
- Automatic winning outcome detection for redemption
- Transparent token approval handling
- Non-custodial (funds never held)

**Functions:**
- `buyYes()` / `buyNo()` - Purchase outcome tokens
- `sellYes()` / `sellNo()` - Sell outcome tokens
- `redeem()` - Auto-detect and redeem winning tokens
- `addLiquidity()` / `removeLiquidity()` - LP operations
- `getPrices()` / `estimateBuy*()` / `estimateSell*()` - Quotes

### IOutcomeOracle.sol (Interface)
**Purpose:** Standard interface for oracle adapters.

```solidity
interface IOutcomeOracle {
    enum Outcome { Undefined, Yes, No, Invalid }
    
    function requestResolution(bytes32 questionId) external;
    function getOutcome(bytes32 questionId) external view returns (
        Outcome outcome,
        bool resolved,
        uint64 resolutionTime
    );
}
```

---

## Actor Guide

### Market Creators

Market creators define prediction questions and initialize trading.

#### Creating an ETH/USD Price Market

```solidity
// Using PredictionMarketDeployer for atomic creation
PredictionMarketDeployer.HemiMarketParams memory params = PredictionMarketDeployer.HemiMarketParams({
    oracleAdapter: oracleAdapterAddress,
    threshold: 4000 * 1e6,           // $4000 in USDC decimals
    liquidityParameterB: 1000 * 1e18, // Liquidity depth
    evalTime: uint64(block.timestamp + 7 days),
    marketDeadline: uint64(block.timestamp + 7 days - 1 hours),
    twapWindow: 1800,                 // 30 minute TWAP
    configFlags: 0x02,                // FLAG_INVALID_REFUND
    greaterThan: true                 // YES if ETH >= $4000
});

(bytes32 marketId, bytes32 questionId) = deployer.deployHemiEthUsdMarket(
    params,
    "ipfs://Qm..."  // Metadata URI
);
```

#### Choosing Liquidity Parameter (b)

| b Value | Use Case |
|---------|----------|
| `100e18` | Low volume, high price sensitivity |
| `1000e18` | Medium volume, balanced |
| `10000e18` | High volume, stable prices |

#### Market Configuration Flags

| Flag | Value | Description |
|------|-------|-------------|
| `FLAG_EARLY_RESOLUTION` | `0x01` | Allow resolution before deadline |
| `FLAG_INVALID_REFUND` | `0x02` | Refund all outcomes if invalid |

### Traders

Traders speculate on outcomes by buying and selling outcome tokens.

#### Buying YES Tokens (via SimpleRouter)

```solidity
// Approve router to spend USDC
IERC20(usdc).approve(routerAddress, amount);

// Buy YES tokens
uint256 yesReceived = router.buyYes(
    marketId,
    100 * 1e6,    // 100 USDC
    95 * 1e18     // Min 95 YES tokens (slippage)
);
```

#### Selling NO Tokens

```solidity
// Approve router for outcome tokens
IOutcomeToken1155(outcomeToken).setApprovalForAll(routerAddress, true);

// Sell NO tokens
uint256 usdcReceived = router.sellNo(
    marketId,
    50 * 1e18,    // 50 NO tokens
    45 * 1e6      // Min 45 USDC (slippage)
);
```

#### Getting Price Quotes

```solidity
// Current prices
(uint256 yesPrice, uint256 noPrice) = router.getPrices(marketId);
// yesPrice = 0.6e18 means 60% probability

// Estimate trade outcome
uint256 yesOut = router.estimateBuyYes(marketId, 100 * 1e6);
uint256 usdcOut = router.estimateSellYes(marketId, 50 * 1e18);
```

#### Redeeming Winnings

```solidity
// After market resolves, redeem winning tokens
// Router auto-detects winning outcome
uint256 collateral = router.redeem(marketId, winningTokenBalance);
```

### Liquidity Providers

LPs provide capital to enable trading and earn from the spread.

#### Adding Liquidity

```solidity
// Approve router
IERC20(usdc).approve(routerAddress, amount);

// Add liquidity (first LP sets baseline)
uint256 lpShares = router.addLiquidity(
    marketId,
    1000 * 1e6,   // 1000 USDC
    900 * 1e18    // Min LP shares (slippage)
);
```

#### Removing Liquidity

```solidity
// Remove liquidity
uint256 collateralOut = router.removeLiquidity(
    marketId,
    lpShares,
    950 * 1e6     // Min collateral out
);
```

#### LP Economics

**Potential Profits:**
- Trading fees implicit in LMSR spread
- Profit when market resolves near initial prices

**Potential Losses:**
- Maximum loss bounded by liquidity parameter
- Loss increases as market moves away from initial state

**Strategy Considerations:**
- Provide liquidity to markets you believe are fairly priced
- Larger `b` = more fees but higher max loss
- Consider removing liquidity before high-volatility events

### Resolvers

Anyone can trigger market resolution after the deadline.

#### Resolution Process

```solidity
// Step 1: Request oracle resolution (after evalTime + twapWindow)
marketCore.requestResolution(marketId);

// Step 2: Wait for oracle to resolve (often same tx for TWAP oracle)

// Step 3: Finalize market with oracle result
marketCore.finalizeMarket(marketId);
```

#### Incentives

- No direct rewards for resolution
- Users are incentivized to resolve to unlock their funds
- Bots can monitor for resolvable markets

### Third-Party Observers

Developers can build on top of the protocol.

#### Querying Market State

```solidity
// Get market parameters
MarketCore.MarketParams memory params = marketCore.getMarketParams(marketId);

// Get market status
(MarketStatus status, uint8 winner, bool invalid) = marketCore.getMarketState(marketId);

// Get FPMM state
(uint256 collateral, int256[] memory netSold, uint256 lpSupply) = 
    fpmmAMM.getFpmmMarketState(marketId);

// Get prices
uint256[] memory prices = fpmmAMM.getOutcomePrices(marketId);
```

#### Events to Monitor

```solidity
// Market creation
event MarketCreated(bytes32 indexed marketId, ...);

// Trading activity
event OutcomeBought(bytes32 indexed marketId, address indexed buyer, ...);
event OutcomeSold(bytes32 indexed marketId, address indexed seller, ...);

// Liquidity changes
event LiquidityAdded(bytes32 indexed marketId, address indexed provider, ...);
event LiquidityRemoved(bytes32 indexed marketId, address indexed provider, ...);

// Resolution
event MarketFinalized(bytes32 indexed marketId, uint8 winningOutcomeIndex, bool isInvalid);

// Redemption
event WinningsRedeemed(bytes32 indexed marketId, address indexed redeemer, ...);
```

#### Building Custom Oracles

Implement `IOutcomeOracle` to support new question types:

```solidity
contract CustomOracle is IOutcomeOracle {
    function requestResolution(bytes32 questionId) external override {
        // Fetch data from your source
        // Store result
    }
    
    function getOutcome(bytes32 questionId) external view override returns (
        Outcome outcome,
        bool resolved,
        uint64 resolutionTime
    ) {
        // Return stored result
    }
}
```

---

## Deployment

### Prerequisites

- Node.js v18+
- Hardhat v3.x
- OpenZeppelin Contracts v5.x

### Deployment Order

Contracts must be deployed in this order due to dependencies:

```
1. OutcomeToken1155
   └── Constructor args: (minters[], baseURI)
   └── Note: minters = [MarketCore, FpmmAMM] (deploy first, then update)

2. MarketCore
   └── Constructor args: (outcomeToken1155)

3. FpmmAMM
   └── Constructor args: (marketCore, outcomeToken1155)

4. UniV3EthUsdTwapOracleAdapter
   └── Constructor args: (none)

5. PredictionMarketDeployer
   └── Constructor args: (marketCore, fpmmAMM, outcomeToken1155)

6. SimpleRouter
   └── Constructor args: (marketCore, fpmmAMM, outcomeToken1155)
```

### Deployment Script Example

```javascript
async function main() {
  // Deploy OutcomeToken1155 with temporary minters
  const OutcomeToken1155 = await ethers.getContractFactory("OutcomeToken1155");
  const outcomeToken = await OutcomeToken1155.deploy([], "https://metadata.example.com/");
  
  // Deploy MarketCore
  const MarketCore = await ethers.getContractFactory("MarketCore");
  const marketCore = await MarketCore.deploy(outcomeToken.address);
  
  // Deploy FpmmAMM
  const FpmmAMM = await ethers.getContractFactory("FpmmAMM");
  const fpmmAMM = await FpmmAMM.deploy(marketCore.address, outcomeToken.address);
  
  // Note: OutcomeToken1155 minters must be set at deployment
  // Re-deploy OutcomeToken1155 with correct minters if needed
  
  // Deploy Oracle
  const Oracle = await ethers.getContractFactory("UniV3EthUsdTwapOracleAdapter");
  const oracle = await Oracle.deploy();
  
  // Deploy helpers
  const Deployer = await ethers.getContractFactory("PredictionMarketDeployer");
  const deployer = await Deployer.deploy(
    marketCore.address, 
    fpmmAMM.address, 
    outcomeToken.address
  );
  
  const Router = await ethers.getContractFactory("SimpleRouter");
  const router = await Router.deploy(
    marketCore.address, 
    fpmmAMM.address, 
    outcomeToken.address
  );
}
```

---

## Security Model

### Trust Assumptions

| Component | Trust Requirement |
|-----------|-------------------|
| Smart Contracts | Correct implementation (audited code) |
| Oracle | Honest data reporting (TWAP resistant to manipulation) |
| Collateral Token | Standard ERC-20 behavior |
| Uniswap V3 Pool | Sufficient liquidity for reliable TWAP |

### Security Features

1. **No Admin Keys**: No privileged roles that could rug users
2. **No Pause Function**: Protocol cannot be halted
3. **No Upgrades**: Immutable code, no proxy patterns
4. **Reentrancy Protection**: ReentrancyGuard on all state-changing functions
5. **Slippage Protection**: Min/max parameters on all trades
6. **Safe Token Transfers**: SafeERC20 for all ERC-20 operations

### Known Limitations

1. **Oracle Risk**: Markets depend on oracle accuracy
2. **TWAP Manipulation**: Very large capital could influence TWAP over the window
3. **LP Risk**: Liquidity providers can lose up to their deposit
4. **No Emergency Withdraw**: By design, there's no way to pause or emergency withdraw

### Recommended Practices

- Use appropriate TWAP windows (30+ minutes recommended)
- Set reasonable slippage tolerances
- Don't LP more than you can afford to lose
- Verify market parameters before trading

---

## Gas Optimizations

### Implemented Optimizations

| Optimization | Description |
|--------------|-------------|
| Packed Structs | MarketParams fits in 3 slots |
| O(1) Operations | No unbounded loops in critical paths |
| Storage Pointers | Minimize SLOAD with `storage` references |
| Unchecked Arithmetic | Where overflow is impossible |
| Lazy Approvals | Approve once, use forever |
| Custom ERC-1155 | Lighter than OpenZeppelin implementation |
| Inline Math | exp/ln implemented without external libraries |

### Gas Estimates (Approximate)

| Operation | Gas |
|-----------|-----|
| Create Market | ~200,000 |
| Buy Outcome | ~150,000 |
| Sell Outcome | ~140,000 |
| Add Liquidity | ~120,000 |
| Remove Liquidity | ~160,000 |
| Redeem Winnings | ~80,000 |

---

## Hemi Chain Addresses

The following addresses are hardcoded in the oracle adapter for Hemi chain:

| Contract | Address |
|----------|---------|
| ETH/USDC.e V3 Pool | `0x9580d4519c9f27642e21085e763e761a74ef3735` |
| WETH | `0x4200000000000000000000000000000000000006` |
| USDC.e | `0xad11a8BEb98bbf61dbb1aa0F6d6F2ECD87b35afA` |

---

## File Structure

```
contracts/
├── interfaces/
│   └── IOutcomeOracle.sol          # Oracle interface
├── OutcomeToken1155.sol            # ERC-1155 outcome tokens
├── MarketCore.sol                  # Market registry & resolution
├── FpmmAMM.sol                     # LMSR automated market maker
├── UniV3EthUsdTwapOracleAdapter.sol # Uniswap V3 TWAP oracle
├── PredictionMarketDeployer.sol    # Atomic deployment helper
└── SimpleRouter.sol                # User-friendly router
```

---

## Testing

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Gas report
REPORT_GAS=true npx hardhat test

# Coverage
npx hardhat coverage
```

---

## License

MIT License

---

## Acknowledgments

- [Hanson's Market Scoring Rules](http://mason.gmu.edu/~rhanson/mktscore.pdf) - LMSR theory
- [Gnosis Conditional Tokens](https://github.com/gnosis/conditional-tokens-contracts) - Design inspiration
- [Uniswap V3](https://uniswap.org/) - TWAP oracle
- [OpenZeppelin](https://openzeppelin.com/) - Security patterns

---

## Disclaimer

This software is provided "as is" without warranty of any kind. Use at your own risk. The authors are not responsible for any losses incurred through the use of this protocol. Always verify contract addresses and perform your own due diligence before interacting with any smart contracts.
