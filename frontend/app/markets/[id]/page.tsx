'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { TradePanel } from '@/components/trade-panel';
import { MarketResolutionPanel } from '@/components/market-resolution-panel';
import { MarketChart } from '@/components/market-chart';
import { Badge } from '@/components/ui/badge';
import { useMarkets } from '@/hooks/use-markets';
import { RecentTrades } from '@/components/recent-trades';
import { useAccount, useReadContract } from 'wagmi';
import { ABIS } from '@/contracts/abis';
import { formatUnits } from 'viem';
import { Wallet } from 'lucide-react';
import deployment from '@/contracts/deployment.json';

export default function MarketPage() {
    const params = useParams();
    const marketId = params.id as string;

    const [market, setMarket] = useState<any>(null);
    const { markets, isLoading } = useMarkets();

    useEffect(() => {
        if (markets.length > 0) {
            const found = markets.find(m => m.id === marketId);
            if (found) setMarket(found);
        }
    }, [markets, marketId]);

    if (isLoading || !market) {
        return (
            <main className="min-h-screen bg-background text-foreground flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <div className="flex-1 container max-w-screen-xl mx-auto px-4 py-8">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Chart and Info */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <span className="text-xl">Ξ</span>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold leading-tight">{market.question}</h1>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                        <span>Ends {market.endDate}</span>
                                        <span>•</span>
                                        <span>Vol: {market.volume}</span>
                                        <span>•</span>
                                        <Badge variant="outline" className="text-xs">Crypto</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {market.isResolved && (
                            <div className={`p-4 rounded-lg flex items-center gap-3 border ${market.winningOutcome === 'YES' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                <div className={`font-bold text-lg ${market.winningOutcome === 'YES' ? 'text-green-500' : 'text-red-500'}`}>
                                    Resolved: {market.winningOutcome}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Winning outcome is finalized.
                                    {market.winningOutcome === 'YES' && " Holders of YES can redeem."}
                                    {market.winningOutcome === 'NO' && " Holders of NO can redeem."}
                                </div>
                            </div>
                        )}

                        <MarketChart question={market.question} />

                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Rules</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {market.description}
                            </p>
                        </div>

                        {/* Recent Trades */}
                        <div className="space-y-2">
                            <RecentTrades marketId={market.id} outcomes={market.outcomes} />
                        </div>

                        {/* Resolution Panel (For Admins/Mock Oracle) */}
                        <MarketResolutionPanel
                            marketId={market.id}
                            questionId={market.questionId}
                            outcomes={market.outcomes}
                            oracleAddress={market.oracle}
                        />
                    </div>

                    {/* Right Column: Trading Interface */}
                    <div className="lg:col-span-4 space-y-6">
                        <TradePanel marketId={market.id} yesPrice={market.yesPrice} noPrice={market.noPrice} />

                        <div className="border rounded-lg p-4 bg-card/30">
                            <h4 className="font-medium mb-3 text-sm">Market Stats</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Liquidity</span>
                                    <span>{market.liquidity} tokens</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Volume</span>
                                    <span>{market.volume}</span>
                                </div>
                            </div>
                        </div>

                        {/* User Position */}
                        <UserPosition marketId={market.id} />
                    </div>
                </div>

            </div>
        </main>
    );
}

function UserPosition({ marketId }: { marketId: string }) {
    const { address } = useAccount();
    // Fetch user balances
    // This is a quick inline fetch, ideally could be a hook
    const { data: lpShares } = useReadContract({
        address: deployment.simpleRouter as `0x${string}`,
        abi: ABIS.SimpleRouter,
        functionName: 'getUserLpShares',
        args: [marketId, address!],
        query: { enabled: !!address }
    });

    const { data: outcomeBalances } = useReadContract({
        address: deployment.simpleRouter as `0x${string}`,
        abi: ABIS.SimpleRouter,
        functionName: 'getUserAllOutcomeBalances',
        args: [marketId, address!],
        query: { enabled: !!address }
    });

    if (!address) return null;

    const lp = lpShares ? Number(formatUnits(lpShares as bigint, 18)) : 0;
    const balances = outcomeBalances ? (outcomeBalances as bigint[]).map(b => Number(formatUnits(b, 18))) : [0, 0];
    const hasPosition = lp > 0 || balances.some(b => b > 0);

    if (!hasPosition) return null;

    return (
        <div className="border rounded-lg p-4 bg-primary/5">
            <h4 className="font-medium mb-3 text-sm flex items-center gap-2">
                <Wallet className="w-4 h-4" /> Your Position
            </h4>
            <div className="space-y-3 text-sm">
                {lp > 0 && (
                    <div className="flex justify-between p-2 bg-background/50 rounded border">
                        <span className="text-muted-foreground">Liquidity</span>
                        <span className="font-mono font-bold text-blue-500">{lp.toFixed(4)} Shares</span>
                    </div>
                )}
                {balances[1] > 0 && (
                    <div className="flex justify-between p-2 bg-background/50 rounded border border-green-500/20">
                        <span className="text-muted-foreground">YES Tokens</span>
                        <span className="font-mono font-bold text-green-500">{balances[1].toFixed(4)}</span>
                    </div>
                )}
                {balances[0] > 0 && (
                    <div className="flex justify-between p-2 bg-background/50 rounded border border-red-500/20">
                        <span className="text-muted-foreground">NO Tokens</span>
                        <span className="font-mono font-bold text-red-500">{balances[0].toFixed(4)}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
