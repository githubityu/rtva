import { useState, useEffect } from 'react';
import {type Address, BaseError, parseEther, parseSignature, getAddress} from 'viem';

import {
    useAccount,
    useChainId,
    useSignTypedData,
    useWriteContract,
    useWaitForTransactionReceipt,
} from 'wagmi';
import { readContract } from '@wagmi/core';
import { config } from '../wagmi';
import LocalUtils from "../utils/LocalUtils.ts"; // Your wagmi config


interface UseTokenDepositProps {
    amount: string;
}

/**
 * Encapsulates the "Sign Permit + Deposit" flow using a declarative, hook-based approach.
 */
export function useTokenDeposit({ amount }: UseTokenDepositProps) {
    const { address: userAddress } = useAccount();
    const chainId = useChainId();

    const [status, setStatus] = useState('Ready to deposit.');
    const [txHash, setTxHash] = useState<Address | undefined>();
    const [error, setError] = useState<string | null>(null);

    // --- Wagmi hooks for each step of the process ---

    // 1. Hook for the OFF-CHAIN signing step
    const { data: signature, signTypedData, isPending: isSigning, error: signError } = useSignTypedData();

    // 2. Hook for the ON-CHAIN deposit transaction
    const { data: depositHash, writeContract: deposit, isPending: isDepositing, error: depositError } = useWriteContract();

    // 3. Hook to wait for the deposit transaction to be confirmed
    const { isLoading: isConfirmingDeposit } = useWaitForTransactionReceipt({ hash: depositHash });

    // --- Core function to INITIATE the flow ---
    const executeDeposit = async () => {
        if (!amount || !userAddress) {
            setError("Please connect wallet and enter an amount.");
            return;
        }
        setError(null);
        setTxHash(undefined);

        try {
            // This function's only job is to prepare and trigger the FIRST step: signing.
            const nonce = await readContract(config, {
                address: LocalUtils.MY_TOKEN_ADDRESS,
                abi: LocalUtils.MY_TOKEN_ABI,
                functionName: 'nonces',
                args: [userAddress],
            });

            const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
            const parsedAmount = parseEther(amount);

            const domain = {
                name: 'MyToken', // Must match the name in your token's ERC20Permit constructor
                version: '1',
                chainId: chainId,
                verifyingContract: getAddress(LocalUtils.MY_TOKEN_ADDRESS),
            };

            const types = {
                Permit: [
                    { name: 'owner', type: 'address' },
                    { name: 'spender', type: 'address' },
                    { name: 'value', type: 'uint256' },
                    { name: 'nonce', type: 'uint256' },
                    { name: 'deadline', type: 'uint256' },
                ],
            } as const;

            signTypedData({
                domain,
                types,
                primaryType: 'Permit',
                message: {
                    owner: userAddress,
                    spender: LocalUtils.DEPOSIT_CONTRACT_ADDRESS,
                    value: parsedAmount,
                    nonce: nonce,
                    deadline: deadline,
                },
            });
        } catch (e) {
            console.error("Error during signature preparation:", e);
            setError(e instanceof Error ? e.message : "Preparation failed.");
        }
    };

    // --- Chaining Logic using useEffect ---

    // This effect listens for a successful signature.
    // When a signature is available, it triggers the NEXT step: the deposit transaction.
    useEffect(() => {
        if (signature && amount && userAddress) {
            (async () => {
                try {
                    const { v, r, s } = parseSignature(signature);
                    const parsedAmount = parseEther(amount);
                    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // Recalculate or store from previous step

                    deposit({
                        address: LocalUtils.DEPOSIT_CONTRACT_ADDRESS,
                        abi: LocalUtils.DEPOSIT_CONTRACT_ABI,
                        functionName: 'depositWithPermit',
                        args: [parsedAmount, deadline, v, r, s],
                    });
                } catch (e) {
                    console.error("Error preparing deposit transaction:", e);
                    setError(e instanceof Error ? e.message : "Deposit preparation failed.");
                }
            })();
        }
    }, [signature, amount, userAddress, deposit]); // Dependency array ensures this runs only when a new signature is created


    // --- Centralized Status and Error Management ---

    // This effect listens to the state of all hooks and updates the UI-facing status.
    useEffect(() => {
        const combinedError = signError || depositError;
        if (combinedError) {
            if (combinedError instanceof BaseError) {
                const message = combinedError.shortMessage ?? combinedError.message;
                setError(message.includes('User rejected') ? 'Action rejected by user.' : message);
            } else {
                setError(combinedError.message);
            }
            return; // Prioritize showing the error
        }

        if (isSigning) setStatus('1/2: Waiting for signature in wallet...');
        else if (isDepositing) setStatus('2/2: Signature received! Executing deposit...');
        else if (isConfirmingDeposit) setStatus('2/2: Depositing, waiting for confirmation...');
        else if (depositHash) {
            setStatus('Success! Deposit complete.');
            setTxHash(depositHash);
        }
        else setStatus('Ready to deposit.');

    }, [isSigning, isDepositing, isConfirmingDeposit, depositHash, signError, depositError]);

    // Combined pending state for the UI
    const isPending = isSigning || isDepositing || isConfirmingDeposit;

    return { executeDeposit, status, isPending, txHash, error };
}
