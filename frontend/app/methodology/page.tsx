'use client';

import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MethodologyPage() {
    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <div className="flex-1 container max-w-screen-xl mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto space-y-12">

                    {/* Header */}
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">Methodology</h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Understanding the decentralized mechanics behind Hemi Prediction Markets.
                        </p>
                    </div>

                    {/* Main Content */}
                    <Tabs defaultValue="architecture" className="space-y-8">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="architecture">Architecture</TabsTrigger>
                            <TabsTrigger value="lmsr">LMSR & Pricing</TabsTrigger>
                            <TabsTrigger value="oracle">Oracle System</TabsTrigger>
                        </TabsList>

                        {/* Architecture Tab */}
                        <TabsContent value="architecture" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>System Architecture</CardTitle>
                                    <CardDescription>
                                        How the protocol components interact to ensure trustless execution.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                                    <p>
                                        Unlike traditional order-book prediction markets (like Polymarket or Kalshi), this protocol uses an
                                        <strong> Automated Market Maker (AMM)</strong>. There is no matching engine; instead, traders buy
                                        and sell directly against a smart contract that guarantees liquidity at algorithmically determined prices.
                                    </p>
                                    <h3>Core Components</h3>
                                    <ul>
                                        <li><strong>MarketCore</strong>: The central registry that holds all collateral (USDC) and manages the lifecycle of every market.</li>
                                        <li><strong>FpmmAMM</strong>: The automated market maker that prices trades using the LMSR math. It mints and burns outcome tokens.</li>
                                        <li><strong>Outcome Tokens</strong>: ERC-1155 tokens representing shares in a specific outcome (e.g., "YES").</li>
                                    </ul>
                                    <div className="bg-muted p-4 rounded-lg my-4 font-mono text-xs">
                                        BUY:  User (USDC) → MarketCore → AMM Mints Tokens → User<br />
                                        SELL: User (Tokens) → AMM Burns Tokens → MarketCore Releases USDC → User
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* LMSR Tab */}
                        <TabsContent value="lmsr" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Logarithmic Market Scoring Rule (LMSR)</CardTitle>
                                    <CardDescription>
                                        The mathematical engine that powers price discovery.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                                    <p>
                                        We use Hanson's Logarithmic Market Scoring Rule (LMSR) to provide continuous liquidity.
                                        The prices of outcomes are determined by the ratio of outcome tokens currently in circulation.
                                    </p>
                                    <h3>Cost Function</h3>
                                    <p>The cost required to move the market to a new state is calculated as:</p>
                                    <pre className="not-prose bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                                        C(q) = b * ln(Σ exp(q_i / b))
                                    </pre>
                                    <ul className="mt-4">
                                        <li><code>q</code>: Vector of net outcome tokens sold.</li>
                                        <li><code>b</code>: Liquidity parameter. Higher <code>b</code> means deeper liquidity and less slippage.</li>
                                    </ul>
                                    <h3>Pricing</h3>
                                    <p>
                                        The instantaneous price of an outcome is the probability that the AMM assigns to it, based on current inventory:
                                    </p>
                                    <pre className="not-prose bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                                        Price_i = exp(q_i / b) / Σ exp(q_j / b)
                                    </pre>
                                    <p>
                                        This ensures that the sum of prices for all outcomes always equals 1.0 (100%).
                                    </p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Oracle Tab */}
                        <TabsContent value="oracle" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Oracle & Resolution</CardTitle>
                                    <CardDescription>
                                        How markets are resolved using on-chain data.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                                    <p>
                                        The protocol uses a pluggable oracle system. The primary oracle for crypto-asset markets is the
                                        <strong> Uniswap V3 TWAP Adapter</strong>.
                                    </p>
                                    <h3>Why TWAP?</h3>
                                    <p>
                                        Time-Weighted Average Price (TWAP) makes it expensive for attackers to manipulate the market settlement.
                                        To change the settlement price, an attacker would need to manipulate the Uniswap pool price for the entire
                                        duration of the TWAP window (e.g., 30 minutes).
                                    </p>
                                    <h3>Resolution Process</h3>
                                    <ol>
                                        <li><strong>Trading Phase</strong>: Users trade based on their prediction of the future TWAP.</li>
                                        <li><strong>Deadline</strong>: Trading stops.</li>
                                        <li><strong>Evaluation Window</strong>: The oracle waits for the TWAP window to elapse after the evaluation time.</li>
                                        <li><strong>Finalization</strong>: Anyone can call <code>finalize</code> to trigger the on-chain calculation and settle the market.</li>
                                    </ol>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="text-center pt-8">
                        <p className="text-sm text-muted-foreground">
                            For more details, view the Source Code on <a href="#" className="underline hover:text-primary">GitHub</a>.
                        </p>
                    </div>

                </div>
            </div>
        </main>
    );
}
