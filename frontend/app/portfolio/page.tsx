'use client';

import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAccount, usePublicClient, useReadContract, useWriteContract } from 'wagmi';
import { useEffect, useState } from 'react';
import deployment from '@/contracts/deployment.json';
import { ABIS } from '@/contracts/abis';
import { formatUnits, parseAbiItem, Log } from 'viem';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type MarketData = {
    id: string;
    question: string;
    outcomes: string[];
    winningOutcome?: number;
    status: number;
    userBalances: bigint[];
};

export default function PortfolioPage() {
    const { address, isConnected } = useAccount();
    const publicClient = usePublicClient();
    const router = useRouter();

    const [markets, setMarkets] = useState<MarketData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Cash Balance
    const { data: cashBalance } = useReadContract({
        address: deployment.mockToken as `0x${string}`,
        abi: ABIS.IERC20,
        functionName: 'balanceOf',
        args: [address],
        query: { enabled: !!address },
    });

    useEffect(() => {
        if (!publicClient || !address) return;

        const fetchPortfolio = async () => {
            setIsLoading(true);
            try {
                // 1. Get all created markets
                const logs = await publicClient.getLogs({
                    address: deployment.marketCore as `0x${string}`,
                    event: parseAbiItem('event MarketCreated(bytes32 indexed marketId, address indexed collateralToken, address indexed oracle, bytes32 questionId, uint64 marketDeadline, uint8 numOutcomes, string metadataURI, address creator)'),
                    fromBlock: 'earliest', // For production, optimize this
                });

                const positions: MarketData[] = [];

                // 2. Iterate and check balances
                await Promise.all(logs.map(async (log) => {
                    const { marketId, numOutcomes, metadataURI } = log.args;
                    if (!marketId || !numOutcomes) return;

                    // Decode Metadata
                    let question = "Unknown Market";
                    let outcomeLabels: string[] = [];
                    try {
                        if (metadataURI && metadataURI.startsWith('data:application/json;base64,')) {
                            const json = atob(metadataURI.split(',')[1]);
                            const data = JSON.parse(json);
                            question = data.question;
                            outcomeLabels = data.outcomes || [];
                        }
                    } catch (e) {
                        console.error("Failed to parse metadata", e);
                    }

                    // Get Market Status
                    const statusData = await publicClient.readContract({
                        address: deployment.simpleRouter as `0x${string}`,
                        abi: ABIS.SimpleRouter,
                        functionName: 'getMarketStatus',
                        args: [marketId],
                    }) as [number, number, boolean];
                    const [status, winningOutcomeIndex, isInvalid] = statusData;

                    // Check Balances for each outcome
                    const balances: bigint[] = [];
                    let hasPosition = false;

                    for (let i = 0; i < numOutcomes; i++) {
                        const marketIdBigInt = BigInt(marketId);
                        const tokenId = (marketIdBigInt << BigInt(8)) | BigInt(i);

                        const balance = await publicClient.readContract({
                            address: deployment.outcomeToken1155 as `0x${string}`,
                            abi: ABIS.OutcomeToken1155,
                            functionName: 'balanceOf',
                            args: [address, tokenId],
                        }) as bigint;

                        balances.push(balance);
                        if (balance > BigInt(0)) hasPosition = true;
                    }

                    if (hasPosition) {
                        positions.push({
                            id: marketId,
                            question,
                            outcomes: outcomeLabels,
                            winningOutcome: status === 2 ? winningOutcomeIndex : undefined,
                            status,
                            userBalances: balances
                        });
                    }
                }));

                setMarkets(positions);
            } catch (err) {
                console.error("Error fetching portfolio:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPortfolio();
    }, [publicClient, address]);

    const cashRef = cashBalance ? parseFloat(formatUnits(cashBalance as bigint, 18)) : 0;
    const totalPositions = markets.length;

    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <div className="flex-1 container max-w-screen-xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Portfolio</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Cash Balance</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">${cashRef.toFixed(2)}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Positions</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{totalPositions}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Status</CardTitle></CardHeader>
                        <CardContent><div className="text-sm text-muted-foreground pt-1">P/L Tracking Coming Soon</div></CardContent>
                    </Card>
                </div>

                <h2 className="text-xl font-semibold mb-4">Your Positions</h2>
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 text-left">Market</th>
                                    <th className="px-4 py-3 text-left">Outcome</th>
                                    <th className="px-4 py-3 text-right">Shares</th>
                                    <th className="px-4 py-3 text-right">Status</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y relative">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Loading positions...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : markets.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                                            No active positions found.
                                        </td>
                                    </tr>
                                ) : (
                                    markets.flatMap((market) =>
                                        market.userBalances.map((balance, index) => {
                                            if (balance === BigInt(0)) return null;

                                            const label = market.outcomes[index] || `Outcome ${index}`;
                                            const isWinning = market.status === 2 && market.winningOutcome === index;
                                            const isLosing = market.status === 2 && market.winningOutcome !== index;

                                            return (
                                                <tr key={`${market.id}-${index}`} className="hover:bg-muted/20">
                                                    <td className="px-4 py-3 font-medium max-w-xs truncate cursor-pointer hover:underline" onClick={() => router.push(`/market/${market.id}`)}>
                                                        {market.question}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant="outline" className={
                                                            index === 1 ? "text-green-500 border-green-500/30 bg-green-500/10" : "text-blue-500 border-blue-500/30 bg-blue-500/10"
                                                        }>
                                                            {label}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-mono">
                                                        {formatUnits(balance, 18)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {market.status === 0 && <span className="text-blue-500">Open</span>}
                                                        {market.status === 1 && <span className="text-yellow-500">Resolvable</span>}
                                                        {market.status === 2 && isWinning && <span className="text-green-500 font-bold">WON</span>}
                                                        {market.status === 2 && isLosing && <span className="text-muted-foreground">LOST</span>}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button
                                                            variant={market.status === 2 && isWinning ? "default" : "ghost"}
                                                            size="sm"
                                                            className={market.status === 2 && isWinning ? "bg-green-600 hover:bg-green-700 font-bold" : ""}
                                                            onClick={() => router.push(`/market/${market.id}`)}
                                                        >
                                                            {market.status === 2 && isWinning ? "Redeem" : "View"}
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </main>
    );
}
