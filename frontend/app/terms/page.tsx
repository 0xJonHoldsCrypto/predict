'use client';

import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <div className="flex-1 container max-w-screen-xl mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto space-y-8">

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
                        <p className="text-muted-foreground">Last Updated: December 2025</p>
                    </div>

                    <Card className="border-muted">
                        <CardHeader className="bg-muted/30 border-b border-border/40 pb-4">
                            <CardTitle className="text-lg font-medium">Agreement to Terms</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 prose prose-sm dark:prose-invert max-w-none space-y-6">
                            <section>
                                <h3 className="text-base font-semibold text-foreground mb-2">1. Nature of Platform</h3>
                                <p>
                                    Hemi Prediction Markets ("the Platform") is a decentralized interface providing access to smart contracts on the Hemi Network.
                                    The Platform is experimental software built for educational and hackathon purposes. It is experimental in nature and currently
                                    operates in a testnet environment.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-base font-semibold text-foreground mb-2">2. No Financial Advice</h3>
                                <p>
                                    The content provided on this Platform is for informational purposes only. Nothing on this website constitutes financial,
                                    legal, or investment advice. You act responsibly and independently in your interactions with the blockchain.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-base font-semibold text-foreground mb-2">3. User Responsibilities</h3>
                                <p>
                                    You acknowledge and agree that:
                                </p>
                                <ul className="list-disc pl-5 space-y-1 mt-2">
                                    <li>You are responsible for the security of your private keys and wallet access.</li>
                                    <li>Transactions on the blockchain are irreversible.</li>
                                    <li>You are operating in compliance with all applicable laws in your jurisdiction.</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-base font-semibold text-foreground mb-2">4. Disclaimer of Warranty</h3>
                                <p className="uppercase">
                                    THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.
                                    WE DISCLAIM ALL WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-base font-semibold text-foreground mb-2">5. Limitation of Liability</h3>
                                <p>
                                    In no event shall the developers, contributors, or affiliated parties be liable for any claim, damages, or other liability,
                                    whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software
                                    or the use or other dealings in the software.
                                </p>
                            </section>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </main>
    );
}
