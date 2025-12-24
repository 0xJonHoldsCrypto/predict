'use client';

import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { parseAbiItem, formatUnits } from 'viem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import deployment from '@/contracts/deployment.json';
import { Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface RecentTradesProps {
    marketId: string;
    outcomes: string[];
}

interface Trade {
    hash: string;
    type: 'Buy' | 'Sell' | 'Add LP';
    user: string;
    amount: string;
    outcome: string;
    blockNumber: bigint;
    timestamp?: string; // Fetched separately
}

export function RecentTrades({ marketId, outcomes }: RecentTradesProps) {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const publicClient = usePublicClient();

    useEffect(() => {
        if (!publicClient || !marketId) return;

        const fetchTrades = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch Buys
                const buyLogs = await publicClient.getLogs({
                    address: deployment.fpmmAMM as `0x${string}`,
                    event: parseAbiItem('event OutcomeBought(bytes32 indexed marketId, address indexed buyer, uint8 outcomeIndex, uint256 collateralIn, uint256 outcomeTokensOut)'),
                    args: { marketId: marketId as `0x${string}` },
                    fromBlock: 'earliest'
                });

                // 2. Fetch Sells
                const sellLogs = await publicClient.getLogs({
                    address: deployment.fpmmAMM as `0x${string}`,
                    event: parseAbiItem('event OutcomeSold(bytes32 indexed marketId, address indexed seller, uint8 outcomeIndex, uint256 outcomeTokensIn, uint256 collateralOut)'),
                    args: { marketId: marketId as `0x${string}` },
                    fromBlock: 'earliest'
                });

                // 3. Fetch Liquidity Adds (LP)
                const lpLogs = await publicClient.getLogs({
                    address: deployment.simpleRouter as `0x${string}`,
                    event: parseAbiItem('event LiquidityProvided(bytes32 indexed marketId, address indexed provider, uint256 collateralAmount, uint256 lpShares)'),
                    args: { marketId: marketId as `0x${string}` },
                    fromBlock: 'earliest'
                });

                // 4. Process Logs
                const buys: Trade[] = buyLogs.map(log => ({
                    hash: log.transactionHash,
                    type: 'Buy',
                    user: log.args.buyer!,
                    amount: formatUnits(log.args.collateralIn!, 18), // Input USDC
                    outcome: outcomes[log.args.outcomeIndex!] || `Outcome ${log.args.outcomeIndex}`,
                    blockNumber: log.blockNumber
                }));

                const sells: Trade[] = sellLogs.map(log => ({
                    hash: log.transactionHash,
                    type: 'Sell',
                    user: log.args.seller!,
                    amount: formatUnits(log.args.collateralOut!, 18), // Output USDC
                    outcome: outcomes[log.args.outcomeIndex!] || `Outcome ${log.args.outcomeIndex}`,
                    blockNumber: log.blockNumber
                }));

                const lps: Trade[] = lpLogs.map(log => ({
                    hash: log.transactionHash,
                    type: 'Add LP',
                    user: log.args.provider!,
                    amount: formatUnits(log.args.collateralAmount!, 18), // Input USDC
                    outcome: 'All Outcomes',
                    blockNumber: log.blockNumber
                }));

                // 5. Sort by Block Number (Desc)
                const allTrades = [...buys, ...sells, ...lps].sort((a, b) =>
                    Number(b.blockNumber - a.blockNumber)
                ).slice(0, 20); // Keep last 20

                setTrades(allTrades);
            } catch (err) {
                console.error("Failed to fetch trades:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrades();

        // Optional: Poll every 10s
        const interval = setInterval(fetchTrades, 10000);
        return () => clearInterval(interval);

    }, [publicClient, marketId, outcomes]);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {isLoading && trades.length === 0 ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                ) : trades.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                        No activity yet.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Type</TableHead>
                                <TableHead>Outcome</TableHead>
                                <TableHead>Amount (USDC)</TableHead>
                                <TableHead className="text-right">User</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {trades.map((trade) => (
                                <TableRow key={trade.hash + trade.type}>
                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className={
                                                trade.type === 'Buy' ? "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-0" :
                                                    trade.type === 'Sell' ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-0" :
                                                        "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-0"
                                            }
                                        >
                                            {trade.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium text-xs">
                                        {trade.outcome}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        ${Number(trade.amount).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right text-xs font-mono text-muted-foreground">
                                        {trade.user.slice(0, 6)}...{trade.user.slice(-4)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
