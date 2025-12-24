import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi';
import { ABIS } from '@/contracts/abis';
import deployment from '@/contracts/deployment.json';
import { parseUnits, formatUnits } from 'viem';
import { Loader2, ShieldAlert, Clock, RefreshCw } from 'lucide-react';

interface MarketResolutionPanelProps {
    marketId: string;
    questionId: string;
    outcomes: string[];
    oracleAddress: string;
}

export function MarketResolutionPanel({ marketId, questionId, outcomes, oracleAddress }: MarketResolutionPanelProps) {
    const [selectedOutcomeIndex, setSelectedOutcomeIndex] = useState<string>('');
    const { data: hash, isPending, writeContract } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
    const [now, setNow] = useState(BigInt(Math.floor(Date.now() / 1000)));

    useEffect(() => {
        const timer = setInterval(() => setNow(BigInt(Math.floor(Date.now() / 1000))), 1000);
        return () => clearInterval(timer);
    }, []);

    const isMockOracle = !!(oracleAddress && deployment.mockOracle && oracleAddress.toLowerCase() === deployment.mockOracle.toLowerCase());
    const isTwapOracle = !!(oracleAddress && deployment.oracleAdapter && oracleAddress.toLowerCase() === deployment.oracleAdapter.toLowerCase());

    // --- TWAP Data Fetching ---
    const { data: questionConfigData } = useReadContract({
        address: oracleAddress as `0x${string}`,
        abi: ABIS.UniV3EthUsdTwapOracleAdapter,
        functionName: 'getQuestionConfig',
        args: [questionId as `0x${string}`],
        query: { enabled: !!isTwapOracle }
    });

    const questionConfig = questionConfigData as any[] | undefined;

    // Extract properly encoded return values
    // getQuestionConfig returns: [pool, base, quote, threshold, twapWindow, evalTime, greaterThan]
    const threshold = questionConfig?.[3] as bigint | undefined;
    const twapWindow = questionConfig?.[4] as number | undefined;
    const evalTime = questionConfig?.[5] as bigint | undefined;
    const greaterThan = questionConfig?.[6] as boolean | undefined;

    const { data: currentPriceData, refetch: refetchPrice } = useReadContract({
        address: oracleAddress as `0x${string}`,
        abi: ABIS.UniV3EthUsdTwapOracleAdapter,
        functionName: 'getHemiEthUsdPrice',
        args: twapWindow ? [twapWindow] : undefined,
        query: {
            enabled: !!twapWindow,
            refetchInterval: 10000 // Polling
        }
    });

    const currentPrice = currentPriceData as bigint | undefined;

    // Logic for TWAP
    const twapWindowBig = twapWindow ? BigInt(twapWindow) : BigInt(0);
    const resolutionReady = isTwapOracle && evalTime && twapWindow && (now >= (evalTime + twapWindowBig));
    const timeRemaining = (evalTime && twapWindow) ? (evalTime + twapWindowBig) - now : BigInt(0);

    // Formatting
    const fmtPrice = currentPrice ? formatUnits(currentPrice, 6) : "..."; // Assume USDC decimals
    const fmtThreshold = threshold ? formatUnits(threshold, 6) : "...";
    const isYes = currentPrice && threshold && greaterThan !== undefined && (greaterThan ? currentPrice >= threshold : currentPrice <= threshold);

    // Only show for known oracles
    if (!isMockOracle && !isTwapOracle) return null;

    // --- Market State Fetching ---
    // Check if user is admin (deployer)
    const { address: userAddress } = useAccount();
    const isAdmin = !!(userAddress && deployment.deployer && userAddress.toLowerCase() === deployment.deployer.toLowerCase());

    // --- Market State Fetching ---
    const { data: marketState } = useReadContract({
        address: deployment.marketCore as `0x${string}`,
        abi: ABIS.MarketCore,
        functionName: 'getMarketState',
        args: [marketId],
    });

    // marketState returns [status, winningOutcomeIndex, isInvalid]
    // status: 0=Open, 1=Resolvable, 2=Resolved
    const marketStatus = marketState ? Number((marketState as any)[0]) : 0;
    const isResolvable = marketStatus === 1;

    // --- Mock Oracle Outcome Fetching ---
    const { data: oracleOutcomeData, refetch: refetchOracle } = useReadContract({
        address: deployment.mockOracle as `0x${string}`,
        abi: ABIS.MockOracle,
        functionName: 'getOutcome',
        args: [questionId || '0x0'],
        query: { enabled: !!isMockOracle }
    });

    // MockOracle getOutcome returns: [winningOutcomeIndex, isInvalid, resolved, resolutionTime]
    const oracleOutcomeIndex = oracleOutcomeData ? Number((oracleOutcomeData as any)[0]) : undefined;
    const isOracleResolved = oracleOutcomeData ? (oracleOutcomeData as any)[2] : false;

    // Initialize or Sync selection with Oracle state
    useEffect(() => {
        if (isOracleResolved && oracleOutcomeIndex !== undefined && selectedOutcomeIndex === '') {
            setSelectedOutcomeIndex(oracleOutcomeIndex.toString());
        }
    }, [isOracleResolved, oracleOutcomeIndex, selectedOutcomeIndex]);

    const handleFinalize = () => {
        if (isTwapOracle && isResolvable) {
            // Step 2: Finalize
            writeContract({
                address: deployment.marketCore as `0x${string}`,
                abi: ABIS.MarketCore,
                functionName: 'finalizeMarket',
                args: [marketId],
            });
        } else {
            // Step 1: Request Resolution
            writeContract({
                address: deployment.marketCore as `0x${string}`,
                abi: ABIS.MarketCore,
                functionName: 'requestResolution',
                args: [marketId],
            });
        }
    }

    const handleAction = async () => {
        if (!selectedOutcomeIndex) return;

        const targetIndex = BigInt(selectedOutcomeIndex);

        // Step 1: Set Outcome (if not set or different)
        // We allow re-setting outcome if it hasn't been finalized yet
        if (!isOracleResolved || oracleOutcomeIndex !== Number(selectedOutcomeIndex)) {
            writeContract({
                address: deployment.mockOracle as `0x${string}`,
                abi: ABIS.MockOracle,
                functionName: 'setOutcome',
                args: [questionId, targetIndex, false], // isInvalid = false
            });
        }
        // Step 2: Finalize (if Oracle matches selection)
        else {
            writeContract({
                address: deployment.marketCore as `0x${string}`,
                abi: ABIS.MarketCore,
                functionName: 'finalizeMarket',
                args: [marketId],
            });
        }
    };

    // Only show if:
    // 1. Is Mock Oracle AND User is Admin
    // 2. Is TWAP Oracle (anyone can see, but buttons disabled if too early)
    if (marketStatus === 2) return null;
    if (isMockOracle && !isAdmin) return null;
    if (!isMockOracle && !isTwapOracle) return null;

    // Determine Button State
    const isStep1 = !isOracleResolved || (selectedOutcomeIndex !== '' && oracleOutcomeIndex !== Number(selectedOutcomeIndex));
    const buttonLabel = isStep1 ? "Set Winning Outcome" : "Finalize Market";
    const buttonColor = isStep1 ? "bg-orange-600 hover:bg-orange-700" : "bg-red-600 hover:bg-red-700";

    return (
        <Card className={`mt-8 border-bg-card ${isMockOracle ? 'border-orange-500/30 bg-orange-500/5' : 'border-blue-500/30 bg-blue-500/5'}`}>
            <CardHeader>
                <div className={`flex items-center gap-2 ${isMockOracle ? 'text-orange-500' : 'text-blue-500'}`}>
                    {isMockOracle ? <ShieldAlert className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                    <CardTitle>{isMockOracle ? 'Admin Resolution Panel' : 'Automated Resolution Panel'}</CardTitle>
                </div>
                <CardDescription>
                    {isMockOracle
                        ? "Restricted: Only the platform administrator can resolve this market."
                        : "This market uses an on-chain TWAP Oracle. Resolution is automated once the time window closes."
                    }
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isTwapOracle && (
                    <div className="bg-background/50 p-4 rounded-md space-y-2 text-sm border">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Current TWAP Price:</span>
                            <span className="font-mono font-bold flex items-center gap-2">
                                ${fmtPrice}
                                <RefreshCw className="h-3 w-3 cursor-pointer opacity-50 hover:opacity-100" onClick={() => refetchPrice()} />
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Target Threshold:</span>
                            <span className="font-mono">${fmtThreshold}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Condition:</span>
                            <span>{greaterThan ? "Price >= Threshold" : "Price <= Threshold"}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 mt-2">
                            <span className="text-muted-foreground">Predicted Outcome:</span>
                            <span className={`font-bold ${isYes ? 'text-green-500' : 'text-red-500'}`}>
                                {isYes ? "YES" : "NO"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            {resolutionReady ? (
                                <span className="text-green-500 font-bold animate-pulse">Ready to Finalize</span>
                            ) : (
                                <span className="text-yellow-500 font-mono">
                                    Opens in {(() => {
                                        if (timeRemaining <= 0) return "00:00:00";
                                        const d = Math.floor(Number(timeRemaining) / (3600 * 24));
                                        const h = Math.floor((Number(timeRemaining) % (3600 * 24)) / 3600);
                                        const m = Math.floor((Number(timeRemaining) % 3600) / 60);
                                        const s = Math.floor(Number(timeRemaining) % 60);

                                        if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
                                        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                                    })()}
                                </span>
                            )}
                        </div>
                        {isTwapOracle && (
                            <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                                * To resolve this market, wait for the timer to end, then click "Finalize". This submits a transaction to the blockchain.
                            </p>
                        )}

                        <Button
                            onClick={handleFinalize}
                            disabled={isPending || isConfirming || !resolutionReady}
                            className="w-full mt-4"
                        >
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isResolvable ? "Confirm Finalization" : "Request Resolution"}
                        </Button>
                    </div>
                )}

                {isMockOracle && isAdmin && (
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Select value={selectedOutcomeIndex} onValueChange={setSelectedOutcomeIndex}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Winning Outcome" />
                                </SelectTrigger>
                                <SelectContent>
                                    {outcomes.map((outcome, idx) => (
                                        <SelectItem key={idx} value={idx.toString()}>
                                            {outcome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={handleAction}
                            disabled={!selectedOutcomeIndex || isPending || isConfirming}
                            className={`w-full ${buttonColor}`}
                        >
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {buttonLabel}
                        </Button>

                        {!isStep1 && (
                            <p className="text-xs text-muted-foreground text-center">
                                Outcome set to <strong>{outcomes[Number(selectedOutcomeIndex)]}</strong>. Click Finalize to close the market.
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
