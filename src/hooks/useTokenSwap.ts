// src/hooks/useTokenSwap.ts

import { useState, useEffect } from 'react';
import { type Address, BaseError } from 'viem';
import {
    useWriteContract,
    useWaitForTransactionReceipt
} from 'wagmi';
import { config } from '../wagmi';
import LocalUtils from '../utils/LocalUtils';
import { parseTokenAmount } from '../utils/Web3Utils.ts';

interface UseTokenSwapProps {
    amount: string; // 用户输入的数量
}

/**
 * 封装了 "Approve + Buy" 完整流程的自定义 Hook。
 */
export function useTokenSwap({ amount }: UseTokenSwapProps) {
    const [status, setStatus] = useState('Ready to swap.');
    const [txHash, setTxHash] = useState<Address | undefined>();
    const [error, setError] = useState<string | null>(null);

    // Wagmi hooks for contract interactions
    const { data: approveHash, writeContract: approve, isPending: isApproving, error: approveError } = useWriteContract();
    const { data: buyHash, writeContract: buyTokens, isPending: isBuying, error: buyError } = useWriteContract();
    const { isSuccess: isApproveConfirmed, isLoading: isConfirmingApprove } = useWaitForTransactionReceipt({ hash: approveHash });

    // 核心功能：执行交换流程
    const executeSwap = async () => {
        if (!amount) {
            setError("Please enter an amount.");
            return;
        }
        setError(null);
        setTxHash(undefined);

        try {
            const amountInWei = await parseTokenAmount(config, LocalUtils.USDT_CONTRACT_ADDRESS, amount);

            // 1. 触发 approve
            approve({
                address: LocalUtils.USDT_CONTRACT_ADDRESS,
                abi: LocalUtils.USDT_ABI,
                functionName: 'approve',
                args: [LocalUtils.TOKEN_SWAP_CONTRACT_ADDRESS, amountInWei],
            });
        } catch (e) {
            console.error("Error during transaction preparation:", e);
            setError(e instanceof Error ? e.message : "Preparation failed.");
        }
    };

    // 2. 当 approve 成功后，自动触发 buy
    useEffect(() => {
        if (isApproveConfirmed && amount) {
            (async () => {
                try {
                    const amountInWei = await parseTokenAmount(config, LocalUtils.USDT_CONTRACT_ADDRESS, amount);
                    buyTokens({
                        address: LocalUtils.TOKEN_SWAP_CONTRACT_ADDRESS,
                        abi: LocalUtils.TOKEN_SWAP_ABI,
                        functionName: 'buyTokens',
                        args: [amountInWei],
                    });
                } catch (e) {
                    console.error("Error preparing buy transaction:", e);
                    setError(e instanceof Error ? e.message : "Buy preparation failed.");
                }
            })();
        }
    }, [isApproveConfirmed, amount, buyTokens]);

    // 3. 集中管理状态和错误信息
    useEffect(() => {
        const combinedError = approveError || buyError;
        if (combinedError) {
            if (combinedError instanceof BaseError) {
                const message = combinedError.shortMessage ?? combinedError.message;
                setError(message.includes('User rejected') ? 'Transaction rejected by user.' : message);
            } else {
                setError(combinedError.message);
            }
            return; // 有错误时，优先显示错误信息
        }

        if (isApproving) setStatus('1/2: Requesting approval in wallet...');
        else if (isConfirmingApprove) setStatus('1/2: Approving, waiting for confirmation...');
        else if (isBuying) setStatus('2/2: Approval confirmed! Executing purchase...');
        else if (buyHash) {
            setStatus('Success! Purchase complete.');
            setTxHash(buyHash);
        }
        else setStatus('Ready to swap.');

    }, [isApproving, isConfirmingApprove, isBuying, buyHash, approveError, buyError]);

    const isPending = isApproving || isConfirmingApprove || isBuying;

    return { executeSwap, status, isPending, txHash, error };
}
