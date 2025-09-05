import { useState, useEffect } from 'react';
import { useAccount, useBalance, useReadContract, useWriteContract, useConfig } from 'wagmi';
import { waitForTransactionReceipt } from '@wagmi/core';
import { parseUnits, formatUnits, maxUint256 } from 'viem';
import { App} from 'antd';
import { erc20Abi } from 'viem';

// 从你的工具文件中导入常量
import {ROUTER_ADDRESS, ROUTER_ABI, TOKENS, FACTORY_ABI, FACTORY_ADDRESS} from '../utils/uniswapContracts.ts';


// =================================================================================================
// 1. 自定义 HOOK: useUniswapSwap (无需改动)
// =================================================================================================
export function useUniswapSwap() {
    const { address } = useAccount();
    const config = useConfig();
    const { message } = App.useApp();

    const [tokenInSymbol, setTokenInSymbol] = useState('ETH');
    const [tokenOutSymbol, setTokenOutSymbol] = useState('DAI');
    const [amountIn, setAmountIn] = useState('');
    const [status, setStatus] = useState<'idle' | 'approving' | 'swapping'>('idle');

    const tokenInAddress = TOKENS[tokenInSymbol].address;
    const tokenOutAddress = TOKENS[tokenOutSymbol].address;

    const { data: balanceIn, refetch: refetchBalanceIn } = useBalance({ address, token: tokenInSymbol === 'ETH' ? undefined : tokenInAddress });
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: tokenInAddress, abi: erc20Abi, functionName: 'allowance', args: [address!, ROUTER_ADDRESS],
        query: { enabled: !!address && tokenInSymbol !== 'ETH' },
    });
    const { data: amountsOut, isLoading: isQuoting } = useReadContract({
        address: ROUTER_ADDRESS, abi: ROUTER_ABI, functionName: 'getAmountsOut',
        args: [parseUnits(amountIn || '0', 18), [tokenInAddress, tokenOutAddress]],
        query: { enabled: !!amountIn && parseFloat(amountIn) > 0, select: (data) => data?.[1] },
    });

    const amountOut = amountsOut ? formatUnits(amountsOut, 18) : '';

    const { writeContractAsync } = useWriteContract();

    const handleSetMax = () => {
        if (!balanceIn) return;
        if (tokenInSymbol === 'ETH') {
            const gasReserve = 0.01;
            const maxAmount = parseFloat(balanceIn.formatted) - gasReserve;
            setAmountIn(maxAmount > 0 ? maxAmount.toFixed(18) : '0');
        } else {
            setAmountIn(balanceIn.formatted);
        }
    };

    const handleSwap = async () => {
        if (!amountIn || !amountOut || !address) return;
        const needsApproval = tokenInSymbol !== 'ETH' && allowance !== undefined && parseUnits(amountIn, 18) > allowance;
        if (needsApproval) {
            try {
                setStatus('approving');
                message.info(`正在授权 ${tokenInSymbol}...`);
                const approveHash = await writeContractAsync({
                    address: tokenInAddress, abi: erc20Abi, functionName: 'approve', args: [ROUTER_ADDRESS, maxUint256],
                });
                await waitForTransactionReceipt(config, { hash: approveHash });
                await refetchAllowance();
                message.success(`${tokenInSymbol} 授权成功!`);
            } catch (err) { message.error(err.shortMessage || '授权失败。'); setStatus('idle'); return; }
        }
        try {
            setStatus('swapping');
            message.info('正在发送交换交易...');
            const functionName = tokenInSymbol === 'ETH' ? 'swapExactETHForTokens' : 'swapExactTokensForTokens';
            const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
            const amountOutMin = parseUnits((parseFloat(amountOut) * 0.995).toFixed(18), 18);
            const args = tokenInSymbol === 'ETH'
                ? [amountOutMin, [tokenInAddress, tokenOutAddress], address, deadline]
                : [parseUnits(amountIn, 18), amountOutMin, [tokenInAddress, tokenOutAddress], address, deadline];

            const swapHash = await writeContractAsync({
                address: ROUTER_ADDRESS, abi: ROUTER_ABI, functionName, args,
                value: tokenInSymbol === 'ETH' ? parseUnits(amountIn, 18) : 0n,
            });
            await waitForTransactionReceipt(config, { hash: swapHash });
            message.success('交换成功!');
            setAmountIn('');
            refetchBalanceIn();
        } catch (err) { message.error(err.shortMessage || '交换失败。');
        } finally { setStatus('idle'); }
    };

    return {
        tokenInSymbol, setTokenInSymbol, tokenOutSymbol, setTokenOutSymbol,
        amountIn, setAmountIn, amountOut, balanceIn,
        handleSwap, handleSetMax, isQuoting,
        isLoading: status !== 'idle',
        getButtonText: () => {
            if (status === 'approving') return `正在授权 ${tokenInSymbol}...`;
            if (status === 'swapping') return '正在交换...';
            const needsApproval = tokenInSymbol !== 'ETH' && allowance !== undefined && parseUnits(amountIn || '0', 18) > allowance;
            return needsApproval ? `授权并交换` : '交换 (Swap)';
        }
    };
}






export  function useUniswapLiquidity() {
    const { address } = useAccount();
    const config = useConfig();
    const { message } = App.useApp();

    const [tokenASymbol, setTokenASymbol] = useState('ETH');
    const [tokenBSymbol, setTokenBSymbol] = useState('DAI');
    const [amountA, setAmountA] = useState('');
    const [amountB, setAmountB] = useState('');
    const [lastEdited, setLastEdited] = useState<'A' | 'B' | null>(null);
    const [status, setStatus] = useState<'idle' | 'approvingA' | 'approvingB' | 'supplying'>('idle');

    const tokenAAddress = TOKENS[tokenASymbol].address;
    const tokenBAddress = TOKENS[tokenBSymbol].address;

    const { data: balanceA, refetch: refetchBalanceA } = useBalance({ address, token: tokenASymbol === 'ETH' ? undefined : tokenAAddress });
    const { data: balanceB, refetch: refetchBalanceB } = useBalance({ address, token: tokenBSymbol === 'ETH' ? undefined : tokenBAddress });
    const { data: allowanceA, refetch: refetchAllowanceA } = useReadContract({
        address: tokenAAddress, abi: erc20Abi, functionName: 'allowance', args: [address!, ROUTER_ADDRESS],
        query: { enabled: !!address && tokenASymbol !== 'ETH' },
    });
    const { data: allowanceB, refetch: refetchAllowanceB } = useReadContract({
        address: tokenBAddress, abi: erc20Abi, functionName: 'allowance', args: [address!, ROUTER_ADDRESS],
        query: { enabled: !!address && tokenBSymbol !== 'ETH' },
    });

    const { data: pairAddress, isLoading: isLoadingPair } = useReadContract({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: 'getPair',
        args: [tokenAAddress, tokenBAddress],
        query: { enabled: !!address && tokenASymbol !== tokenBSymbol },
    });
    const poolExists = pairAddress && pairAddress !== '0x0000000000000000000000000000000000000000';

    const { data: amountBQuote, isLoading: isLoadingBQuote } = useReadContract({
        address: ROUTER_ADDRESS, abi: ROUTER_ABI, functionName: 'getAmountsOut',
        args: [parseUnits(amountA || '0', 18), [tokenAAddress, tokenBAddress]],
        query: { enabled: !!address && poolExists && lastEdited === 'A' && parseFloat(amountA || '0') > 0 },
    });
    const { data: amountAQuote, isLoading: isLoadingAQuote } = useReadContract({
        address: ROUTER_ADDRESS, abi: ROUTER_ABI, functionName: 'getAmountsOut',
        args: [parseUnits(amountB || '0', 18), [tokenBAddress, tokenAAddress]],
        query: { enabled: !!address && poolExists && lastEdited === 'B' && parseFloat(amountB || '0') > 0 },
    });

    useEffect(() => {
        if (lastEdited === 'A' && amountBQuote) {
            const formattedAmountB = formatUnits(amountBQuote[1], 18);
            console.log(`[QUOTE A->B] Input A: ${amountA}, Quoted B: ${formattedAmountB}`);
            setAmountB(formattedAmountB);
        } else if (lastEdited === 'A' && (!amountA || parseFloat(amountA) === 0)) {
            setAmountB('');
        }
    }, [amountA, amountBQuote, lastEdited]);

    useEffect(() => {
        if (lastEdited === 'B' && amountAQuote) {
            const formattedAmountA = formatUnits(amountAQuote[1], 18);
            console.log(`[QUOTE B->A] Input B: ${amountB}, Quoted A: ${formattedAmountA}`);
            setAmountA(formattedAmountA);
        } else if (lastEdited === 'B' && (!amountB || parseFloat(amountB) === 0)) {
            setAmountA('');
        }
    }, [amountB, amountAQuote, lastEdited]);

    const { writeContractAsync } = useWriteContract();

    const handleSetMax = (tokenSymbol: 'A' | 'B') => {
        if (tokenSymbol === 'A' && balanceA) {
            if (tokenASymbol === 'ETH') {
                const gasReserve = 0.01;
                const maxAmount = parseFloat(balanceA.formatted) - gasReserve;
                setAmountA(maxAmount > 0 ? maxAmount.toFixed(18) : '0');
            } else { setAmountA(balanceA.formatted); }
            setLastEdited('A');
        } else if (tokenSymbol === 'B' && balanceB) {
            if (tokenBSymbol === 'ETH') {
                const gasReserve = 0.01;
                const maxAmount = parseFloat(balanceB.formatted) - gasReserve;
                setAmountB(maxAmount > 0 ? maxAmount.toFixed(18) : '0');
            } else { setAmountB(balanceB.formatted); }
            setLastEdited('B');
        }
    };

    const handleAddLiquidity = async () => {
        console.log("===== [START] handleAddLiquidity =====");
        console.log("Current State:", { amountA, amountB, tokenASymbol, tokenBSymbol, poolExists });

        if (!amountA || !amountB || !address || parseFloat(amountA) <= 0 || parseFloat(amountB) <= 0) {
            message.warning('请输入有效的代币数量。');
            console.log("Validation failed: Invalid amounts.");
            console.log("===== [END] handleAddLiquidity (Validation Failed) =====");
            return;
        }

        const needsApprovalA = tokenASymbol !== 'ETH' && allowanceA !== undefined && parseUnits(amountA, 18) > allowanceA;
        console.log(`Check Approval A (${tokenASymbol}): Needed? ${needsApprovalA}. Allowance: ${allowanceA?.toString()}`);
        if (needsApprovalA) {
            try {
                setStatus('approvingA');
                message.info(`正在授权 ${tokenASymbol}...`);
                const approveAHash = await writeContractAsync({
                    address: tokenAAddress, abi: erc20Abi, functionName: 'approve', args: [ROUTER_ADDRESS, maxUint256],
                });
                await waitForTransactionReceipt(config, { hash: approveAHash });
                await refetchAllowanceA();
                message.success(`${tokenASymbol} 授权成功!`);
            } catch (err: any) { message.error(err.shortMessage || `授权 ${tokenASymbol} 失败。`); setStatus('idle'); return; }
        }

        const needsApprovalB = tokenBSymbol !== 'ETH' && allowanceB !== undefined && parseUnits(amountB, 18) > allowanceB;
        console.log(`Check Approval B (${tokenBSymbol}): Needed? ${needsApprovalB}. Allowance: ${allowanceB?.toString()}`);
        if (needsApprovalB) {
            try {
                setStatus('approvingB');
                message.info(`正在授权 ${tokenBSymbol}...`);
                const approveBHash = await writeContractAsync({
                    address: tokenBAddress, abi: erc20Abi, functionName: 'approve', args: [ROUTER_ADDRESS, maxUint256],
                });
                await waitForTransactionReceipt(config, { hash: approveBHash });
                await refetchAllowanceB();
                message.success(`${tokenBSymbol} 授权成功!`);
            } catch (err: any) { message.error(err.shortMessage || `授权 ${tokenBSymbol} 失败。`); setStatus('idle'); return; }
        }

        try {
            setStatus('supplying');
            message.info('正在发送添加流动性的交易...');
            const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

            let functionName: 'addLiquidity' | 'addLiquidityETH' = 'addLiquidity';
            let args: any[] = [];
            let value = 0n;

            if (tokenASymbol === 'ETH' || tokenBSymbol === 'ETH') {
                functionName = 'addLiquidityETH';

                const ethAmountString = tokenASymbol === 'ETH' ? amountA : amountB;
                const tokenAmountString = tokenASymbol === 'ETH' ? amountB : amountA;
                const tokenAddress = tokenASymbol === 'ETH' ? tokenBAddress : tokenAAddress;

                const amountTokenDesired = parseUnits(tokenAmountString, 18);
                const amountETHDesired = parseUnits(ethAmountString, 18);

                const slippage = 5n;
                const amountTokenMin = (amountTokenDesired * (100n - slippage)) / 100n;
                const amountETHMin = (amountETHDesired * (100n - slippage)) / 100n;

                args = [
                    tokenAddress,
                    amountTokenDesired,
                    amountTokenMin,
                    amountETHMin,
                    address,
                    deadline
                ];
                value = amountETHDesired;

                console.log("--- Preparing addLiquidityETH call ---");
                console.log("Token Address:", tokenAddress);
                console.log("amountTokenDesired:", amountTokenDesired.toString());
                console.log("amountTokenMin:", amountTokenMin.toString());
                console.log("amountETHMin:", amountETHMin.toString());
                console.log("Value (ETH to send):", value.toString());

            } else {
                functionName = 'addLiquidity';
                const amountADesired = parseUnits(amountA, 18);
                const amountBDesired = parseUnits(amountB, 18);
                const slippage = 5n;
                const amountAMin = (amountADesired * (100n - slippage)) / 100n;
                const amountBMin = (amountBDesired * (100n - slippage)) / 100n;

                args = [tokenAAddress, tokenBAddress, amountADesired, amountBDesired, amountAMin, amountBMin, address, deadline];

                console.log("--- Preparing addLiquidity call ---");
                // ... (可以添加更多 addLiquidity 的日志)
            }

            console.log("Final Parameters to Send:", { functionName, args: args.map(a => a.toString()), value: value.toString() });
            console.log("=========================================");

            const supplyHash = await writeContractAsync({ address: ROUTER_ADDRESS, abi: ROUTER_ABI, functionName, args, value });
            await waitForTransactionReceipt(config, { hash: supplyHash });

            message.success('流动性添加成功!');
            setAmountA('');
            setAmountB('');
            refetchBalanceA();
            refetchBalanceB();
        } catch (err: any) {
            console.error("添加流动性错误:", err);
            message.error(err.shortMessage || '添加流动性失败。');
        } finally {
            setStatus('idle');
        }
    };

    return {
        tokenASymbol, setTokenASymbol, tokenBSymbol, setTokenBSymbol,
        amountA, setAmountA, amountB, setAmountB,
        balanceA, balanceB,
        lastEdited, setLastEdited,
        handleSetMax,
        handleAddLiquidity,
        isLoading: isLoadingPair || (poolExists && (isLoadingAQuote || isLoadingBQuote)) || status !== 'idle',
        poolExists,
        getButtonText: () => {
            if (status === 'approvingA') return `正在授权 ${tokenASymbol}...`;
            if (status === 'approvingB') return `正在授权 ${tokenBSymbol}...`;
            if (status === 'supplying') return '正在添加流动性...';
            return '提供流动性 (Supply)';
        }
    };
}

