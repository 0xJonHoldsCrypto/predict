const fs = require('fs');
const SimpleRouter = JSON.parse(fs.readFileSync('artifacts/contracts/SimpleRouter.sol/SimpleRouter.json'));
const MarketCore = JSON.parse(fs.readFileSync('artifacts/contracts/MarketCore.sol/MarketCore.json'));
const FpmmAMM = JSON.parse(fs.readFileSync('artifacts/contracts/FpmmAMM.sol/FpmmAMM.json'));
const OutcomeToken1155 = JSON.parse(fs.readFileSync('artifacts/contracts/OutcomeToken1155.sol/OutcomeToken1155.json'));
const PredictionMarketDeployer = JSON.parse(fs.readFileSync('artifacts/contracts/PredictionMarketDeployer.sol/PredictionMarketDeployer.json'));
const UniV3EthUsdTwapOracleAdapter = JSON.parse(fs.readFileSync('artifacts/contracts/UniV3EthUsdTwapOracleAdapter.sol/UniV3EthUsdTwapOracleAdapter.json'));
const MockERC20 = JSON.parse(fs.readFileSync('artifacts/contracts/mocks/MockERC20.sol/MockERC20.json'));
const MockOracle = JSON.parse(fs.readFileSync('artifacts/contracts/mocks/MockOracle.sol/MockOracle.json'));
const IERC20 = JSON.parse(fs.readFileSync('artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json'));

const abis = {
  SimpleRouter: SimpleRouter.abi,
  MarketCore: MarketCore.abi,
  FpmmAMM: FpmmAMM.abi,
  OutcomeToken1155: OutcomeToken1155.abi,
  PredictionMarketDeployer: PredictionMarketDeployer.abi,
  UniV3EthUsdTwapOracleAdapter: UniV3EthUsdTwapOracleAdapter.abi,
  MockERC20: MockERC20.abi,
  MockOracle: MockOracle.abi,
  IERC20: IERC20.abi
};

console.log('export const ABIS = ' + JSON.stringify(abis, null, 2) + ';');
