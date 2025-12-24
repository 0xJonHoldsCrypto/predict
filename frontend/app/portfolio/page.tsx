
'use client';

import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePortfolio } from '@/hooks/use-portfolio';
import { Loader2, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PortfolioPage() {
    const { address } = useAccount();
    const { positions, isLoading } = usePortfolio();

    const activePositions = positions.filter(p => !p.market.isResolved);
    const endedPositions = positions.filter(p => p.market.isResolved);

    const renderPositionCard = (pos: any) => (
        <Card key={pos.marketId} className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
                <Link href={`/markets/${pos.marketId}`} className="hover:underline flex justify-between items-start">
                    <CardTitle className="text-lg">{pos.marketQuestion}</CardTitle>
                    {pos.market.isResolved && (
                        <span className={`text-xs font-bold px-2 py-1 rounded ${pos.market.winningOutcome === 'YES' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                            Resolved: {pos.market.winningOutcome}
                        </span>
                    )}
                </Link>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {Number(pos.lpShares) > 0 && (
                        <div className="bg-blue-500/10 p-3 rounded-md border border-blue-500/20">
                            <span className="text-muted-foreground block text-xs mb-1">Liquidity Provided</span>
                            <span className="font-mono font-bold text-blue-500">{Number(pos.lpShares).toFixed(4)} Shares</span>
                        </div>
                    )}
                    {Number(pos.outcomeBalances[1]) > 0 && (
                        <div className="bg-green-500/10 p-3 rounded-md border border-green-500/20">
                            <span className="text-muted-foreground block text-xs mb-1">YES Position</span>
                            <span className="font-mono font-bold text-green-500">{Number(pos.outcomeBalances[1]).toFixed(4)} Tokens</span>
                        </div>
                    )}
                    {Number(pos.outcomeBalances[0]) > 0 && (
                        <div className="bg-red-500/10 p-3 rounded-md border border-red-500/20">
                            <span className="text-muted-foreground block text-xs mb-1">NO Position</span>
                            <span className="font-mono font-bold text-red-500">{Number(pos.outcomeBalances[0]).toFixed(4)} Tokens</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <div className="flex-1 container max-w-screen-xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <Wallet className="h-8 w-8 text-primary" />
                    My Portfolio
                </h1>

                {!address ? (
                    <div className="text-center py-20 bg-card rounded-lg border">
                        <p className="text-muted-foreground">Please connect your wallet to view your portfolio.</p>
                    </div>
                ) : isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : positions.length === 0 ? (
                    <div className="text-center py-20 bg-card rounded-lg border">
                        <h3 className="text-lg font-medium mb-2">No active positions</h3>
                        <p className="text-muted-foreground mb-4">You haven't traded or provided liquidity in any markets yet.</p>
                        <Link href="/" className="text-primary hover:underline">Explore Markets</Link>
                    </div>
                ) : (
                    <Tabs defaultValue="active" className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="active">Active Markets ({activePositions.length})</TabsTrigger>
                            <TabsTrigger value="ended">Ended/Resolved ({endedPositions.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="active" className="space-y-4">
                            {activePositions.length === 0 ? (
                                <p className="text-muted-foreground text-center py-10">No active positions.</p>
                            ) : (
                                activePositions.map(renderPositionCard)
                            )}
                        </TabsContent>

                        <TabsContent value="ended" className="space-y-4">
                            {endedPositions.length === 0 ? (
                                <p className="text-muted-foreground text-center py-10">No ended positions.</p>
                            ) : (
                                endedPositions.map(renderPositionCard)
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </main>
    );
}
