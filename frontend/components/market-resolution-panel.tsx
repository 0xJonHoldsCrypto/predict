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

    // Check if user is admin (deployer)
    const { address: userAddress } = useAccount();
    const isAdmin = !!(userAddress && deployment.deployer && userAddress.toLowerCase() === deployment.deployer.toLowerCase());

    const handleResolve = () => {
        if (!selectedOutcomeIndex) return;
        writeContract({
            address: deployment.mockOracle as `0x${string}`,
            abi: ABIS.MockOracle,
            functionName: 'setOutcome',
            args: [questionId, BigInt(selectedOutcomeIndex)],
        });
    };

    const handleFinalize = () => {
        writeContract({
            address: deployment.marketCore as `0x${string}`,
            abi: ABIS.MarketCore,
            functionName: 'requestResolution',
            args: [marketId],
        });
    }

    // Only show if:
    // 1. Is Mock Oracle AND User is Admin
    // 2. Is TWAP Oracle (anyone can see, but buttons disabled if too early)
    if (isMockOracle && !isAdmin) return null;
    if (!isMockOracle && !isTwapOracle) return null;

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
                            <span className="text-muted-foreground">Status:</span>
                            {resolutionReady ? (
                                <span className="text-green-500 font-bold animate-pulse">Ready to Finalize</span>
                            ) : (
                                <span className="text-yellow-500">
                                    Opens in {timeRemaining > 0 ? new Date(Number(timeRemaining) * 1000).toISOString().substr(11, 8) : "00:00:00"}
                                </span>
                            )}
                        </div>
                        {isTwapOracle && (
                            <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                                * To resolve this market, wait for the timer to end, then click "Finalize". This submits a transaction to the blockchain.
                            </p>
                        )}
                    </div>
                )}

                {isMockOracle && isAdmin && (
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
                )}

                <div className="flex gap-2">
                    {isMockOracle && isAdmin && (
                        <Button
                            onClick={handleResolve}
                            disabled={!selectedOutcomeIndex || isPending || isConfirming}
                            className="flex-1 bg-orange-600 hover:bg-orange-700"
                        >
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            1. Set Outcome
                        </Button>
                    )}
                    <Button
                        onClick={handleFinalize}
                        // For TWAP, disable if not ready. For Mock, allow always (admin flow)
                        disabled={isPending || isConfirming || (isTwapOracle && !resolutionReady)}
                        className={`flex-1 ${!isMockOracle ? "w-full" : ""}`}
                        variant={isMockOracle ? "outline" : "default"}
                    >
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isMockOracle ? "2. Finalize Market" : "Finalize Market Resolution"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
