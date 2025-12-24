'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ABIS } from '@/contracts/abis';
import deployment from '@/contracts/deployment.json';
import { parseUnits, formatUnits } from 'viem';
import { Loader2, ArrowRightLeft } from 'lucide-react';

interface TradePanelProps {
    marketId: string;
    yesPrice: number;
    noPrice: number;
}

export function TradePanel({ marketId, yesPrice, noPrice }: TradePanelProps) {
    const [amount, setAmount] = useState('');
    const [selectedOutcome, setSelectedOutcome] = useState<'YES' | 'NO'>('YES');
    const [activeTab, setActiveTab] = useState('buy'); // buy, sell, pool

    useEffect(() => {
        console.log("TRADE_PANEL_V2_LOADED");
    }, []);

    const [poolMode, setPoolMode] = useState<'deposit' | 'withdraw'>('deposit');
    const [txType, setTxType] = useState<string>('');
    const [inputType, setInputType] = useState<'usd' | 'shares'>('usd'); // Toggle for Buy

    const { address, isConnected } = useAccount();

    const price = selectedOutcome === 'YES' ? yesPrice : noPrice;

    // contract writes
    const { data: hash, isPending: isWritePending, writeContract } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    // 1. Market Status & Config
    const { data: marketState } = useReadContract({
        address: deployment.simpleRouter as `0x${string}`,
        abi: ABIS.SimpleRouter,
        functionName: 'getMarketStatus',
        args: [marketId],
        query: { refetchInterval: 5000 },
    });

    // Fetch Collateral Token dynamically (in case it's not the default mockToken)
    const { data: collateralTokenAddress } = useReadContract({
        address: deployment.simpleRouter as `0x${string}`,
        abi: ABIS.SimpleRouter,
        functionName: 'getCollateralToken',
        args: [marketId],
    });

    const isResolved = marketState && (marketState as any)[0] === 2;
    const winningOutcomeIndex = marketState ? Number((marketState as any)[1]) : 0;
    const winningOutcomeLabel = winningOutcomeIndex === 1 ? 'YES' : 'NO';

    // Use dynamic collateral or fallback to mockToken
    const collateralAddress = (collateralTokenAddress as `0x${string}`) || (deployment.mockToken as `0x${string}`);

    // 2. Data Fetching
    // USDC Allowance (Buy / Add Liq)
    const checkUsdcAllowance = activeTab === 'buy' || (activeTab === 'pool' && poolMode === 'deposit');
    const { data: usdcAllowance, refetch: refetchAllowance } = useReadContract({
        address: collateralAddress,
        abi: ABIS.IERC20,
        functionName: 'allowance',
        args: [address, deployment.simpleRouter],
        query: { enabled: !!address && checkUsdcAllowance && !isResolved },
    });

    // Outcome Token Balance (Sell / Redeem)
    const targetOutcomeIndex = isResolved ? winningOutcomeIndex : (selectedOutcome === 'YES' ? 1 : 0);
    const marketIdBigInt = marketId.startsWith('0x') ? BigInt(marketId) : BigInt(0);
    const outcomeTokenId = (marketIdBigInt << BigInt(8)) | BigInt(targetOutcomeIndex);

    const { data: outcomeBalance, refetch: refetchBalance } = useReadContract({
        address: deployment.outcomeToken1155 as `0x${string}`,
        abi: ABIS.OutcomeToken1155,
        functionName: 'balanceOf',
        args: [address as `0x${string}`, outcomeTokenId],
        query: { enabled: Boolean(!!address && !!marketId && (activeTab === 'sell' || isResolved)) },
    });

    // LP Share Balance (Remove Liq)
    const { data: lpBalance, refetch: refetchLp } = useReadContract({
        address: deployment.simpleRouter as `0x${string}`,
        abi: ABIS.SimpleRouter,
        functionName: 'getUserLpShares',
        args: [marketId as `0x${string}`, address as `0x${string}`],
        query: { enabled: Boolean(!!address && !!marketId && activeTab === 'pool') },
    });

    useEffect(() => {
        if (activeTab === 'pool') {
            console.log("LP Debug:", { marketId, address, lpBalance, activeTab });
        }
    }, [marketId, address, lpBalance, activeTab]);

    // Outcome/Shares Approval (Sell / Redeem)
    const { data: isOutcomeApproved, refetch: refetchOutcomeHeader } = useReadContract({
        address: deployment.outcomeToken1155 as `0x${string}`,
        abi: ABIS.OutcomeToken1155,
        functionName: 'isApprovedForAll',
        args: [address, deployment.simpleRouter],
        query: { enabled: !!address },
    });

    useEffect(() => {
        if (isSuccess) {
            // Only clear amount if the action was NOT an approval
            if (txType !== 'approve') {
                setAmount('');
            }
            refetchAllowance();
            refetchBalance();
            refetchLp();
            setTxType(''); // Reset
        }
    }, [isSuccess, txType]);

    // FPMM State for LP Estimation
    const { data: lpPoolState } = useReadContract({
        address: deployment.fpmmAMM as `0x${string}`,
        abi: ABIS.FpmmAMM,
        functionName: 'getFpmmMarketState',
        args: [marketId as `0x${string}`],
        query: { enabled: Boolean(!!marketId && activeTab === 'pool') },
    });

    // Derived Display Values
    let potentialReturn = '0.00';
    let roi = '0';
    let estimatedCost = '0.00';

    if (activeTab === 'buy') {
        if (inputType === 'usd') {
            potentialReturn = amount ? (parseFloat(amount) / price).toFixed(2) : '0';
            roi = amount ? (((1 / price) - 1) * 100).toFixed(0) : '0';
        } else {
            // Input is Shares
            estimatedCost = amount ? (parseFloat(amount) * price).toFixed(2) : '0.00';
            roi = amount ? (((1 / price) - 1) * 100).toFixed(0) : '0';
        }
    } else if (activeTab === 'sell') {
        potentialReturn = amount ? (parseFloat(amount) * price).toFixed(18) : '0.00';
    } else if (activeTab === 'pool') {
        if (poolMode === 'withdraw' && amount && lpPoolState && (lpPoolState as any[]).length >= 2) {
            // Value = (Shares / TotalSupply) * Collateral
            const collateral = parseFloat(formatUnits((lpPoolState as any[])[0], 18));
            const supply = parseFloat(formatUnits((lpPoolState as any[])[1], 18));
            if (supply > 0) {
                const val = (parseFloat(amount) / supply) * collateral;
                potentialReturn = val.toFixed(2);
            }
        }
    }


    const handleAction = async () => {
        if (!marketId || !isConnected) return;

        // --- REDEEM FLOW ---
        if (isResolved) {
            if (!outcomeBalance || (outcomeBalance as bigint) === BigInt(0)) return;
            // ... redeem logic
            if (isOutcomeApproved === false) {
                writeContract({
                    address: deployment.outcomeToken1155 as `0x${string}`,
                    abi: ABIS.OutcomeToken1155,
                    functionName: 'setApprovalForAll',
                    args: [deployment.simpleRouter, true],
                });
                return;
            }
            writeContract({
                address: deployment.simpleRouter as `0x${string}`,
                abi: ABIS.SimpleRouter,
                functionName: 'redeem',
                args: [marketId, outcomeBalance as bigint],
            });
            return;
        }

        if (!amount) return;

        let amountBigInt: bigint;

        // --- BUY FLOW ---
        if (activeTab === 'buy') {
            let collateralIn: bigint;
            let minTokensOut: bigint;

            if (inputType === 'usd') {
                // User entered USDC amount
                collateralIn = parseUnits(amount, 18);
                amountBigInt = collateralIn; // For approval
                // Est shares = amount / price
                // We shouldn't calc tokens out EXACTLY here because price changes
                // But simplified:
                minTokensOut = parseUnits((parseFloat(amount) / price * 0.80).toFixed(18), 18); // Increased slippage tolerance to 20%
            } else {
                // User entered Shares amount
                // We need to calculate required USDC
                const cost = parseFloat(amount) * price;
                collateralIn = parseUnits(cost.toFixed(18), 18);
                amountBigInt = collateralIn; // For approval
                minTokensOut = parseUnits((parseFloat(amount) * 0.80).toFixed(18), 18);
            }

            if (usdcAllowance !== undefined && (usdcAllowance as bigint) < amountBigInt) {
                setTxType('approve');
                writeContract({
                    address: collateralAddress,
                    abi: ABIS.IERC20,
                    functionName: 'approve',
                    args: [deployment.simpleRouter, BigInt(2 ** 256) - BigInt(1)], // Max Approval
                });
                return;
            }

            const idx = selectedOutcome === 'YES' ? 1 : 0;
            console.log("Buying Outcome:", { marketId, idx, amountBigInt, minTokensOut });
            setTxType('buy');
            writeContract({
                address: deployment.simpleRouter as `0x${string}`,
                abi: ABIS.SimpleRouter,
                functionName: 'buyOutcome',
                args: [marketId, idx, amountBigInt, minTokensOut],
            });
        }
        // --- SELL FLOW ---
        else if (activeTab === 'sell') {
            amountBigInt = parseUnits(amount, 18); // Shares

            if (isOutcomeApproved === false) {
                setTxType('approve');
                writeContract({
                    address: deployment.outcomeToken1155 as `0x${string}`,
                    abi: ABIS.OutcomeToken1155,
                    functionName: 'setApprovalForAll',
                    args: [deployment.simpleRouter, true],
                });
                return;
            }
            const expectedCollateral = parseFloat(amount) * price;
            const minCollateralOut = parseUnits((expectedCollateral * 0.90).toFixed(18), 18);
            const idx = selectedOutcome === 'YES' ? 1 : 0;
            setTxType('sell');
            writeContract({
                address: deployment.simpleRouter as `0x${string}`,
                abi: ABIS.SimpleRouter,
                functionName: 'sellOutcome',
                args: [marketId, idx, amountBigInt, minCollateralOut],
            });
        }
        // --- POOL FLOW ---
        else if (activeTab === 'pool') {
            amountBigInt = poolMode === 'deposit' ? parseUnits(amount, 18) : parseUnits(amount, 18);

            if (poolMode === 'deposit') {
                if (usdcAllowance !== undefined && (usdcAllowance as bigint) < amountBigInt) {
                    setTxType('approve');
                    writeContract({
                        address: collateralAddress,
                        abi: ABIS.IERC20,
                        functionName: 'approve',
                        args: [deployment.simpleRouter, BigInt(2 ** 256) - BigInt(1)], // Max Approval
                    });
                    return;
                }
                // Relax slippage for LP to avoid revert on dust differences
                const minLpShares = parseUnits((parseFloat(amount) * 0.90).toFixed(18), 18);
                setTxType('pool');
                writeContract({
                    address: deployment.simpleRouter as `0x${string}`,
                    abi: ABIS.SimpleRouter,
                    functionName: 'addLiquidity',
                    args: [marketId, amountBigInt, minLpShares],
                });
            } else {
                const minCollateral = parseUnits((parseFloat(amount) * 0.90).toFixed(18), 18);
                setTxType('pool');
                writeContract({
                    address: deployment.simpleRouter as `0x${string}`,
                    abi: ABIS.SimpleRouter,
                    functionName: 'removeLiquidity',
                    args: [marketId, amountBigInt, minCollateral],
                });
            }
        }
    };

    if (isResolved) {
        // ... Resolved UI (Simplified for brevity, same as before) ...
        const hasWinnings = outcomeBalance && (outcomeBalance as bigint) > BigInt(0);
        return (
            <Card className="w-full bg-card/60 backdrop-blur-md border-yellow-500/50">
                <CardHeader>
                    <CardTitle className="text-yellow-500">Resolved: {winningOutcomeLabel}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4 space-y-4">
                        {hasWinnings ? (
                            <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
                                <p className="text-sm text-yellow-500 mb-2">You Won!</p>
                                <p className="text-2xl font-bold">{formatUnits(outcomeBalance as bigint, 18)} SHARES</p>
                                <Button
                                    className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                                    onClick={handleAction}
                                    disabled={isConfirming || isWritePending}
                                >
                                    {isWritePending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Redeem Winnings
                                </Button>
                            </div>
                        ) : (
                            <p>No winning shares.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full bg-card/60 backdrop-blur-md">
            <CardHeader>
                <CardTitle>Trade</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="buy">Buy</TabsTrigger>
                        <TabsTrigger value="sell">Sell</TabsTrigger>
                        <TabsTrigger value="pool">Pool</TabsTrigger>
                    </TabsList>

                    <div className="space-y-4 py-4">
                        {/* BUY/SELL OUTCOME TOGGLE */}
                        {activeTab !== 'pool' && (
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <Button
                                    variant={selectedOutcome === 'YES' ? 'default' : 'outline'}
                                    className={`h-12 border-2 ${selectedOutcome === 'YES' ? 'border-green-500 bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-500' : 'hover:border-green-500/50'}`}
                                    onClick={() => setSelectedOutcome('YES')}
                                >
                                    <div className="flex flex-col items-center">
                                        <span className="font-bold">YES</span>
                                        <span className="text-xs opacity-80">${yesPrice.toFixed(2)}</span>
                                    </div>
                                </Button>
                                <Button
                                    variant={selectedOutcome === 'NO' ? 'default' : 'outline'}
                                    className={`h-12 border-2 ${selectedOutcome === 'NO' ? 'border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-500' : 'hover:border-red-500/50'}`}
                                    onClick={() => setSelectedOutcome('NO')}
                                >
                                    <div className="flex flex-col items-center">
                                        <span className="font-bold">NO</span>
                                        <span className="text-xs opacity-80">${noPrice.toFixed(2)}</span>
                                    </div>
                                </Button>
                            </div>
                        )}

                        {/* POOL MODE TOGGLE */}
                        {activeTab === 'pool' && (
                            <div className="flex justify-center mb-4 p-1 bg-muted rounded-lg">
                                <Button size="sm" variant={poolMode === 'deposit' ? 'default' : 'ghost'} onClick={() => setPoolMode('deposit')} className="w-1/2">Deposit</Button>
                                <Button size="sm" variant={poolMode === 'withdraw' ? 'default' : 'ghost'} onClick={() => setPoolMode('withdraw')} className="w-1/2">Withdraw</Button>
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="amount">
                                    {activeTab === 'buy' ? (inputType === 'usd' ? 'Amount (USDC)' : 'Amount (Shares)') :
                                        activeTab === 'sell' ? 'Shares to Sell' :
                                            poolMode === 'deposit' ? 'Deposit (USDC)' : 'Withdraw (LP Shares)'}
                                </Label>
                                {/* Toggle Input Type for Buy */}
                                {activeTab === 'buy' && (
                                    <div className="flex items-center gap-1 text-xs cursor-pointer text-primary hover:underline" onClick={() => setInputType(inputType === 'usd' ? 'shares' : 'usd')}>
                                        <ArrowRightLeft className="h-3 w-3" />
                                        Switch to {inputType === 'usd' ? 'Shares' : 'USDC'}
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="0.00"
                                    min="0"
                                    value={amount}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (parseFloat(val) < 0) return;
                                        setAmount(val);
                                    }}
                                    className="pr-16 text-right font-mono text-lg"
                                />
                                <div className="absolute top-0 right-3 h-full flex items-center text-muted-foreground text-sm pointer-events-none">
                                    {activeTab === 'buy' ? (inputType === 'usd' ? 'USDC' : 'SHARES') :
                                        activeTab === 'pool' && poolMode === 'deposit' ? 'USDC' : 'SHARES'}
                                </div>
                            </div>

                            {/* Detailed Balance & Estimates */}
                            <div className="flex justify-between items-start text-xs text-muted-foreground pt-1">
                                <div>
                                    {(activeTab === 'sell' || (activeTab === 'pool' && poolMode === 'withdraw')) && (
                                        <span
                                            className="cursor-pointer hover:text-primary underline decoration-dotted"
                                            onClick={() => {
                                                if (activeTab === 'sell' && outcomeBalance) {
                                                    setAmount(formatUnits(outcomeBalance as bigint, 18));
                                                } else if (activeTab === 'pool' && poolMode === 'withdraw' && lpBalance) {
                                                    setAmount(formatUnits(lpBalance as bigint, 18));
                                                }
                                            }}
                                        >
                                            Max: {activeTab === 'sell'
                                                ? (outcomeBalance ? parseFloat(formatUnits(outcomeBalance as bigint, 18)).toFixed(4) : '0.00')
                                                : (lpBalance ? parseFloat(formatUnits(lpBalance as bigint, 18)).toFixed(4) : '0.00')}
                                        </span>
                                    )}
                                    {activeTab === 'pool' && poolMode === 'deposit' && (
                                        <span className="text-[10px] italic opacity-80 block max-w-[200px] leading-tight mt-1">
                                            Note: First provider mints fixed 1000 shares to set initial price.
                                        </span>
                                    )}
                                </div>
                                <div className="text-right flex flex-col">
                                    {activeTab === 'buy' && inputType === 'shares' && (
                                        <span>Est. Cost: <span className="text-foreground font-mono">${estimatedCost}</span></span>
                                    )}
                                    {activeTab === 'buy' && inputType === 'usd' && (
                                        <span>Est. Shares: <span className="text-foreground font-mono">{potentialReturn}</span></span>
                                    )}
                                    {activeTab === 'pool' && poolMode === 'withdraw' && (
                                        <span>Est. Value: <span className="text-foreground font-mono">${potentialReturn}</span></span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ACTION BUTTONS (2-STEP) */}
                        <div className="flex gap-3 mt-4">
                            {/* APPROVE BUTTON */}
                            {(activeTab === 'buy' || activeTab === 'sell' || (activeTab === 'pool' && poolMode === 'deposit')) && (() => {
                                let showApprove = false;
                                let isApproved = false;
                                let approveLabel = "Approve";
                                let approveAction = async () => { };

                                if (activeTab === 'buy' || (activeTab === 'pool' && poolMode === 'deposit')) {
                                    // USDC Approval
                                    const amountBigInt = parseUnits(amount || '0', 18);
                                    const allowance = usdcAllowance as bigint || BigInt(0);

                                    let needed = BigInt(0);
                                    if (amount) {
                                        if (activeTab === 'buy' && inputType === 'shares') {
                                            const cost = parseFloat(amount) * price;
                                            needed = parseUnits(cost.toFixed(18), 18);
                                        } else {
                                            needed = parseUnits(amount, 18);
                                        }
                                    }

                                    showApprove = true;
                                    isApproved = needed > BigInt(0) ? allowance >= needed : allowance > BigInt(0);
                                    if (!amount || parseFloat(amount) === 0) {
                                        isApproved = false;
                                    }

                                    approveLabel = "1. Approve USDC";
                                    approveAction = async () => {
                                        setTxType('approve');
                                        writeContract({
                                            address: collateralAddress,
                                            abi: ABIS.IERC20,
                                            functionName: 'approve',
                                            args: [deployment.simpleRouter, BigInt(2 ** 256) - BigInt(1)],
                                        });
                                    };

                                } else if (activeTab === 'sell') {
                                    // Shares Approval
                                    showApprove = true;
                                    isApproved = isOutcomeApproved === true;
                                    approveLabel = "1. Approve Shares";
                                    approveAction = async () => {
                                        setTxType('approve');
                                        writeContract({
                                            address: deployment.outcomeToken1155 as `0x${string}`,
                                            abi: ABIS.OutcomeToken1155,
                                            functionName: 'setApprovalForAll',
                                            args: [deployment.simpleRouter, true],
                                        });
                                    };
                                }

                                if (!showApprove) return null;

                                return (
                                    <Button
                                        className="flex-1 font-bold"
                                        size="lg"
                                        variant={isApproved ? "outline" : "default"}
                                        onClick={approveAction}
                                        disabled={!isConnected || !amount || isApproved || isWritePending || isConfirming}
                                    >
                                        {isWritePending && txType === 'approve' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        {isApproved ? "Approved" : approveLabel}
                                    </Button>
                                );
                            })()}

                            {/* TRADE ACTION BUTTON */}
                            <Button
                                className={`flex-1 font-bold ${activeTab === 'pool' ? '' :
                                    selectedOutcome === 'YES' ? '!bg-green-600 hover:!bg-green-700 !text-white' : '!bg-red-600 hover:!bg-red-700 !text-white'
                                    }`}
                                size="lg"
                                onClick={handleAction}
                                disabled={(() => {
                                    if (!isConnected || !amount || isWritePending || isConfirming) return true;

                                    if (activeTab === 'buy' || (activeTab === 'pool' && poolMode === 'deposit')) {
                                        let needed = BigInt(0);
                                        if (activeTab === 'buy' && inputType === 'shares') {
                                            const cost = parseFloat(amount) * price;
                                            needed = parseUnits(cost.toFixed(18), 18);
                                        } else {
                                            needed = parseUnits(amount, 18);
                                        }
                                        const allowance = usdcAllowance as bigint || BigInt(0);
                                        if (allowance < needed) return true;
                                    }
                                    if (activeTab === 'sell') {
                                        if (!isOutcomeApproved) return true;
                                    }
                                    return false;
                                })()}
                            >
                                {isWritePending && txType !== 'approve' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {(() => {
                                    if (activeTab === 'buy') return `2. Buy ${selectedOutcome}`;
                                    if (activeTab === 'sell') return `2. Sell ${selectedOutcome}`;
                                    if (activeTab === 'pool') return poolMode === 'deposit' ? '2. Deposit' : 'Withdraw';
                                    return 'Trade';
                                })()}
                            </Button>
                        </div>
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    );
}
