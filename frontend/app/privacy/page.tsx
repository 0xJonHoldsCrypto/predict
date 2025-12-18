'use client';

import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <div className="flex-1 container max-w-screen-xl mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto space-y-8">

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
                        <p className="text-muted-foreground">Last Updated: December 2025</p>
                    </div>

                    <Card className="border-muted">
                        <CardHeader className="bg-muted/30 border-b border-border/40 pb-4">
                            <CardTitle className="text-lg font-medium">Data & Privacy</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 prose prose-sm dark:prose-invert max-w-none space-y-6">
                            <section>
                                <h3 className="text-base font-semibold text-foreground mb-2">1. No Personal Data Collection</h3>
                                <p>
                                    Hemi Prediction Markets is a decentralized application (dApp). We do not create user accounts, nor do we collect,
                                    store, or process personal identifiable information (PII) such as your name, email address, or IP address.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-base font-semibold text-foreground mb-2">2. Public Blockchain Data</h3>
                                <p>
                                    When you interact with the protocol, your public wallet address and transaction data are broadcast to the Hemi Network.
                                    This data is immutable, transparent, and publicly accessible by anyone.
                                </p>
                                <p className="mt-2 text-muted-foreground italic">
                                    Please be aware that your on-chain activity can be linked to your identity if you have publicly associated your wallet address with your real-world identity elsewhere.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-base font-semibold text-foreground mb-2">3. Third-Party Infrastructure</h3>
                                <p>
                                    To provide this interface, we may rely on third-party infrastructure services (such as RPC nodes, IPFS gateways, or hosting providers).
                                    These providers may log metadata (like IP addresses) for operational and security purposes, but we do not have access to or control over this data.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-base font-semibold text-foreground mb-2">4. Local Storage</h3>
                                <p>
                                    We may use local storage on your device (cookies or localStorage) solely to persist your interface preferences
                                    (such as theme settings or recent transaction history). This data never leaves your device.
                                </p>
                            </section>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </main>
    );
}
