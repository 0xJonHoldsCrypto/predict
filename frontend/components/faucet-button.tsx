'use client';

import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { ABIS } from '@/contracts/abis';
import deployment from '@/contracts/deployment.json';
import { parseUnits } from 'viem';
import { Loader2, Coins } from 'lucide-react';
import { useState } from 'react';

export function FaucetButton() {
    const { isConnected, address } = useAccount();
    const { data: hash, isPending, writeContract } = useWriteContract();
    const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

    const handleMint = () => {
        if (!address || !deployment.mockToken) return;

        // Mint 1000 Mock USDC (18 decimals)
        writeContract({
            address: deployment.mockToken as `0x${string}`,
            abi: ABIS.MockERC20,
            functionName: 'mint',
            args: [address, parseUnits('1000', 18)],
        });
    };

    if (!isConnected || !deployment.mockToken) return null;

    return (
        <Button
            variant="secondary"
            onClick={handleMint}
            disabled={isPending || isConfirming}
            className="gap-2"
        >
            {isPending || isConfirming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Coins className="h-4 w-4" />
            )}
            Mint Test USDC
        </Button>
    );
}
