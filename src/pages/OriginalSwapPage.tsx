// src/App.tsx

import {useState, useEffect} from 'react';
import {parseUnits, type Address} from 'viem';
import {
    useAccount,
    useWriteContract,
    useWaitForTransactionReceipt
} from 'wagmi';
import {readContract} from 'wagmi/actions';
import {BaseError} from 'viem'
import {config} from "../wagmi.ts";
import LocalUtils from "../utils/LocalUtils.ts";
import {useNavigate} from "react-router-dom";
import {APP_ROUTES} from "../constants/routes.ts";

export default function OriginalSwapPage() {
    const {isConnected} = useAccount();
    const [usdtAmount, setUsdtAmount] = useState('');
    const [status, setStatus] = useState('Please connect your wallet.');
    const [lastTxHash, setLastTxHash] = useState<Address | undefined>(undefined);
    const navigate = useNavigate();
    // --- Wagmi Hooks for writing to contracts ---
    const {data: approveHash, writeContract: approve, isPending: isApproving, error: approveError} = useWriteContract();
    const {data: buyHash, writeContract: buyTokens, isPending: isBuying, error: buyError} = useWriteContract();

    // --- Traditional Buy Flow (Approve + Buy) ---
    const handleBuyTokens = async () => {
        if (!usdtAmount || !isConnected) return;
        setLastTxHash(undefined); // Reset previous transaction hash

        try {
            // Read the decimals of the token to correctly parse the amount
            const decimals = await readContract(config, {
                abi: LocalUtils.USDT_ABI,
                address: LocalUtils.USDT_CONTRACT_ADDRESS,
                functionName: 'decimals'
            });
            const decimalsNumber = Number(decimals);
            const amountInWei = parseUnits(usdtAmount, decimalsNumber);

            // Trigger the approve transaction
            approve({
                address: LocalUtils.USDT_CONTRACT_ADDRESS,
                abi: LocalUtils.USDT_ABI,
                functionName: 'approve',
                args: [LocalUtils.TOKEN_SWAP_CONTRACT_ADDRESS, amountInWei],
            });
        } catch (e) {
            console.error("Error during transaction preparation:", e);
            setStatus("Error: Could not fetch token info. Check console.");
        }
    };

    // This hook waits for the 'approve' transaction to be confirmed on the blockchain
    const {
        isSuccess: isApproveConfirmed,
        isLoading: isConfirmingApprove
    } = useWaitForTransactionReceipt({hash: approveHash});

    // This effect runs automatically when the 'approve' transaction is confirmed
    useEffect(() => {
        if (isApproveConfirmed && usdtAmount) {
            // Now that approval is granted, we can trigger the actual 'buy' transaction
            readContract(config, {
                abi: LocalUtils.USDT_ABI,
                address: LocalUtils.USDT_CONTRACT_ADDRESS,
                functionName: 'decimals'
            })
                .then(decimals => {
                    const decimalsNumber = Number(decimals);
                    const amountInWei = parseUnits(usdtAmount, decimalsNumber);
                    buyTokens({
                        address: LocalUtils.TOKEN_SWAP_CONTRACT_ADDRESS,
                        abi: LocalUtils.TOKEN_SWAP_ABI,
                        functionName: 'buyTokens',
                        args: [amountInWei],
                    });
                });
        }
    }, [isApproveConfirmed, usdtAmount, buyTokens]);


    // --- Status and Error Management ---
    // This effect watches all transaction states and updates the status message for the user
    useEffect(() => {
        if (isApproving) {
            setStatus('1/2: Requesting approval in your wallet...');
        } else if (isConfirmingApprove) {
            setStatus('1/2: Approval sent, waiting for confirmation...');
        } else if (isBuying) {
            setStatus('2/2: Approval confirmed! Executing purchase...');
        } else if (buyHash) {
            setStatus('Success! Purchase complete.');
            setLastTxHash(buyHash);
        } else if (isConnected) {
            setStatus('Wallet connected. Ready to swap.');
        } else {
            setStatus('Please connect your wallet.');
        }

        const error = approveError || buyError;
        if (error instanceof BaseError) {
            // viem/wagmi 的特定错误
            const message = error.shortMessage ?? error.message;
            const finalMessage = message.includes('User rejected')
                ? 'Transaction rejected by user.'
                : message;
            setStatus(`Error: ${finalMessage}`);
        } else if (error) {
            // 其他通用错误
            setStatus(`Error: ${error.message}`);
        }

    }, [
        isConnected, isApproving, isConfirmingApprove, isBuying, buyHash, approveError, buyError
    ]);

    // A single flag to disable UI elements while any transaction is in progress
    const isActionPending = isApproving || isConfirmingApprove || isBuying;

    return (
        <div className="container">
            <header>
                <h1>Token Swap</h1>
                {/* Web3Modal's button handles all wallet connection logic */}
                <w3m-button/>
                <button onClick={() => navigate(APP_ROUTES.ANTD_SWAP)}>跳转到 AntdSwapPage</button>
                <button onClick={() => navigate(APP_ROUTES.AntdDeposit)}>跳转到 AntdDeposit</button>
                <button onClick={() => navigate(APP_ROUTES.AntdZodiac)}>跳转到 抽奖</button>
                <button onClick={() => navigate(APP_ROUTES.Admin)}>跳转Admin</button>
                <button onClick={() => navigate(APP_ROUTES.UniSwap)}>跳转UniSwap</button>
            </header>

            {isConnected && (
                <main className="swap-panel">
                    <input
                        type="number"
                        className="input-amount"
                        placeholder="USDT Amount"
                        value={usdtAmount}
                        onChange={(e) => setUsdtAmount(e.target.value)}
                        disabled={isActionPending}
                    />
                    <div className="button-group">
                        <button
                            onClick={handleBuyTokens}
                            disabled={!usdtAmount || isActionPending}
                            className="permit" // Applies the blue style
                        >
                            {isActionPending ? 'Processing...' : 'Buy Tokens'}
                        </button>
                    </div>
                </main>
            )}

            <footer>
                <p>Status: {status}</p>
                {lastTxHash && (
                    <a href={`https://polygonscan.com/tx/${lastTxHash}`} target="_blank" rel="noopener noreferrer">
                        View Last Transaction on Polygonscan
                    </a>
                )}
            </footer>
        </div>
    );
}
