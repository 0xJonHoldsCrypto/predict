'use client';

import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, ShieldAlert, Activity } from 'lucide-react';

export default function RisksPage() {
    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <div className="flex-1 container max-w-screen-xl mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto space-y-8">

                    <div className="space-y-4 text-center mb-12">
                        <h1 className="text-4xl font-bold tracking-tight">Risk Disclosures</h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Decentralized finance involves significant risks. Please understand the mechanics and failures modes before interacting.
                        </p>
                    </div>

                    <div className="grid gap-6">

                        <Card className="border-orange-500/20 bg-orange-500/5">
                            <CardHeader>
                                <div className="flex items-center gap-3 text-orange-600 mb-2">
                                    <ShieldAlert className="h-6 w-6" />
                                    <CardTitle>Smart Contract Risk</CardTitle>
                                </div>
                                <CardDescription className="text-orange-900/70 dark:text-orange-100/70">
                                    The protocol runs on immutable smart contracts that have not been audited.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm leading-relaxed">
                                <p>
                                    While the codebase has been tested, there is always a risk of undiscovered bugs or vulnerabilities.
                                    Exploits could lead to the irreversible loss of funds deposited in the market contracts.
                                    The protocol has no admin keys and no pause functionality, meaning no one can intervene to stop a hack once it begins.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-blue-500/20 bg-blue-500/5">
                            <CardHeader>
                                <div className="flex items-center gap-3 text-blue-600 mb-2">
                                    <Activity className="h-6 w-6" />
                                    <CardTitle>Oracle & Resolution Risk</CardTitle>
                                </div>
                                <CardDescription className="text-blue-900/70 dark:text-blue-100/70">
                                    Market outcomes depend on external data sources.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm leading-relaxed space-y-2">
                                <p>
                                    <strong>TWAP Oracles:</strong> We use Uniswap V3 Time-Weighted Average Prices. While robust, they can be manipulated if
                                    an attacker is willing to spend significant capital to move the pool price for the duration of the window.
                                </p>
                                <p>
                                    <strong>Mock Oracles:</strong> Some markets on testnet are resolved by a centralized "Mock Oracle". These trust the deployer
                                    to report the correct result.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-red-500/20 bg-red-500/5">
                            <CardHeader>
                                <div className="flex items-center gap-3 text-red-600 mb-2">
                                    <AlertTriangle className="h-6 w-6" />
                                    <CardTitle>Financial & Liquidity Risk</CardTitle>
                                </div>
                                <CardDescription className="text-red-900/70 dark:text-red-100/70">
                                    Capital loss is possible even without technical failures.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm leading-relaxed space-y-2">
                                <p>
                                    <strong>Traders:</strong> You can lose 100% of your investment if your prediction is incorrect.
                                </p>
                                <p>
                                    <strong>Liquidity Providers:</strong> LPs are subject to "Impermanent Loss" and "Adverse Selection".
                                    If the market probability moves significantly from when you deposited, or if specific traders have better information than the market,
                                    your LP tokens may be worth less than the assets you deposited.
                                </p>
                            </CardContent>
                        </Card>

                    </div>

                </div>
            </div>
        </main>
    );
}
