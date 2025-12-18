'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ABIS } from '@/contracts/abis';
import deployment from '@/contracts/deployment.json';
import { parseUnits, keccak256, encodePacked } from 'viem';
import { Loader2, Plus, Trash2 } from 'lucide-react';

const ASSETS = {
    ETH: {
        symbol: 'ETH',
        name: 'Ether',
        pool: '0x9580D4519C9F27642e21085E763E761a74eF3735', // ETH/USDC.e Pool
        baseToken: '0x4200000000000000000000000000000000000006', // WETH
        quoteToken: '0xad11a8BEb98bbf61dbb1aa0F6d6F2ECD87b35afA', // USDC.e
        decimals: 18
    },
    BTC: {
        symbol: 'BTC',
        name: 'Bitcoin',
        // Placeholder addresses for now - User to update
        pool: '0x9580D4519C9F27642e21085E763E761a74eF3735', // TODO: BTC/USDC Pool
        baseToken: '0x4200000000000000000000000000000000000006', // TODO: WBTC
        quoteToken: '0xad11a8BEb98bbf61dbb1aa0F6d6F2ECD87b35afA', // USDC.e
        decimals: 8
    },
    HEMI: {
        symbol: 'HEMI',
        name: 'Hemi Token',
        // Placeholder addresses for now - User to update
        pool: '0x9580D4519C9F27642e21085E763E761a74eF3735', // TODO: HEMI/USDC Pool
        baseToken: '0x4200000000000000000000000000000000000006', // TODO: Wrapped HEMI
        quoteToken: '0xad11a8BEb98bbf61dbb1aa0F6d6F2ECD87b35afA', // USDC.e
        decimals: 18
    }
};

export function CreateMarketDialog() {
    const [open, setOpen] = useState(false);
    const { isConnected, address } = useAccount();

    // Mode: 'price' (Asset > X) or 'custom' (Generic)
    const [mode, setMode] = useState<'price' | 'custom'>('price');

    // Price Mode State
    const [selectedAsset, setSelectedAsset] = useState<keyof typeof ASSETS>('ETH');
    const [threshold, setThreshold] = useState('3000');
    const [date, setDate] = useState('');
    const [generatedQuestion, setGeneratedQuestion] = useState('');

    // Custom Mode State
    const [customQuestion, setCustomQuestion] = useState('');
    const [outcomes, setOutcomes] = useState<string[]>(['Yes', 'No']);

    const { data: hash, isPending: isWritePending, writeContract } = useWriteContract();
    const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({ hash });
    const router = useRouter(); // Import at top

    // Auto-update generated question
    useEffect(() => {
        if (mode === 'price') {
            const dateStr = date ? new Date(date).toUTCString() : 'Date';
            const assetName = ASSETS[selectedAsset].symbol;
            setGeneratedQuestion(`Will ${assetName} be above $${threshold || 'X'} by ${dateStr}?`);
        }
    }, [threshold, date, mode, selectedAsset]);

    // Handle Redirect on Success
    useEffect(() => {
        if (isSuccess && receipt) {
            console.log("Transaction Receipt:", receipt);
            // Find MarketCreated event to get ID
            // We look for the log emitted by PredictionMarketDeployer
            const deployerAddress = deployment.predictionMarketDeployer.toLowerCase();
            console.log("Looking for logs from deployer:", deployerAddress);

            const log = receipt.logs.find(l => {
                console.log("Checking log from:", l.address);
                return l.address.toLowerCase() === deployerAddress && l.topics.length >= 2;
            });

            if (log && log.topics[1]) {
                const marketId = log.topics[1];
                console.log("Found Market ID:", marketId);
                setOpen(false);
                router.push(`/markets/${marketId}`);
            } else {
                console.warn("Could not find creation log in receipt", receipt);
                // Fallback: If we can't find it, just close.
                setOpen(false);
            }
        }
    }, [isSuccess, receipt, router]);

    const handleAddOutcome = () => {
        if (outcomes.length < 8) setOutcomes([...outcomes, `Option ${outcomes.length + 1}`]);
    };

    const handleRemoveOutcome = (index: number) => {
        if (outcomes.length > 2) {
            setOutcomes(outcomes.filter((_, i) => i !== index));
        }
    };

    const handleDeploy = async () => {
        if (!date) return;
        const deadlineDate = new Date(date);
        const evalTime = BigInt(Math.floor(deadlineDate.getTime() / 1000));
        const marketDeadline = evalTime;

        // Collateral is now 18 decimals (MockUSDC redeployed).
        const liquidityParameterB = parseUnits('1000', 18);
        const COLLATERAL = deployment.mockToken;

        if (mode === 'price') {
            if (!threshold) return;
            const asset = ASSETS[selectedAsset];

            // Re-generate question/desc to ensure no stale state
            const deadlineDate = new Date(date);
            const dateStr = deadlineDate.toUTCString();
            const finalQuestion = `Will ${asset.symbol} be above $${threshold} on ${dateStr}?`;
            const finalDescription = `Resolves to YES if ${asset.name} is above $${threshold} on ${dateStr}.`;

            const thresholdBigInt = parseUnits(threshold, 6); // USDC is 6 decimals
            const twapWindow = 1800;

            const params = {
                oracleAdapter: deployment.oracleAdapter,
                pool: asset.pool,
                baseToken: asset.baseToken,
                quoteToken: asset.quoteToken,
                collateralToken: COLLATERAL,
                threshold: thresholdBigInt,
                liquidityParameterB,
                evalTime,
                marketDeadline,
                twapWindow,
                configFlags: 0,
                greaterThan: true
            };

            const metadata = {
                question: finalQuestion,
                description: finalDescription,
            };
            const metadataURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

            writeContract({
                address: deployment.predictionMarketDeployer as `0x${string}`,
                abi: ABIS.PredictionMarketDeployer,
                functionName: 'deployEthUsdThresholdMarket',
                args: [params, metadataURI],
            });
        } else {
            // Custom Mode: Use MockOracle
            if (!customQuestion) return;

            // 1. Generate Question ID (deterministically from text to keep it simple)
            // Ideally we call Oracle.registerQuestion but that's an extra tx.
            // With MockOracle we can register it... actually MockOracle.registerQuestion is just for test setup not required by interface (interface just needs requestResolution). 
            // We just need a unique ID. Let's use hash(question + timestamp).
            const questionId = keccak256(encodePacked(['string', 'uint256'], [customQuestion, BigInt(Date.now())]));

            // In a real app we might want to register this ID on-chain or use a centralized oracle's API.
            // For this MockOracle, since check is loose, we can just use any ID.

            // 2. Prepare Metadata
            const metadata = {
                question: customQuestion,
                outcomes: outcomes,
                description: `Custom market resolved by MockOracle.`
            };
            const metadataURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

            // 3. Deploy
            writeContract({
                address: deployment.predictionMarketDeployer as `0x${string}`,
                abi: ABIS.PredictionMarketDeployer,
                functionName: 'deployMarketWithExistingQuestion',
                args: [
                    deployment.mockOracle, // Oracle Address
                    questionId,
                    COLLATERAL,
                    marketDeadline,
                    outcomes.length,
                    liquidityParameterB,
                    0, // Config flags
                    metadataURI
                ],
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    Create Market
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Prediction Market</DialogTitle>
                    <DialogDescription>
                        Deploy a new prediction market on Hemi.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={mode} onValueChange={(v) => setMode(v as 'price' | 'custom')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="price">Price Speculation</TabsTrigger>
                        <TabsTrigger value="custom">Custom / Categorical</TabsTrigger>
                    </TabsList>

                    <div className="grid gap-4 py-4">
                        {mode === 'price' ? (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="asset">Asset</Label>
                                    <Select value={selectedAsset} onValueChange={(v) => setSelectedAsset(v as keyof typeof ASSETS)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Asset" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ETH">ETH (Ether)</SelectItem>
                                            <SelectItem value="BTC">BTC (Bitcoin)</SelectItem>
                                            <SelectItem value="HEMI">HEMI (Hemi Token)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="question">Preview Question</Label>
                                    <Input
                                        id="question"
                                        value={generatedQuestion}
                                        readOnly
                                        className="bg-muted text-muted-foreground"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="threshold">Strike Price (USD)</Label>
                                        <Input
                                            id="threshold"
                                            type="number"
                                            value={threshold}
                                            onChange={(e) => setThreshold(e.target.value)}
                                            placeholder="3000"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="date">End Date</Label>
                                        <Input
                                            id="date"
                                            type="datetime-local"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                        />
                                        {date && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Resolves at: {new Date(date).toUTCString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="custom-question">Question</Label>
                                    <Input
                                        id="custom-question"
                                        value={customQuestion}
                                        onChange={(e) => setCustomQuestion(e.target.value)}
                                        placeholder="e.g. Who will win the 2024 Election?"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Outcomes ({outcomes.length})</Label>
                                    {outcomes.map((outcome, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                value={outcome}
                                                onChange={(e) => {
                                                    const newOutcomes = [...outcomes];
                                                    newOutcomes[index] = e.target.value;
                                                    setOutcomes(newOutcomes);
                                                }}
                                                placeholder={`Option ${index + 1}`}
                                            />
                                            {outcomes.length > 2 && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveOutcome(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    {outcomes.length < 8 && (
                                        <Button variant="outline" onClick={handleAddOutcome} className="gap-2">
                                            <Plus className="h-4 w-4" /> Add Outcome
                                        </Button>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="custom-date">End Date</Label>
                                    <Input
                                        id="custom-date"
                                        type="datetime-local"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </Tabs>

                <DialogFooter>
                    <Button
                        onClick={handleDeploy}
                        disabled={!isConnected || isWritePending || isConfirming}
                    >
                        {isWritePending || isConfirming ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deploying...
                            </>
                        ) : (
                            'Deploy Market'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
