import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, decodeEventLog, type Address, BaseError } from 'viem';
import LocalUtils from "../utils/LocalUtils.ts";


/**
 * 一个自定义 Hook，封装了调用 `drawZodiac` 函数的完整逻辑。
 * @param onDrawSuccess - 可选的回调函数，在抽奖成功并解析出 ID 后执行。
 */
export function useZodiacDraw(onDrawSuccess?: () => void) {
    const [status, setStatus] = useState('Ready to draw.');
    const [drawnZodiacId, setDrawnZodiacId] = useState<number | null>(null);
    const [error, setError] = useState<BaseError | null>(null);

    // Wagmi Hook 用于发送交易
    const { data: hash, writeContract: draw, isPending: isSending, error: writeError, reset } = useWriteContract();

    // Wagmi Hook 用于等待交易确认
    const { data: receipt, isLoading: isConfirming, error: receiptError } = useWaitForTransactionReceipt({
        hash,
        onSuccess: (data) => {
            console.log("Transaction confirmed! Receipt:", data);
            console.log("Logs in receipt:", data.logs);

            try {
                // 尝试从日志中找到并解码 Draw 事件
                const drawEvent = data.logs
                    .map(log => {
                        try {
                            const decoded = decodeEventLog({
                                abi: LocalUtils.ZODIAC_EXCHANGER_ABI,
                                eventName: 'Draw',
                                data: log.data,
                                topics: log.topics,
                            });
                            console.log("Attempting to decode log:", log, "Decoded:", decoded);
                            return decoded;
                        } catch {
                            return null; // 如果解码失败，返回 null
                        }
                    })
                    .find(decoded => decoded?.eventName === 'Draw'); // 找到第一个成功解码的 Draw 事件

                console.log("Found Draw event:", drawEvent);

                if (drawEvent) {
                    const id = Number(drawEvent.args.zodiacId);
                    console.log(`Successfully parsed Zodiac ID: ${id}. Setting state...`);
                    setDrawnZodiacId(id);
                    setStatus(`Success! You drew Zodiac #${id}!`);
                    onDrawSuccess?.(); // 执行成功回调，例如刷新余额
                } else {
                    console.error("Could not find or decode the 'Draw' event in the transaction logs.");
                    setStatus('Draw successful, but could not parse the event.');
                }
            } catch (e) {
                console.error("Failed to decode event:", e);
                setStatus('Transaction confirmed, but event parsing failed.');
            }
        },
        onError: (err) => {
            console.error("Error waiting for transaction receipt:", err);
            setStatus('Transaction failed during confirmation.');
        }
    });
    useEffect(() => {
        // 只有当 receipt 存在（即交易已确认）时才执行
        if (receipt) {
            console.log("Transaction confirmed! Receipt:", receipt);
            console.log("Logs in receipt:", receipt.logs);

            // ... (这里是与之前 onSuccess 中完全相同的事件解析逻辑)
            try {
                const drawEvent = receipt.logs.map(log => {
                    try {
                        const decoded = decodeEventLog({
                            abi: LocalUtils.ZODIAC_EXCHANGER_ABI,
                            eventName: 'Draw',
                            data: log.data,
                            topics: log.topics,
                        });
                        console.log("Attempting to decode log:", log, "Decoded:", decoded);
                        return decoded;
                    } catch {
                        return null; // 如果解码失败，返回 null
                    }
                }).find(Boolean);

                if (drawEvent) {
                    const id = Number(drawEvent.args.zodiacId);
                    setDrawnZodiacId(id);
                    setStatus(`Success! You drew Zodiac #${id}!`);
                    onDrawSuccess?.();
                } else {
                    console.error("Could not find or decode the 'Draw' event in the transaction logs.");
                    setStatus('Draw successful, but could not parse the event.');
                }
            } catch (e) {
                console.error("Failed to decode event:", e);
                setStatus('Transaction confirmed, but event parsing failed.');
            }
        }
    }, [receipt, onDrawSuccess]); // 依赖数组确保只在 receipt 出现时执行一次

    /**
     * 启动抽奖流程的函数
     */
    const executeDraw = () => {
        // 1. 重置所有先前的状态，为新的抽奖做准备
        reset(); // 重置 useWriteContract Hook 的状态 (hash, error)
        setError(null);
        setDrawnZodiacId(null);
        setStatus('Requesting in wallet...');

        // 2. 调用 writeContract 来触发钱包
        draw({
            address: LocalUtils.ZODIAC_EXCHANGER_ADDRESS,
            abi: LocalUtils.ZODIAC_EXCHANGER_ABI,
            functionName: 'drawZodiac',
            // value: parseEther('0.01'), // 发送 0.01 ETH 作为抽奖费用
        });
    };

    // 统一处理加载状态
    const isPending = isSending || isConfirming;

    // 统一处理错误和状态文本
    useEffect(() => {
        const combinedError = writeError || receiptError;
        if (combinedError) {
            setError(combinedError as BaseError);
            if (combinedError.message.includes('User rejected')) {
                setStatus('Transaction rejected by user.');
            } else {
                setStatus('An error occurred.');
            }
            return;
        }

        if (isSending) {
            setStatus('Sending transaction...');
        } else if (isConfirming) {
            setStatus('Transaction sent, waiting for confirmation...');
        } else if (!hash) {
            // 在成功或失败后，如果 drawnZodiacId 没有被设置，就回到初始状态
            if (!drawnZodiacId) {
                setStatus('Ready to draw.');
            }
        }
    }, [isSending, isConfirming, writeError, receiptError, hash, drawnZodiacId]);

    return {
        executeDraw,
        isPending,
        status,
        drawnZodiacId,
        hash: hash as Address | undefined,
        error,
    };
}
