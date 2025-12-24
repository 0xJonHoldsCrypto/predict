'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import deployment from '@/contracts/deployment.json';
import { ABIS } from '@/contracts/abis';
import { useMarkets, Market } from '@/hooks/use-markets';

export interface Position {
    marketId: string;
    marketQuestion: string;
    outcomeBalances: string[]; // [NO balance, YES balance]
    lpShares: string;
    hasPosition: boolean;
    market: Market;
}

export function usePortfolio() {
    const { address } = useAccount();
    const { markets } = useMarkets();
    const [positions, setPositions] = useState<Position[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const publicClient = usePublicClient();

    useEffect(() => {
        async function fetchBalances() {
            if (!address) {
                setIsLoading(false);
                setPositions([]);
                return;
            }

            // If markets haven't loaded yet, wait.
            // But if we have no markets at all (fetched and empty), stop loading.
            if (!publicClient || markets.length === 0) {
                // Check if useMarkets is actually done? 
                // We don't have access to useMarkets isLoading here directly in the condition, 
                // but markets array being empty likely means loading or no markets.
                // We'll let the user's isLoading from useMarkets handle the main spinner 
                // if they use it, but for strict portfolio loading:
                // Let's just return and wait for markets to populate if they exist.
                return;
            }

            setIsLoading(true);
            const newPositions: Position[] = [];

            try {
                await Promise.all(markets.map(async (market) => {
                    try {
                        // 1. Get LP Shares
                        const lpSharesData = await publicClient.readContract({
                            address: deployment.simpleRouter as `0x${string}`,
                            abi: ABIS.SimpleRouter,
                            functionName: 'getUserLpShares',
                            args: [market.id, address],
                        }) as bigint;

                        // 2. Get Outcome Balances
                        const outcomesData = await publicClient.readContract({
                            address: deployment.simpleRouter as `0x${string}`,
                            abi: ABIS.SimpleRouter,
                            functionName: 'getUserAllOutcomeBalances',
                            args: [market.id, address],
                        }) as bigint[];

                        const lpShares = formatUnits(lpSharesData, 18);
                        const balances = outcomesData.map(b => formatUnits(b, 18));

                        const hasLp = lpSharesData > BigInt(0);
                        const hasOutcome = outcomesData.some(b => b > BigInt(0));

                        if (hasLp || hasOutcome) {
                            newPositions.push({
                                marketId: market.id,
                                marketQuestion: market.question,
                                outcomeBalances: balances,
                                lpShares,
                                hasPosition: true,
                                market: market
                            });
                        }

                    } catch (e) {
                        console.warn(`Failed to fetch position for ${market.id}`, e);
                    }
                }));

                setPositions(newPositions);

            } catch (error) {
                console.error("Error fetching portfolio:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchBalances();
    }, [address, markets, publicClient]);

    return { positions, isLoading };
}
