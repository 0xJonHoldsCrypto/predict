'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users } from 'lucide-react';
import { MarketStatusLabel } from '@/components/market-status-label';

interface MarketCardProps {
    id: string;
    question: string;
    volume: string;
    endDate: string;
    endTimestamp?: number;
    yesPrice: number;
    noPrice: number;
    image?: string;
    isResolved?: boolean;
}

export function MarketCard({
    id,
    question,
    volume,
    endDate,
    endTimestamp,
    yesPrice,
    noPrice,
    image,
    isResolved = false,
    winningOutcome
}: MarketCardProps & { winningOutcome?: string }) {
    const yesPercent = Math.round(yesPrice * 100);
    const noPercent = Math.round(noPrice * 100);

    return (
        <Link href={`/markets/${id}`}>
            <Card className="overflow-hidden hover:border-foreground/50 transition-colors h-full flex flex-col group cursor-pointer bg-card/50 backdrop-blur-sm">
                <CardHeader className="p-4 pb-2 space-y-2">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex gap-2 items-center text-xs text-muted-foreground w-full">
                            {image && <img src={image} alt="icon" className="w-5 h-5 rounded-full" />}
                            <MarketStatusLabel endDate={endTimestamp || endDate} isResolved={isResolved} />
                        </div>
                        <div className="flex gap-1">
                            <div className="flex gap-1">
                                {isResolved && (
                                    <Badge variant={winningOutcome === 'YES' ? "default" : "destructive"} className="text-[10px] h-5">
                                        Resolved: {winningOutcome}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <CardTitle className="text-base font-medium leading-snug group-hover:underline decoration-1 underline-offset-4">
                        {question}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2 flex-grow">
                    <div className="flex gap-2 mt-2">
                        <div className="flex-1 relative h-10 bg-green-500/10 rounded-md overflow-hidden flex items-center justify-between px-3 border border-green-500/20 group-hover:bg-green-500/20 transition-colors">
                            <span className="text-green-500 font-bold text-sm">Yes</span>
                            <span className="text-green-500 font-bold text-sm">{yesPercent}%</span>
                        </div>
                        <div className="flex-1 relative h-10 bg-red-500/10 rounded-md overflow-hidden flex items-center justify-between px-3 border border-red-500/20 group-hover:bg-red-500/20 transition-colors">
                            <span className="text-red-500 font-bold text-sm">No</span>
                            <span className="text-red-500 font-bold text-sm">{noPercent}%</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 text-xs text-muted-foreground flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <span className="font-semibold text-foreground">${volume}</span> Vol.
                    </div>
                    {/* Placeholder for chart sparkline if added later */}
                </CardFooter>
            </Card>
        </Link>
    );
}
