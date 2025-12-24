'use client';

import { useCountdown } from '@/hooks/use-countdown';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MarketStatusLabelProps {
    endDate: Date | string | number;
    isResolved: boolean;
    className?: string;
}

export function MarketStatusLabel({ endDate, isResolved, className = "" }: MarketStatusLabelProps) {
    // Handle invalid/legacy markets (e.g. from old deployments)
    if (endDate === "Unknown" || (typeof endDate === 'number' && endDate === 0)) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <span className="text-red-500 font-bold text-xs uppercase tracking-wider border border-red-500/50 px-1 rounded">Invalid / Legacy</span>
            </div>
        );
    }

    // If endDate is a number/timestamp, use it directly. If it's a string, useCountdown handles it but prefer timestamp.
    const timeLeft = useCountdown(endDate);

    if (timeLeft.isExpired) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <span className="text-muted-foreground font-medium">Ended</span>
                <span className="text-muted-foreground">•</span>
                {isResolved ? (
                    <span className="text-green-500 font-bold text-xs uppercase tracking-wider">Resolved</span>
                ) : (
                    <span className="text-red-500 font-bold text-xs uppercase tracking-wider">Awaiting Resolution</span>
                )}
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            <span className="text-muted-foreground text-xs">Ends</span>
            <div className="flex items-center gap-1 font-mono text-xs">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className={timeLeft.days <= 1 ? "text-orange-500 font-medium" : "text-muted-foreground"}>
                    {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
                    {timeLeft.hours}h {timeLeft.minutes}m
                </span>
            </div>
        </div>
    );
}
