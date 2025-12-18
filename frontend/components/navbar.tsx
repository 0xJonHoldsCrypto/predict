import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CreateMarketDialog } from '@/components/create-market-dialog';
import { FaucetButton } from '@/components/faucet-button';

export function Navbar() {
    return (
        <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-xl mx-auto items-center justify-between px-4">
                <div className="flex items-center gap-6">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="font-bold text-xl inline-block bg-gradient-to-r from-orange-500 to-red-600 text-transparent bg-clip-text">
                            HemiPredict
                        </span>
                    </Link>
                    <nav className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                        <Link
                            href="/"
                            className="transition-colors hover:text-foreground/80 text-foreground"
                        >
                            Markets
                        </Link>
                        <Link
                            href="/portfolio"
                            className="transition-colors hover:text-foreground/80"
                        >
                            Portfolio
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-2">
                    <FaucetButton />
                    <CreateMarketDialog />
                    <ConnectButton
                        accountStatus="address"
                        chainStatus="icon"
                        showBalance={false}
                    />
                </div>
            </div>
        </nav>
    );
}
