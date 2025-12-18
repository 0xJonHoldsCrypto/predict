import Link from 'next/link';
import { Twitter, Github, Disc, BookOpen } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-12 mt-20">
            <div className="container max-w-screen-xl mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    {/* Column 1: Brand */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold tracking-tight">Hemi Predict</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            A decentralized, permissionless prediction market protocol built on the Hemi Network.
                        </p>
                        <div className="flex gap-4">
                            <Link href="https://twitter.com" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Twitter className="h-5 w-5" />
                                <span className="sr-only">Twitter</span>
                            </Link>
                            <Link href="https://github.com" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Github className="h-5 w-5" />
                                <span className="sr-only">GitHub</span>
                            </Link>
                            <Link href="https://discord.com" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Disc className="h-5 w-5" />
                                <span className="sr-only">Discord</span>
                            </Link>
                        </div>
                    </div>

                    {/* Column 2: Platform */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">Platform</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li>
                                <Link href="/" className="hover:text-primary transition-colors">Markets</Link>
                            </li>
                            <li>
                                <Link href="/portfolio" className="hover:text-primary transition-colors">Portfolio</Link>
                            </li>
                            <li>
                                <Link href="/methodology" className="hover:text-primary transition-colors">Methodology</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Resources */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">Resources</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li>
                                <Link href="/documentation" className="hover:text-primary transition-colors">Documentation</Link>
                            </li>
                            <li>
                                <Link href="https://hemi.xyz" target="_blank" className="hover:text-primary transition-colors">Hemi Network</Link>
                            </li>
                            <li>
                                <Link href="/contracts" className="hover:text-primary transition-colors">Contract Addresses</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Legal */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">Legal</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li>
                                <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                            </li>
                            <li>
                                <Link href="/risks" className="hover:text-primary transition-colors">Risks</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border/40 pt-8 space-y-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        **Disclaimer**: This platform is experimental software built for educational and hackathon purposes. It runs on the Hemi Network.
                        Prediction markets involve significant risk, including the potential loss of all funds. The protocol is decentralized and permissionless;
                        no entity controls the markets or the outcome resolution. Use at your own risk.
                    </p>
                    <div className="flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground gap-4">
                        <p>© 2025 Digital Block. All rights reserved.</p>
                        <div className="flex gap-4">
                            <span>v1.0.0-beta</span>
                            <span>•</span>
                            <span>Hemi Mainnet</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
