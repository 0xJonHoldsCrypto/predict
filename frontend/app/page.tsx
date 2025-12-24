'use client';

import { Navbar } from '@/components/navbar';
import { MarketCard } from '@/components/market-card';
import { useMarkets, Market } from '@/hooks/use-markets';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import deployment from '@/contracts/deployment.json';

export default function Home() {
  const { markets, isLoading } = useMarkets();

  // Helper to split Active vs Ended
  const splitMarkets = (list: Market[]) => {
    const now = Math.floor(Date.now() / 1000);
    const active = list.filter(m => !m.isResolved && (!m.endTimestamp || m.endTimestamp > now));
    const ended = list.filter(m => m.isResolved || (m.endTimestamp && m.endTimestamp <= now) || m.endDate === "Unknown");
    return { active, ended };
  };

  // 1. Split by Category (Crypto vs Other)
  const cryptoMarkets = markets.filter(m => m.oracle && deployment.oracleAdapter && m.oracle.toLowerCase() === deployment.oracleAdapter.toLowerCase());
  const otherMarkets = markets.filter(m => !m.oracle || !deployment.oracleAdapter || m.oracle.toLowerCase() !== deployment.oracleAdapter.toLowerCase());

  const cryptoSplit = splitMarkets(cryptoMarkets);
  const otherSplit = splitMarkets(otherMarkets);

  const MarketGrid = ({ list }: { list: Market[] }) => (
    list.length === 0 ? (
      <div className="text-center py-20 text-muted-foreground border rounded-lg bg-card/50">
        No markets found in this category.
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {list.map((market) => (
          <MarketCard key={market.id} {...market} />
        ))}
      </div>
    )
  );

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <div className="flex-1 container max-w-screen-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Trending Markets</h1>
          <span className="text-sm text-muted-foreground">{markets.length} Markets Total</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="crypto" className="w-full">
            <TabsList className="mb-6 w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger value="crypto" className="px-6 py-2 rounded-t-lg data-[state=active]:bg-background data-[state=active]:border-x data-[state=active]:border-t data-[state=active]:shadow-none border border-transparent">
                Crypto Markets
                <span className="ml-2 bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs">{cryptoMarkets.length}</span>
              </TabsTrigger>
              <TabsTrigger value="other" className="px-6 py-2 rounded-t-lg data-[state=active]:bg-background data-[state=active]:border-x data-[state=active]:border-t data-[state=active]:shadow-none border border-transparent">
                Other / Custom
                <span className="ml-2 bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs">{otherMarkets.length}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="crypto" className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">🔥 Active Markets <span className="text-sm font-normal text-muted-foreground">({cryptoSplit.active.length})</span></h2>
                <MarketGrid list={cryptoSplit.active} />
              </section>

              {cryptoSplit.ended.length > 0 && (
                <section className="pt-8 border-t">
                  <h2 className="text-xl font-semibold mb-4 text-muted-foreground flex items-center gap-2">🏁 Ended Markets <span className="text-sm font-normal">({cryptoSplit.ended.length})</span></h2>
                  <div className="opacity-75 grayscale-[0.5] hover:grayscale-0 transition-all duration-300">
                    <MarketGrid list={cryptoSplit.ended} />
                  </div>
                </section>
              )}
            </TabsContent>

            <TabsContent value="other" className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">🔥 Active Custom Markets <span className="text-sm font-normal text-muted-foreground">({otherSplit.active.length})</span></h2>
                <MarketGrid list={otherSplit.active} />
              </section>

              {otherSplit.ended.length > 0 && (
                <section className="pt-8 border-t">
                  <h2 className="text-xl font-semibold mb-4 text-muted-foreground flex items-center gap-2">🏁 Ended Custom Markets <span className="text-sm font-normal">({otherSplit.ended.length})</span></h2>
                  <div className="opacity-75 grayscale-[0.5] hover:grayscale-0 transition-all duration-300">
                    <MarketGrid list={otherSplit.ended} />
                  </div>
                </section>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Built on Hemi Network
      </footer>
    </main>
  );
}
