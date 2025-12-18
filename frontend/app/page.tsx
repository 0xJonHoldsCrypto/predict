'use client';

import { Navbar } from '@/components/navbar';
import { MarketCard } from '@/components/market-card';
import { useMarkets } from '@/hooks/use-markets';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { markets, isLoading } = useMarkets();

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <div className="flex-1 container max-w-screen-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Trending Markets</h1>
          <span className="text-sm text-muted-foreground">{markets.length} Markets Active</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {markets.length === 0 ? (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                No markets found. Create one to get started!
              </div>
            ) : (
              markets.map((market) => (
                <MarketCard key={market.id} {...market} />
              ))
            )}
          </div>
        )}
      </div>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Built on Hemi Network
      </footer>
    </main>
  );
}
