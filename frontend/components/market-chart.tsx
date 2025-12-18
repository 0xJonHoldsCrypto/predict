'use client';

import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

declare global {
    interface Window {
        TradingView: any;
    }
}

interface MarketChartProps {
    question: string;
}

export function MarketChart({ question }: MarketChartProps) {
    const container = useRef<HTMLDivElement>(null);

    // Parse symbol from question
    const getSymbol = (q: string) => {
        const lower = q.toLowerCase();
        if (lower.includes('eth') || lower.includes('ether')) return 'PYTH:ETHUSD';
        if (lower.includes('btc') || lower.includes('bitcoin')) return 'PYTH:BTCUSD';
        if (lower.includes('hemi')) return 'ETHUSD'; // Fallback / correlated for now
        return 'PYTH:ETHUSD'; // Default
    };

    const symbol = getSymbol(question);

    useEffect(() => {
        if (!container.current) return;

        // Clear previous script if any (though StrictMode might re-run)
        container.current.innerHTML = '';

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            "autosize": true,
            "symbol": symbol,
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "1",
            "locale": "en",
            "enable_publishing": false,
            "allow_symbol_change": true,
            "calendar": false,
            "support_host": "https://www.tradingview.com"
        });
        container.current.appendChild(script);
    }, [symbol]);

    return (
        <Card className="h-[500px] w-full p-0 overflow-hidden bg-card/40 backdrop-blur-sm border-0">
            <div className="tradingview-widget-container h-full w-full" ref={container}>
                <div className="tradingview-widget-container__widget h-full w-full"></div>
            </div>
        </Card>
    );
}

