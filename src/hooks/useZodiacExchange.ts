// hooks/useZodiacExchange.ts

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { type BaseError, type Address } from 'viem';
import LocalUtils from "../utils/LocalUtils.ts";

/**
 * 一个自定义 Hook，封装了“授权”和“兑换”的两步流程。
 * @param onExchangeSuccess - 可选的回调函数，在兑换成功后执行。
 */
export function useZodiacExchange(onExchangeSuccess?: () => void) {
    const [status, setStatus] = useState('Ready to exchange.');
    const [error, setError] = useState<BaseError | null>(null);

    // --- Wagmi Hooks for each transaction step ---

    // 步骤 1: setApprovalForAll 交易
    const {
        data: approveHash,
        writeContract: approve,
        isPending: isApproving,
        error: approveError,
        reset: resetApprove
    } = useWriteContract();

    const {
        isLoading: isConfirmingApprove,
        isSuccess: isApproveConfirmed,
        error: approveReceiptError
    } = useWaitForTransactionReceipt({ hash: approveHash });

    // 步骤 2: exchangeForMyToken 交易
    const {
        data: exchangeHash,
        writeContract: exchange,
        isPending: isExchanging,
        error: exchangeError,
        reset: resetExchange
    } = useWriteContract();

    const {
        isLoading: isConfirmingExchange,
        isSuccess: isExchangeConfirmed, // 解构出最终的成功状态
        error: exchangeReceiptError
    } = useWaitForTransactionReceipt({
        hash: exchangeHash,
    });

    /**
     * 启动兑换流程的核心函数。它只负责触发第一步：授权。
     */
    const executeExchange = () => {
        // 重置所有状态，为新流程做准备
        resetApprove();
        resetExchange();
        setError(null);
        setStatus('Requesting approval in wallet...');

        const approveArgs = {
            address: LocalUtils.ZODIAC_NFT_ADDRESS,
            abi: LocalUtils.ZODIAC_NFT_ABI,
            functionName: 'setApprovalForAll' as const,
            args: [LocalUtils.ZODIAC_EXCHANGER_ADDRESS, true],
        };

        try {
            approve(approveArgs);
        } catch (e) {
            console.error("A synchronous error occurred when trying to trigger 'approve':", e);
            setStatus('Error preparing approval transaction.');
            if (e instanceof BaseError) setError(e);
        }
    };

    /**
     * 声明式的流程控制：当授权交易被确认后，自动触发第二步 -> 兑换。
     */
    useEffect(() => {
        if (isApproveConfirmed && !exchangeHash && !isExchanging) {
            setStatus('Approval confirmed! Executing exchange...');
            const exchangeArgs = {
                address: LocalUtils.ZODIAC_EXCHANGER_ADDRESS,
                abi: LocalUtils.ZODIAC_EXCHANGER_ABI,
                functionName: 'exchangeForMyToken' as const,
            };
            exchange(exchangeArgs);
        }
    }, [isApproveConfirmed, exchange, exchangeHash, isExchanging]);

    /**
     * 监听最终兑换成功事件，并执行回调
     */
    useEffect(() => {
        if (isExchangeConfirmed) {
            setStatus('Exchange successful!');
            onExchangeSuccess?.(); // 执行传入的回调，比如 refetchBalances
        }
    }, [isExchangeConfirmed, onExchangeSuccess]);

    /**
     * 统一的状态和错误管理
     */
    useEffect(() => {
        const combinedError = approveError || approveReceiptError || exchangeError || exchangeReceiptError;
        if (combinedError) {
            setError(combinedError as BaseError);
            if (combinedError.message.includes('User rejected')) {
                setStatus('Transaction rejected by user.');
            } else {
                setStatus('An error occurred.');
            }
            return;
        }

        if (isApproving) setStatus('1/2: Approving in wallet...');
        else if (isConfirmingApprove) setStatus('1/2: Waiting for approval confirmation...');
        else if (isExchanging) setStatus('2/2: Exchanging in wallet...');
        else if (isConfirmingExchange) setStatus('2/2: Waiting for exchange confirmation...');
        else if (isExchangeConfirmed) {
            setStatus('Exchange successful!');
        }
        else if (!approveHash && !exchangeHash) {
            setStatus('Ready to exchange.');
        }

    }, [
        isApproving, isConfirmingApprove, isExchanging, isConfirmingExchange,
        approveHash, exchangeHash,
        approveError, approveReceiptError, exchangeError, exchangeReceiptError,
        isExchangeConfirmed
    ]);

    // 组合的加载状态，用于 UI
    const isPending = isApproving || isConfirmingApprove || isExchanging || isConfirmingExchange;

    return {
        executeExchange,
        isPending,
        status,
        hash: (exchangeHash || approveHash) as Address | undefined,
        error,
        isSuccess: isExchangeConfirmed, // 将最终的成功状态返回
    };
}
