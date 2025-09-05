// src/hooks/useZodiacBalance.ts
import { useAccount } from 'wagmi';
import { useReadContracts } from 'wagmi';
import LocalUtils from "../utils/LocalUtils.ts";
import {useEffect} from "react";


const NUM_ZODIACS = 12;

export function useZodiacBalance() {
    const { address: userAddress } = useAccount();

    // 创建一个包含 12 个合约调用请求的数组
    const zodiacContracts = Array.from({ length: NUM_ZODIACS }, (_, i) => ({
        address: LocalUtils.ZODIAC_NFT_ADDRESS,
        abi: LocalUtils.ZODIAC_NFT_ABI,
        functionName: 'balanceOf',
        args: [userAddress, BigInt(i + 1)],
    }));

    // 使用 useReadContracts 一次性批量查询
    const { data: balances, isLoading, isError, refetch } = useReadContracts({
        contracts: zodiacContracts,
        // 只有当用户连接钱包后才执行查询
        query: { enabled: !!userAddress },
    });
    useEffect(() => {
        if (balances) {
            console.log("--- Raw Balances from useReadContracts ---");
            console.log(balances);
        }
    }, [balances]);

    // 将查询结果处理成更友好的格式
    const ownedZodiacs = balances
        ? balances.map((result, index) => ({
            id: index + 1,
            balance: result.status === 'success' ? Number(result.result) : 0,
        }))
        : [];

    const hasCompleteSet = ownedZodiacs.length === NUM_ZODIACS && ownedZodiacs.every(z => z.balance > 0);

    return { ownedZodiacs, hasCompleteSet, isLoading, isError, refetchBalances: refetch };
}
