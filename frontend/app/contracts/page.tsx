'use client';

import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import deployment from '@/contracts/deployment.json';
import { ExternalLink, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ContractsPage() {

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Address copied to clipboard.");
    };

    const explorerUrl = "https://testnet.explorer.hemi.xyz/address";

    const contracts = [
        { name: "MarketCore", address: deployment.marketCore, desc: "Main protocol entry point. Holds collateral." },
        { name: "FpmmAMM", address: deployment.fpmmAMM, desc: "Automated Market Maker logic." },
        { name: "OutcomeToken1155", address: deployment.outcomeToken1155, desc: "ERC-1155 token contract for all outcomes." },
        { name: "SimpleRouter", address: deployment.simpleRouter, desc: "Helper for easy trading and redeeming." },
        { name: "OracleAdapter", address: deployment.oracleAdapter, desc: "Uniswap V3 TWAP Oracle Adapter." },
        { name: "MockOracle", address: deployment.mockOracle, desc: "Testnet oracle for manual resolution." },
        { name: "MockToken (USDC)", address: deployment.mockToken, desc: "Testnet collateral token." },
    ];

    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <div className="flex-1 container max-w-screen-xl mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto space-y-8">

                    <div className="space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight">Contract Addresses</h1>
                        <p className="text-lg text-muted-foreground">
                            Official deployment addresses on the Hemi Network.
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Core Protocol</CardTitle>
                            <CardDescription>
                                Verified smart contracts powering the protocol.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {contracts.map((c) => (
                                <div key={c.address} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg bg-card/50 gap-4">
                                    <div className="space-y-1">
                                        <div className="font-semibold flex items-center gap-2">
                                            {c.name}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{c.desc}</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-muted p-2 rounded-md font-mono text-xs md:text-sm break-all">
                                        <span className="truncate max-w-[200px] md:max-w-none">{c.address}</span>
                                        <div className="flex gap-1 shrink-0">
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(c.address)}>
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                            <a href={`${explorerUrl}/${c.address}`} target="_blank" rel="noopener noreferrer">
                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                    <ExternalLink className="h-3 w-3" />
                                                </Button>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-sm text-blue-500 text-center">
                        <p>
                            Verify these addresses against the official Hemi documentation or GitHub repository before interacting directly.
                        </p>
                    </div>

                </div>
            </div>
        </main>
    );
}
