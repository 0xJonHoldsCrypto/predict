'use client';

import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function DocumentationPage() {
    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <div className="flex-1 container max-w-screen-xl mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto space-y-12">

                    <div className="space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight">Documentation</h1>
                        <p className="text-lg text-muted-foreground">
                            Guides and tutorials for using Hemi Prediction Markets.
                        </p>
                    </div>

                    <div className="space-y-8">

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>How do I connect my wallet?</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        Click the "Connect Wallet" button in the top right corner. We support MetaMask, Coinbase Wallet, and other injected Web3 wallets via the Hemi Network.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>How do I get testnet funds?</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        Use the "Faucet" button in the top navigation to mint free Mock USDC tokens for testing. You will need a small amount of ETH on Hemi for gas fees.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">Trading</h2>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Buying & Selling</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm text-muted-foreground">
                                    <p>
                                        <strong>Buying:</strong> Select an outcome (YES or NO) and enter the amount of USDC you want to invest.
                                        The UI will show you the potential return. Confirm the transaction to receive Outcome Tokens.
                                    </p>
                                    <p>
                                        <strong>Selling:</strong> If you currently hold positions, you can sell them back to the market at any time
                                        before the market closes.
                                    </p>
                                    <p>
                                        <strong>Redeeming:</strong> If you hold shares of the winning outcome after resolution, you can redeem them
                                        for 1 USDC per share (minus fees).
                                    </p>
                                </CardContent>
                            </Card>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">Liquidity Provision</h2>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Being a Liquidity Provider (LP)</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm text-muted-foreground">
                                    <p>
                                        You can earn fees by providing liquidity to markets. By depositing USDC, you mint LP shares that
                                        represent your ownership of the market's liquidity pool.
                                    </p>
                                    <p>
                                        <strong>Risks:</strong> Unlike standard AMMs, LPs in prediction markets take on directional risk.
                                        If the market moves significantly against the initial probability, LPs may suffer "impermanent loss"
                                        that becomes permanent if not reversed. Only provide liquidity if you believe the current price reflects
                                        the true probability.
                                    </p>
                                </CardContent>
                            </Card>
                        </section>

                    </div>

                </div>
            </div>
        </main>
    );
}
