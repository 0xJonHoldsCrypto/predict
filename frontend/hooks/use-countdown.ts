'use client';

import { useState, useEffect } from 'react';

export function useCountdown(targetDate: Date | string | number) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        isExpired: boolean;
    }>({ days: 0, hours: 0, minutes: 0, isExpired: false });

    useEffect(() => {
        const calculateTimeLeft = () => {
            let target: number;

            if (targetDate instanceof Date) {
                target = targetDate.getTime();
            } else if (typeof targetDate === 'string') {
                target = new Date(targetDate).getTime();
            } else {
                // Number: Assume seconds if < 10000000000 (year 2286), else ms
                target = targetDate < 10000000000 ? targetDate * 1000 : targetDate;
            }

            if (isNaN(target)) {
                return { days: 0, hours: 0, minutes: 0, isExpired: true };
            }

            const now = new Date().getTime();
            const difference = target - now;

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                return { days, hours, minutes, isExpired: false };
            } else {
                return { days: 0, hours: 0, minutes: 0, isExpired: true };
            }
        };

        // Initial calc
        setTimeLeft(calculateTimeLeft());

        // Update every minute (no need for second precision for markets ending in days/years)
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 60000);

        return () => clearInterval(timer);
    }, [targetDate]);

    return timeLeft;
}
