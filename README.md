# Hemi Prediction Markets

A fully decentralized, permissionless prediction market protocol for the Hemi blockchain. No admin keys. No pause functions. No upgrades. Just code.

## Table of Contents

- [Overview](#overview)
- [Theory of Operation](#theory-of-operation)
  - [System Architecture](#system-architecture)
  - [Logarithmic Market Scoring Rule (LMSR)](#logarithmic-market-scoring-rule-lmsr)
  - [Outcome Tokens](#outcome-tokens)
  - [Oracle System](#oracle-system)
  - [Market Lifecycle](#market-lifecycle)
- [Actor Guide](#actor-guide)
  - [Market Creators](#market-creators)
  - [Traders](#traders)
  - [Liquidity Providers](#liquidity-providers)
  - [Resolvers](#resolvers)
  - [Integrators](#integrators)
- [Contract Overview](#contract-overview)
- [Security Model](#security-model)
- [Deployment](#deployment)
- [License](#license)

---

## Overview

Hemi Prediction Markets enables speculation on future events using an Automated Market Maker (AMM) based on Hanson's Logarithmic Market Scoring Rule (LMSR).

**Key Properties:**
- **Permissionless** - Anyone can create markets, trade, provide liquidity, or trigger resolution
- **Ungoverned** - No privileged roles, no governance tokens, immutable after deployment
- **Multi-Outcome** - Supports 2 to 8 outcomes per market (binary YES/NO is the common case)
- **Pluggable Oracles** - Extensible oracle system (ships with Uniswap V3 TWAP adapter)

---

## Theory of Operation

### System Architecture

Unlike order-book prediction markets (Polymarket, Kalshi), this protocol uses an **Automated Market Maker (AMM)** based on the Logarithmic Market Scoring Rule (LMSR). There's no matching of buyers and sellers—instead, traders buy from and sell to a smart contract that algorithmically sets prices.

#### Contract Roles

| Contract | Role |
|----------|------|
| **MarketCore** | Holds all collateral (USDC), manages market lifecycle, coordinates resolution |
| **FpmmAMM** | Prices trades using LMSR math, mints/burns outcome tokens |
| **OutcomeToken1155** | Single ERC-1155 contract holding all outcome tokens for all markets |
| **Oracle Adapter** | Determines winning outcome after deadline (e.g., via Uniswap V3 TWAP) |

#### Collateral & Token Flow

```
BUY:   User deposits USDC → MarketCore vault → FpmmAMM mints outcome tokens → User
SELL:  User returns outcome tokens → FpmmAMM burns them → MarketCore releases USDC → User
REDEEM: User returns winning tokens → MarketCore releases 1 USDC per token → User
```

All collateral lives in MarketCore. The AMM never holds funds—it only controls minting/burning of outcome tokens based on LMSR pricing.

#### Key Differences from Order-Book Markets

| Aspect | Order Book (Polymarket) | AMM/LMSR (This Protocol) |
|--------|-------------------------|--------------------------|
| Price discovery | Bid/ask matching | Algorithmic via cost function |
| Liquidity | Requires active market makers | Built-in via LP deposits |
| Trade execution | May not fill if no counterparty | Always executes (with slippage) |
| LP risk | N/A | Bounded loss determined by `b` parameter |

#### Typical Operations

**Most common (daily):**
- `buyOutcome` / `sellOutcome` — Traders speculate on outcomes
- `getOutcomePrices` — UIs display current implied probabilities

**Periodic:**
- `addLiquidity` / `removeLiquidity` — LPs adjust positions
- `requestResolution` / `finalizeMarket` — Anyone settles expired markets
- `redeem` — Winners collect collateral

**One-time per market:**
- `deployHemiEthUsdMarket` — Creator launches new market with oracle question

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

The protocol uses a pluggable oracle architecture. Any contract implementing `IOutcomeOracle` can serve as an oracle:

```solidity
interface IOutcomeOracle {
    function requestResolution(bytes32 questionId) external;
    function getOutcome(bytes32 questionId) external view returns (
        uint8 winningOutcomeIndex,  // 0 to (numOutcomes-1)
        bool isInvalid,             // true if question cannot be resolved
        bool resolved,              // true once resolution is complete
        uint64 resolutionTime       // timestamp of resolution
    );
}
```

**Multi-Outcome Design:**
- `winningOutcomeIndex`: For binary markets, 0 = No, 1 = Yes. For multi-outcome markets, indices 0, 1, 2, ... N-1.
- `isInvalid`: Set when a question cannot be resolved (ambiguous, cancelled, etc.)

#### UniV3EthUsdTwapOracleAdapter

The shipped oracle supports ETH/USD price threshold questions using Uniswap V3 TWAP:

- "Will ETH be above $X at time T?" (`greaterThan = true`)
- "Will ETH be below $X at time T?" (`greaterThan = false`)

**Why TWAP?** An attacker must sustain price manipulation for the entire window duration, making attacks expensive. No trusted price feed operator required.

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

## Actor Guide

### Market Creators

Market creators define prediction questions and initialize trading.

#### Creating an ETH/USD Price Market

Use `PredictionMarketDeployer` for atomic single-transaction market creation:

```solidity
PredictionMarketDeployer.HemiMarketParams memory params = PredictionMarketDeployer.HemiMarketParams({
    oracleAdapter: oracleAdapterAddress,
    threshold: 4000 * 1e6,           // $4000 (USDC decimals)
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

| b Value | Behavior |
|---------|----------|
| `100e18` | High price sensitivity, low liquidity |
| `1000e18` | Balanced |
| `10000e18` | Stable prices, deep liquidity |

Higher `b` = more liquidity, smaller price impact per trade, but higher potential LP loss.

#### Configuration Flags

| Flag | Value | Effect |
|------|-------|--------|
| `FLAG_EARLY_RESOLUTION` | `0x01` | Allow resolution before deadline |
| `FLAG_INVALID_REFUND` | `0x02` | All outcomes redeemable if market resolves as invalid |

---

### Traders

Traders speculate by buying and selling outcome tokens through the SimpleRouter.

#### Buying Outcome Tokens

```solidity
// Approve router to spend collateral (one-time)
IERC20(usdc).approve(routerAddress, type(uint256).max);

// Buy outcome index 1 (YES in binary markets)
uint256 tokensReceived = router.buyOutcome(
    marketId,
    1,            // outcomeIndex (0=NO, 1=YES for binary)
    100 * 1e6,    // 100 USDC
    95 * 1e18     // minTokensOut (slippage protection)
);
```

#### Selling Outcome Tokens

```solidity
// Approve router for outcome tokens (one-time)
IOutcomeToken1155(outcomeToken).setApprovalForAll(routerAddress, true);

// Sell outcome tokens
uint256 collateralReceived = router.sellOutcome(
    marketId,
    1,            // outcomeIndex
    50 * 1e18,    // tokensIn
    45 * 1e6      // minCollateralOut
);
```

#### Price Queries

```solidity
// Get all outcome prices (sum to ~1e18)
uint256[] memory prices = router.getOutcomePrices(marketId);
// prices[1] = 0.6e18 means 60% implied probability for YES

// Estimate trade outcomes
uint256 tokensOut = router.estimateBuy(marketId, 1, 100 * 1e6);
uint256 collateralOut = router.estimateSell(marketId, 1, 50 * 1e18);
```

#### Redeeming After Resolution

```solidity
// Router auto-detects winning outcome
uint256 collateral = router.redeem(marketId, amount);

// For invalid markets with FLAG_INVALID_REFUND, redeem any outcome:
uint256 collateral = router.redeemOutcome(marketId, outcomeIndex, amount);
```

---

### Liquidity Providers

LPs provide capital that enables trading. LMSR provides bounded loss.

#### Adding Liquidity

```solidity
IERC20(usdc).approve(routerAddress, type(uint256).max);

uint256 lpShares = router.addLiquidity(
    marketId,
    1000 * 1e6,   // collateral amount
    900 * 1e18    // minLpShares
);
```

#### Removing Liquidity

```solidity
uint256 collateralOut = router.removeLiquidity(
    marketId,
    lpShares,
    950 * 1e6     // minCollateralOut
);
```

#### LP Economics

**Profits:** Trading fees implicit in LMSR spread; profit when market resolves near initial prices.

**Losses:** Bounded by liquidity parameter; increases as market moves away from initial state.

**Strategy:** Provide liquidity to markets you believe are fairly priced. Consider removing liquidity before anticipated high-volatility events.

---

### Resolvers

Anyone can trigger market resolution after the deadline. No special permissions required.

```solidity
// After deadline passes and evalTime + twapWindow elapses
marketCore.requestResolution(marketId);

// Finalize with oracle result
marketCore.finalizeMarket(marketId);
```

No direct rewards for resolution. Users resolve to unlock their own funds. Bots can monitor for resolvable markets.

---

### Integrators

Build UIs, aggregators, or automated strategies on top of the protocol.

#### Querying Market State

```solidity
// Market parameters
MarketCore.MarketParams memory params = marketCore.getMarketParams(marketId);

// Market status
(MarketStatus status, uint8 winningIndex, bool isInvalid) = marketCore.getMarketState(marketId);

// AMM state
(uint256 collateral, int256[] memory netSold, uint256 lpSupply) =
    fpmmAMM.getFpmmMarketState(marketId);

// Current prices
uint256[] memory prices = fpmmAMM.getOutcomePrices(marketId);

// User balances
uint256[] memory balances = router.getUserAllOutcomeBalances(marketId, userAddress);
uint256 lpBalance = router.getUserLpShares(marketId, userAddress);
```

#### Key Events

```solidity
event MarketCreated(bytes32 indexed marketId, ...);
event OutcomeBought(bytes32 indexed marketId, address indexed buyer, uint8 outcomeIndex, ...);
event OutcomeSold(bytes32 indexed marketId, address indexed seller, uint8 outcomeIndex, ...);
event LiquidityAdded(bytes32 indexed marketId, address indexed provider, ...);
event LiquidityRemoved(bytes32 indexed marketId, address indexed provider, ...);
event MarketFinalized(bytes32 indexed marketId, uint8 winningOutcomeIndex, bool isInvalid);
event WinningsRedeemed(bytes32 indexed marketId, address indexed redeemer, ...);
```

#### Building Custom Oracles

Implement `IOutcomeOracle` to support new question types:

```solidity
contract CustomOracle is IOutcomeOracle {
    function requestResolution(bytes32 questionId) external override {
        // Fetch data, determine outcome, store result
    }

    function getOutcome(bytes32 questionId) external view override returns (
        uint8 winningOutcomeIndex,
        bool isInvalid,
        bool resolved,
        uint64 resolutionTime
    ) {
        // Return stored result
    }
}
```

---

## Contract Overview

| Contract | Purpose |
|----------|---------|
| **OutcomeToken1155** | ERC-1155 tokens for all outcomes. Token ID = `(marketId << 8) \| outcomeIndex`. Minters are immutable. |
| **MarketCore** | Market registry, collateral vault, resolution coordinator. Deterministic market IDs. |
| **FpmmAMM** | LMSR automated market maker. Contains pure Solidity `exp()` and `ln()` implementations. |
| **UniV3EthUsdTwapOracleAdapter** | Oracle for ETH/USD price threshold questions using Uniswap V3 TWAP. |
| **PredictionMarketDeployer** | Atomic market deployment (oracle question + market + FPMM in one tx). |
| **SimpleRouter** | User-friendly wrapper. Handles approvals, auto-detects winners for redemption. |

---

## Security Model

**Trust Assumptions:**
- Smart contract code is correct
- Oracle reports honest data (TWAP is manipulation-resistant)
- Collateral token behaves as standard ERC-20
- Uniswap V3 pool has sufficient liquidity for reliable TWAP

**Security Properties:**
- No admin keys or privileged roles
- No pause function - protocol cannot be halted
- No upgrades - immutable code, no proxy patterns
- ReentrancyGuard on all state-changing functions
- Slippage protection on all trades
- SafeERC20 for all token operations

**Known Risks:**
- Markets depend on oracle accuracy
- TWAP can be manipulated with very large capital over the window duration
- LPs can lose up to their deposit
- No emergency withdraw (by design)

**Recommendations:**
- Use TWAP windows of 30+ minutes
- Set reasonable slippage tolerances
- Don't LP more than you can afford to lose
- Verify market parameters before trading

---

## Deployment

Contracts must be deployed in this order (constructor dependencies):

1. **OutcomeToken1155** - `(minters[], baseURI)` - minters = [MarketCore, FpmmAMM]
2. **MarketCore** - `(outcomeToken1155)`
3. **FpmmAMM** - `(marketCore, outcomeToken1155)`
4. **UniV3EthUsdTwapOracleAdapter** - `()` (no args)
5. **PredictionMarketDeployer** - `(marketCore, fpmmAMM, outcomeToken1155)`
6. **SimpleRouter** - `(marketCore, fpmmAMM, outcomeToken1155)`

Note: OutcomeToken1155 minters are immutable. You may need to deploy it last with the correct minter addresses.

**Hemi Chain Constants** (hardcoded in oracle adapter):

| Contract | Address |
|----------|---------|
| ETH/USDC.e V3 Pool | `0x9580d4519c9f27642e21085e763e761a74ef3735` |
| WETH | `0x4200000000000000000000000000000000000006` |
| USDC.e | `0xad11a8BEb98bbf61dbb1aa0F6d6F2ECD87b35afA` |

---

## Development

```bash
npm install           # Install dependencies
npx hardhat compile   # Compile contracts
npx hardhat test      # Run tests
REPORT_GAS=true npx hardhat test  # Gas report
npx hardhat coverage  # Coverage
```

---

## License

MIT

---

## Acknowledgments

- [Hanson's Market Scoring Rules](http://mason.gmu.edu/~rhanson/mktscore.pdf)
- [Gnosis Conditional Tokens](https://github.com/gnosis/conditional-tokens-contracts)
- [Uniswap V3](https://uniswap.org/)

---

*This software is provided "as is" without warranty. Use at your own risk.*
