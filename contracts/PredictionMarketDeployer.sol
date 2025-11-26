// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PredictionMarketDeployer
 * @author Hemi Prediction Markets
 * @notice Convenience contract for deploying complete prediction markets in a single transaction
 * @dev Orchestrates oracle question registration, MarketCore market creation, and FpmmAMM registration
 * 
 * This contract simplifies the multi-step market creation process:
 * 1. Register the question with the oracle adapter (e.g., UniV3EthUsdTwapOracleAdapter)
 * 2. Create the market in MarketCore with oracle reference
 * 3. Register the FPMM market for AMM trading
 * 
 * All three steps are atomic - if any fails, the entire transaction reverts.
 * 
 * Hemi Chain Addresses (for reference):
 * - ETH/USDC.e Pool: 0x9580d4519c9f27642e21085e763e761a74ef3735
 * - WETH:            0x4200000000000000000000000000000000000006
 * - USDC.e:          0xad11a8BEb98bbf61dbb1aa0F6d6F2ECD87b35afA
 * 
 * Architecture:
 * - Stateless helper contract (no mutable storage)
 * - Only stores immutable contract references
 * - No admin, owner, or governance functions
 * - Fully permissionless - anyone can deploy markets
 * 
 * Gas Optimizations:
 * - Single transaction for complete market setup
 * - Minimal storage (only immutable references)
 * - Direct external calls without intermediate state
 * - Struct parameters to avoid stack-too-deep
 */
contract PredictionMarketDeployer {
    // ============ Errors ============
    
    /// @notice Address cannot be zero
    error ZeroAddress();
    
    /// @notice Market creation in MarketCore failed
    error MarketCreationFailed();
    
    /// @notice FPMM market registration failed
    error FpmmRegistrationFailed();

    // ============ Hemi Chain Constants ============
    
    /// @notice Default ETH/USDC.e V3 pool on Hemi
    address public constant HEMI_ETH_USDC_POOL = 0x9580D4519C9F27642e21085E763E761a74eF3735;
    
    /// @notice WETH address on Hemi
    address public constant HEMI_WETH = 0x4200000000000000000000000000000000000006;
    
    /// @notice USDC.e address on Hemi (via Stargate/LayerZero)
    address public constant HEMI_USDC = 0xad11a8BEb98bbf61dbb1aa0F6d6F2ECD87b35afA;

    // ============ Immutable References ============
    
    /// @notice MarketCore contract for market registry and resolution
    address public immutable marketCore;
    
    /// @notice FpmmAMM contract for trading
    address public immutable fpmmAMM;
    
    /// @notice OutcomeToken1155 contract for outcome tokens
    address public immutable outcomeToken1155;

    // ============ Types ============
    
    /**
     * @notice Parameters for deploying an ETH/USD threshold market
     * @dev Packed in struct to avoid stack-too-deep errors
     */
    struct ThresholdMarketParams {
        address oracleAdapter;      // UniV3EthUsdTwapOracleAdapter address
        address pool;               // Uniswap V3 pool (ETH/USDC)
        address baseToken;          // Base token (WETH)
        address quoteToken;         // Quote token (USDC)
        address collateralToken;    // Trading collateral (typically USDC)
        uint256 threshold;          // Price threshold in quote decimals
        uint256 liquidityParameterB;// LMSR liquidity parameter
        uint64 evalTime;            // Oracle evaluation timestamp
        uint64 marketDeadline;      // Last trading timestamp
        uint32 twapWindow;          // TWAP window in seconds
        uint8 configFlags;          // Market configuration flags
        bool greaterThan;           // true: YES if price >= threshold
    }
    
    /**
     * @notice Simplified parameters for Hemi ETH/USD markets
     * @dev Uses default Hemi addresses for pool, WETH, USDC
     */
    struct HemiMarketParams {
        address oracleAdapter;      // UniV3EthUsdTwapOracleAdapter address
        uint256 threshold;          // Price threshold in USDC (6 decimals)
        uint256 liquidityParameterB;// LMSR liquidity parameter
        uint64 evalTime;            // Oracle evaluation timestamp
        uint64 marketDeadline;      // Last trading timestamp
        uint32 twapWindow;          // TWAP window in seconds
        uint8 configFlags;          // Market configuration flags
        bool greaterThan;           // true: YES if price >= threshold
    }

    // ============ Events ============
    
    /**
     * @notice Emitted when a complete prediction market is deployed
     * @param marketId The MarketCore market identifier
     * @param questionId The oracle question identifier
     * @param oracle The oracle adapter address
     * @param collateralToken The trading collateral token
     * @param numOutcomes Number of market outcomes
     * @param liquidityParameterB LMSR liquidity parameter
     * @param metadataURI Off-chain metadata location
     * @param deployer Address that deployed the market
     */
    event PredictionMarketDeployed(
        bytes32 indexed marketId,
        bytes32 indexed questionId,
        address indexed oracle,
        address collateralToken,
        uint8 numOutcomes,
        uint256 liquidityParameterB,
        string metadataURI,
        address deployer
    );

    // ============ Constructor ============
    
    /**
     * @notice Deploy the helper with references to core contracts
     * @param _marketCore Address of MarketCore contract
     * @param _fpmmAMM Address of FpmmAMM contract
     * @param _outcomeToken1155 Address of OutcomeToken1155 contract
     */
    constructor(
        address _marketCore,
        address _fpmmAMM,
        address _outcomeToken1155
    ) {
        if (_marketCore == address(0)) revert ZeroAddress();
        if (_fpmmAMM == address(0)) revert ZeroAddress();
        if (_outcomeToken1155 == address(0)) revert ZeroAddress();
        
        marketCore = _marketCore;
        fpmmAMM = _fpmmAMM;
        outcomeToken1155 = _outcomeToken1155;
    }

    // ============ Market Deployment Functions ============
    
    /**
     * @notice Deploy a complete ETH/USD threshold prediction market
     * @param p All market parameters packed in a struct
     * @param metadataURI Off-chain metadata URI (IPFS, Arweave, etc.)
     * @return marketId The created market's identifier
     * @return questionId The oracle question's identifier
     * @dev Atomic operation - all three steps succeed or all revert
     *      Step 1: Register question with oracle adapter
     *      Step 2: Create market in MarketCore
     *      Step 3: Register FPMM market for trading
     */
    function deployEthUsdThresholdMarket(
        ThresholdMarketParams calldata p,
        string calldata metadataURI
    ) external returns (bytes32 marketId, bytes32 questionId) {
        // Step 1: Register question with oracle adapter
        questionId = IUniV3OracleAdapter(p.oracleAdapter).registerThresholdQuestion(
            p.pool,
            p.baseToken,
            p.quoteToken,
            p.threshold,
            p.twapWindow,
            p.evalTime,
            p.greaterThan
        );
        
        // Step 2: Create market in MarketCore
        IMarketCore.MarketParams memory marketParams = IMarketCore.MarketParams({
            collateralToken: p.collateralToken,
            marketDeadline: p.marketDeadline,
            configFlags: p.configFlags,
            numOutcomes: 2, // Binary market (YES/NO)
            oracle: p.oracleAdapter,
            questionId: questionId
        });
        
        marketId = IMarketCore(marketCore).createMarket(marketParams, metadataURI);
        
        // Step 3: Register FPMM market for AMM trading
        IFpmmAMM(fpmmAMM).registerFpmmMarket(marketId, p.liquidityParameterB);
        
        emit PredictionMarketDeployed(
            marketId,
            questionId,
            p.oracleAdapter,
            p.collateralToken,
            2,
            p.liquidityParameterB,
            metadataURI,
            msg.sender
        );
    }
    
    /**
     * @notice Deploy an ETH/USD market using Hemi default addresses
     * @param p Simplified parameters (uses Hemi WETH, USDC, pool defaults)
     * @param metadataURI Off-chain metadata URI
     * @return marketId The created market's identifier
     * @return questionId The oracle question's identifier
     * @dev Convenience function that uses HEMI_ETH_USDC_POOL, HEMI_WETH, HEMI_USDC
     *      Collateral is automatically set to HEMI_USDC
     */
    function deployHemiEthUsdMarket(
        HemiMarketParams calldata p,
        string calldata metadataURI
    ) external returns (bytes32 marketId, bytes32 questionId) {
        // Step 1: Register question with oracle adapter using Hemi defaults
        questionId = IUniV3OracleAdapter(p.oracleAdapter).registerThresholdQuestion(
            HEMI_ETH_USDC_POOL,
            HEMI_WETH,
            HEMI_USDC,
            p.threshold,
            p.twapWindow,
            p.evalTime,
            p.greaterThan
        );
        
        // Step 2: Create market in MarketCore
        IMarketCore.MarketParams memory marketParams = IMarketCore.MarketParams({
            collateralToken: HEMI_USDC,
            marketDeadline: p.marketDeadline,
            configFlags: p.configFlags,
            numOutcomes: 2,
            oracle: p.oracleAdapter,
            questionId: questionId
        });
        
        marketId = IMarketCore(marketCore).createMarket(marketParams, metadataURI);
        
        // Step 3: Register FPMM market
        IFpmmAMM(fpmmAMM).registerFpmmMarket(marketId, p.liquidityParameterB);
        
        emit PredictionMarketDeployed(
            marketId,
            questionId,
            p.oracleAdapter,
            HEMI_USDC,
            2,
            p.liquidityParameterB,
            metadataURI,
            msg.sender
        );
    }
    
    /**
     * @notice Deploy a market with a pre-registered oracle question
     * @param oracle Oracle contract address (must implement IOutcomeOracle)
     * @param questionId Pre-registered question ID from the oracle
     * @param collateralToken Token used for trading
     * @param marketDeadline Last trading timestamp
     * @param numOutcomes Number of outcomes (2-8)
     * @param liquidityParameterB LMSR liquidity parameter
     * @param configFlags Market configuration flags
     * @param metadataURI Off-chain metadata URI
     * @return marketId The created market's identifier
     * @dev Use this when the oracle question was registered separately
     *      Supports any oracle implementing IOutcomeOracle interface
     */
    function deployMarketWithExistingQuestion(
        address oracle,
        bytes32 questionId,
        address collateralToken,
        uint64 marketDeadline,
        uint8 numOutcomes,
        uint256 liquidityParameterB,
        uint8 configFlags,
        string calldata metadataURI
    ) external returns (bytes32 marketId) {
        // Create market in MarketCore
        IMarketCore.MarketParams memory params = IMarketCore.MarketParams({
            collateralToken: collateralToken,
            marketDeadline: marketDeadline,
            configFlags: configFlags,
            numOutcomes: numOutcomes,
            oracle: oracle,
            questionId: questionId
        });
        
        marketId = IMarketCore(marketCore).createMarket(params, metadataURI);
        
        // Register FPMM market
        IFpmmAMM(fpmmAMM).registerFpmmMarket(marketId, liquidityParameterB);
        
        emit PredictionMarketDeployed(
            marketId,
            questionId,
            oracle,
            collateralToken,
            numOutcomes,
            liquidityParameterB,
            metadataURI,
            msg.sender
        );
    }

    // ============ View / Pure Functions ============
    
    /**
     * @notice Compute ERC-1155 token IDs for all outcomes of a market
     * @param marketId The market identifier
     * @param numOutcomes Number of outcomes
     * @return tokenIds Array of ERC-1155 token IDs
     * @dev Token ID = (marketId << 8) | outcomeIndex
     */
    function computeOutcomeTokenIds(
        bytes32 marketId,
        uint8 numOutcomes
    ) external pure returns (uint256[] memory tokenIds) {
        tokenIds = new uint256[](numOutcomes);
        for (uint8 i = 0; i < numOutcomes;) {
            tokenIds[i] = (uint256(marketId) << 8) | uint256(i);
            unchecked { ++i; }
        }
    }
    
    /**
     * @notice Preview market ID before creation
     * @param params Market parameters
     * @return marketId The deterministic market ID
     * @dev Market ID = keccak256(abi.encode(params))
     */
    function previewMarketId(
        IMarketCore.MarketParams calldata params
    ) external pure returns (bytes32) {
        return keccak256(abi.encode(params));
    }
    
    /**
     * @notice Preview question ID before creation
     * @param pool Uniswap V3 pool
     * @param baseToken Base token (WETH)
     * @param quoteToken Quote token (USDC)
     * @param threshold Price threshold
     * @param twapWindow TWAP window in seconds
     * @param evalTime Evaluation timestamp
     * @param greaterThan Comparison direction
     * @return questionId The deterministic question ID
     */
    function previewQuestionId(
        address pool,
        address baseToken,
        address quoteToken,
        uint256 threshold,
        uint32 twapWindow,
        uint64 evalTime,
        bool greaterThan
    ) external pure returns (bytes32) {
        return keccak256(abi.encode(
            pool,
            baseToken,
            quoteToken,
            threshold,
            twapWindow,
            evalTime,
            greaterThan
        ));
    }
    
    /**
     * @notice Preview question ID for Hemi ETH/USD market
     * @param threshold Price threshold in USDC (6 decimals)
     * @param twapWindow TWAP window in seconds
     * @param evalTime Evaluation timestamp
     * @param greaterThan Comparison direction
     * @return questionId The deterministic question ID
     */
    function previewHemiQuestionId(
        uint256 threshold,
        uint32 twapWindow,
        uint64 evalTime,
        bool greaterThan
    ) external pure returns (bytes32) {
        return keccak256(abi.encode(
            HEMI_ETH_USDC_POOL,
            HEMI_WETH,
            HEMI_USDC,
            threshold,
            twapWindow,
            evalTime,
            greaterThan
        ));
    }
    
    /**
     * @notice Get YES and NO token IDs for a binary market
     * @param marketId The market identifier
     * @return yesTokenId Token ID for YES outcome (index 0)
     * @return noTokenId Token ID for NO outcome (index 1)
     */
    function getBinaryTokenIds(bytes32 marketId) external pure returns (
        uint256 yesTokenId,
        uint256 noTokenId
    ) {
        yesTokenId = (uint256(marketId) << 8) | 0;
        noTokenId = (uint256(marketId) << 8) | 1;
    }
}

// ============ External Interfaces ============

/**
 * @title IMarketCore
 * @notice Interface for MarketCore contract
 */
interface IMarketCore {
    struct MarketParams {
        address collateralToken;
        uint64 marketDeadline;
        uint8 configFlags;
        uint8 numOutcomes;
        address oracle;
        bytes32 questionId;
    }
    
    function createMarket(
        MarketParams calldata params,
        string calldata metadataURI
    ) external returns (bytes32 marketId);
}

/**
 * @title IFpmmAMM
 * @notice Interface for FpmmAMM contract
 */
interface IFpmmAMM {
    function registerFpmmMarket(
        bytes32 marketId,
        uint256 liquidityParameterB
    ) external;
}

/**
 * @title IUniV3OracleAdapter
 * @notice Interface for UniV3EthUsdTwapOracleAdapter
 */
interface IUniV3OracleAdapter {
    function registerThresholdQuestion(
        address pool,
        address baseToken,
        address quoteToken,
        uint256 threshold,
        uint32 twapWindow,
        uint64 evalTime,
        bool greaterThan
    ) external returns (bytes32 questionId);
}
