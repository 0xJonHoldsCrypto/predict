'use client';

import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { parseAbiItem, formatUnits } from 'viem';
import deployment from '@/contracts/deployment.json';
import { ABIS } from '@/contracts/abis';

export interface Market {
    id: string; // marketId (bytes32)
    question: string;
    description: string;
    endDate: string;
    yesPrice: number;
    noPrice: number;
    volume: string;
    liquidity: string;
    image?: string;
    isResolved: boolean;
    oracle: string;
    questionId: string;
    outcomes: string[];
}

export function useMarkets() {
    const [markets, setMarkets] = useState<Market[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const publicClient = usePublicClient();

    useEffect(() => {
        async function fetchMarkets() {
            if (!publicClient) return;

            try {
                // 1. Fetch Logs (Broad search to debug filtering issues)
                const logs = await publicClient.getLogs({
                    address: deployment.predictionMarketDeployer as `0x${string}`,
                    fromBlock: 'earliest',
                });

                console.log("useMarkets: Fetched raw logs from deployer:", logs.length);

                const fetchedMarkets: Market[] = [];
                const deployEventAbi = parseAbiItem('event PredictionMarketDeployed(bytes32 indexed marketId, bytes32 indexed questionId, address indexed oracle, address collateralToken, uint8 numOutcomes, uint256 liquidityParameterB, string metadataURI, address deployer)');

                // Import decodeEventLog from viem
                const { decodeEventLog } = await import('viem');

                for (const log of logs) {
                    try {
                        const decoded = decodeEventLog({
                            abi: [deployEventAbi],
                            data: log.data,
                            topics: log.topics,
                        });

                        if (decoded.eventName !== 'PredictionMarketDeployed') continue;

                        const args = decoded.args as any;
                        if (!args) continue;

                        const { marketId, metadataURI, oracle, questionId } = args;

                        // 2. Parse Metadata (for Question/Description/Image)
                        let question = "Unknown Question";
                        let description = "No description";
                        let image = "";
                        let outcomes: string[] = ["NO", "YES"];

                        try {
                            if (metadataURI.startsWith('data:application/json;base64,')) {
                                const json = atob(metadataURI.split(',')[1]);
                                const data = JSON.parse(json);
                                question = data.question || question;
                                description = data.description || description;
                                image = data.image || "";
                                if (data.outcomes && Array.isArray(data.outcomes)) {
                                    outcomes = data.outcomes;
                                }
                            } else if (metadataURI.startsWith('{')) {
                                const data = JSON.parse(metadataURI);
                                question = data.question || question;
                                description = data.description || description;
                                image = data.image || "";
                                if (data.outcomes && Array.isArray(data.outcomes)) {
                                    outcomes = data.outcomes;
                                }
                            }
                        } catch (e) {
                            // Ignore parse errors
                        }

                        // 3. Fetch Market Data (Deadline)
                        let endDate = "Unknown";
                        try {
                            const marketData = await publicClient.readContract({
                                address: deployment.marketCore as `0x${string}`,
                                abi: ABIS.MarketCore,
                                functionName: 'getMarketParams',
                                args: [marketId],
                            }) as any;

                            if (marketData && marketData.marketDeadline) {
                                const deadline = Number(marketData.marketDeadline);
                                if (!isNaN(deadline) && deadline > 0) {
                                    endDate = new Date(deadline * 1000).toLocaleString('en-US', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short',
                                        timeZoneName: 'short'
                                    });
                                }
                            }
                        } catch (err) {
                            // console.warn(`Failed to fetch market info for ${marketId}`, err);
                        }

                        const yesPrice = 0.50;
                        const noPrice = 0.50;

                        // 4. Fetch Real Liquidity from FpmmAMM
                        let liquidity = "0";
                        try {
                            const marketState = await publicClient.readContract({
                                address: deployment.fpmmAMM as `0x${string}`,
                                abi: ABIS.FpmmAMM,
                                functionName: 'getFpmmMarketState',
                                args: [marketId],
                            }) as any;

                            if (marketState && marketState.length >= 1) {
                                const collateralBalance = marketState[0];
                                // Assume 18 decimals for USDC (Mock Token)
                                liquidity = formatUnits(collateralBalance, 18);
                            }
                        } catch (e) {
                            // defaulting to 0
                        }

                        // 5. Calculate Volume from Logs
                        let volumeTotal = BigInt(0);
                        try {
                            const buyLogs = await publicClient.getLogs({
                                address: deployment.fpmmAMM as `0x${string}`,
                                event: parseAbiItem('event OutcomeBought(bytes32 indexed marketId, address indexed buyer, uint8 outcomeIndex, uint256 collateralIn, uint256 outcomeTokensOut)'),
                                args: { marketId: marketId as `0x${string}` },
                                fromBlock: 'earliest'
                            });

                            const sellLogs = await publicClient.getLogs({
                                address: deployment.fpmmAMM as `0x${string}`,
                                event: parseAbiItem('event OutcomeSold(bytes32 indexed marketId, address indexed seller, uint8 outcomeIndex, uint256 outcomeTokensIn, uint256 collateralOut)'),
                                args: { marketId: marketId as `0x${string}` },
                                fromBlock: 'earliest'
                            });

                            buyLogs.forEach(l => {
                                const val = l.args.collateralIn;
                                if (val) volumeTotal += val;
                            });
                            sellLogs.forEach(l => {
                                const val = l.args.collateralOut;
                                if (val) volumeTotal += val;
                            });
                        } catch (e) {
                            console.warn("Failed to fetch volume logs", e);
                        }
                        const volumeLabel = formatUnits(volumeTotal, 18);

                        fetchedMarkets.push({
                            id: marketId,
                            question,
                            description,
                            endDate,
                            yesPrice,
                            noPrice,
                            volume: volumeLabel,
                            liquidity,
                            image,
                            isResolved: false,
                            oracle: oracle || "",
                            questionId: questionId || "",
                            outcomes
                        });

                    } catch (decodeError) {
                        // Not the event we are looking for or decode failed
                        continue;
                    }
                }

                setMarkets(fetchedMarkets.reverse());
            } catch (error) {
                console.error("Error fetching markets:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchMarkets();
    }, [publicClient]);

    return { markets, isLoading };
}
