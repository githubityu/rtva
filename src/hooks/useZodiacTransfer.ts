import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import {type Address } from 'viem';
import LocalUtils from "../utils/LocalUtils.ts";

// Hook 的输入参数
interface ZodiacTransferProps {
    from: Address | undefined;
    to: string;
    id: string;
    amount: string;
}

export function useZodiacTransfer() {
    const {
        data: hash,
        writeContract: transfer,
        isPending: isSending,
        error: writeError,
        reset
    } = useWriteContract();

    const {
        isLoading: isConfirming,
        isSuccess,
        error: receiptError
    } = useWaitForTransactionReceipt({ hash });

    const executeTransfer = ({ from, to, id, amount }: ZodiacTransferProps) => {
        if (!from || !to || !id || !amount) {
            console.error("Missing transfer arguments");
            return;
        }

        reset();

        transfer({
            address: LocalUtils.ZODIAC_NFT_ADDRESS,
            abi: LocalUtils.ZODIAC_NFT_ABI,
            functionName: 'safeTransferFrom',
            args: [
                from,               // from: 连接的钱包地址
                to as Address,      // to: 接收方地址
                BigInt(id),         // id: 要转账的生肖 ID
                BigInt(amount),     // amount: 数量
                '0x'                // data: 留空
            ],
        });
    };

    const isPending = isSending || isConfirming;
    const error = writeError || receiptError;

    return { executeTransfer, isPending, isSuccess, hash, error };
}
