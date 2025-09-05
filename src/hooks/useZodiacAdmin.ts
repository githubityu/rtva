import { useState } from 'react';
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import LocalUtils from "../utils/LocalUtils.ts";


export function useZodiacAdmin() {
    const { address: userAddress } = useAccount();

    // --- State for Write Actions ---
    const [status, setStatus] = useState('');
    const { data: hash, writeContract, isPending, error: writeError, reset } = useWriteContract();
    const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

    // --- Read Contract Owner ---
    const { data: contractOwner, refetch: refetchOwner } = useReadContract({
        address: LocalUtils.ZODIAC_EXCHANGER_ADDRESS,
        abi: LocalUtils.ZODIAC_EXCHANGER_ABI,
        functionName: 'owner',
    });

    // --- Check if current user is the owner ---
    const isOwner = userAddress && contractOwner ? userAddress.toLowerCase() === contractOwner.toLowerCase() : false;

    // --- Read Contract State ---
    const { data: drawPrice, refetch: refetchDrawPrice } = useReadContract({
        address: LocalUtils.ZODIAC_EXCHANGER_ADDRESS,
        abi: LocalUtils.ZODIAC_EXCHANGER_ABI,
        functionName: 'drawPrice',
        query: { enabled: isOwner }, // Only read if user is owner
    });

    const { data: myTokenThreshold, refetch: refetchThreshold } = useReadContract({
        address: LocalUtils.ZODIAC_EXCHANGER_ADDRESS,
        abi: LocalUtils.ZODIAC_EXCHANGER_ABI,
        functionName: 'myTokenThreshold',
        query: { enabled: isOwner },
    });

    // --- Read Contract Balances ---
    const { data: contractEthBalance, refetch: refetchEthBalance } = useBalance({
        address: LocalUtils.ZODIAC_EXCHANGER_ADDRESS,
        query: { enabled: isOwner },
    });

    const { data: contractMyTokenBalance, refetch: refetchMyTokenBalance } = useBalance({
        address: LocalUtils.ZODIAC_EXCHANGER_ADDRESS,
        token: LocalUtils.MY_TOKEN_ADDRESS,
        query: { enabled: isOwner },
    });

    // --- Admin Write Functions ---

    const updateDrawPrice = (newPrice: string) => {
        reset();
        setStatus(`Setting draw price to ${newPrice} ETH...`);
        writeContract({
            address: LocalUtils.ZODIAC_EXCHANGER_ADDRESS,
            abi: LocalUtils.ZODIAC_EXCHANGER_ABI,
            functionName: 'setDrawPrice',
            args: [parseEther(newPrice)],
        });
    };

    const updateMyTokenThreshold = (newThreshold: string) => {
        reset();
        setStatus(`Setting threshold to ${newThreshold} MTK...`);
        writeContract({
            address: LocalUtils.ZODIAC_EXCHANGER_ADDRESS,
            abi: LocalUtils.ZODIAC_EXCHANGER_ABI,
            functionName: 'setMyTokenThreshold',
            args: [parseEther(newThreshold)],
        });
    };

    const withdrawFunds = () => {
        reset();
        setStatus(`Withdrawing ${formatEther(contractEthBalance?.value ?? 0n)} ETH...`);
        writeContract({
            address: LocalUtils.ZODIAC_EXCHANGER_ADDRESS,
            abi: LocalUtils.ZODIAC_EXCHANGER_ABI,
            functionName: 'withdrawFunds',
        });
    };
    const airdropSingle = (user: string, zodiacId: string) => {
        if (!user || !zodiacId) return;
        reset();
        setStatus(`Airdropping Zodiac #${zodiacId} to ${user.slice(0, 6)}...`);
        writeContract({
            address: LocalUtils.ZODIAC_EXCHANGER_ADDRESS,
            abi: LocalUtils.ZODIAC_EXCHANGER_ABI,
            functionName: 'drawSpecificZodiac',
            args: [user as `0x${string}`, BigInt(zodiacId)],
        });
    };

    const airdropBatch = (users: string[], zodiacIds: string[]) => {
        if (users.length === 0 || users.length !== zodiacIds.length) return;
        reset();
        setStatus(`Airdropping ${users.length} NFTs in a batch...`);
        writeContract({
            address: LocalUtils.ZODIAC_EXCHANGER_ADDRESS,
            abi: LocalUtils.ZODIAC_EXCHANGER_ABI,
            functionName: 'drawSpecificZodiacBatch',
            args: [
                users as `0x${string}`[],
                zodiacIds.map(id => BigInt(id))
            ],
        });
    };

    // Refetch data after a successful transaction
    useWaitForTransactionReceipt({
        hash,
        onSuccess: () => {
            setStatus('Transaction successful!');
            refetchDrawPrice();
            refetchThreshold();
            refetchEthBalance();
            refetchMyTokenBalance();
        }
    });

    return {
        isOwner,

        // Contract state
        drawPrice,
        myTokenThreshold,
        contractEthBalance,
        contractMyTokenBalance,

        // Write actions
        updateDrawPrice,
        updateMyTokenThreshold,
        withdrawFunds,
        airdropSingle,
        airdropBatch,
        // Transaction status
        isPending: isPending || isConfirming,
        status,
        error: writeError,
        hash,
    };
}
