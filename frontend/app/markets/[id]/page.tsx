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
                                    <span>{market.liquidity}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Volume</span>
                                    <span>{market.volume}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
