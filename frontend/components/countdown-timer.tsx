'use client';

import { Clock } from 'lucide-react';
import { useCountdown } from '@/hooks/use-countdown';

interface CountdownTimerProps {
    targetDate: Date | string | number;
    className?: string;
    showIcon?: boolean;
}

export function CountdownTimer({ targetDate, className = "", showIcon = true }: CountdownTimerProps) {
    const timeLeft = useCountdown(targetDate);

    if (timeLeft.isExpired) {
        return <span className={`text-muted-foreground ${className}`}>Ended</span>;
    }

    return (
        <div className={`flex items-center gap-1 font-mono text-xs ${className}`}>
            {showIcon && <Clock className="w-3 h-3 text-muted-foreground" />}
            <span className={timeLeft.days <= 1 ? "text-orange-500 font-medium" : "text-muted-foreground"}>
                {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
                {timeLeft.hours}h {timeLeft.minutes}m
            </span>
        </div>
    );
}
