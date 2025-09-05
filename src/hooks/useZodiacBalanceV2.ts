import { useAccount, useReadContract } from 'wagmi';
import LocalUtils from "../utils/LocalUtils.ts";


const NUM_ZODIACS = 12;

export function useZodiacBalanceV2() {
    const { address: userAddress } = useAccount();

    // 准备 balanceOfBatch 的参数
    const accounts = Array(NUM_ZODIACS).fill(userAddress); // 创建一个包含12个用户地址的数组
    const ids = Array.from({ length: NUM_ZODIACS }, (_, i) => BigInt(i + 1)); // 创建一个 [1n, 2n, ..., 12n] 的数组

    // 使用 useReadContract 直接调用 balanceOfBatch
    const { data: balances, isLoading, isError,error, refetch } = useReadContract({
        address: LocalUtils.ZODIAC_NFT_ADDRESS,
        abi: LocalUtils.ZODIAC_NFT_ABI,
        functionName: 'balanceOfBatch',
        args: [accounts, ids], // 传入参数
        query: { enabled: !!userAddress },
    });
    // 将查询结果处理成更友好的格式
    const ownedZodiacs = balances
        ? balances.map((balance, index) => ({
            id: index + 1,
            balance: Number(balance), // balances 现在直接是一个 uint256[] 数组
        }))
        : [];
    const hasCompleteSet = ownedZodiacs.length === NUM_ZODIACS && ownedZodiacs.every(z => z.balance > 0);

    return { ownedZodiacs, hasCompleteSet, isLoading, isError, refetchBalances: refetch };
}
