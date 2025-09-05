// src/utils/tokenUtils.ts

import { type Config } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { parseUnits } from 'viem';

// 通用的 ERC20 ABI，只包含我们需要的函数
const erc20Abi = [
    {
        inputs: [],
        name: 'decimals',
        outputs: [{ name: '', type: 'uint8' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const;

/**
 * 异步获取指定 ERC20 代币的小数位数。
 * @param config - wagmi 的配置对象。
 * @param tokenAddress - 代币的合约地址。
 * @returns 返回代币的小数位数 (number)。
 */
export async function getTokenDecimals(
    config: Config,
    tokenAddress: `0x${string}`
): Promise<number> {
    try {
        const decimals = await readContract(config, {
            abi: erc20Abi,
            address: tokenAddress,
            functionName: 'decimals',
        });
        return Number(decimals);
    } catch (error) {
        console.error(`获取代币 ${tokenAddress} 的 decimals 失败:`, error);
        throw new Error(`无法获取代币 ${tokenAddress} 的小数位数。`);
    }
}

/**
 * 将用户输入的代币数量字符串解析为合约需要的 wei 单位 (bigint)。
 * @param config - wagmi 的配置对象。
 * @param tokenAddress - 代币的合约地址。
 * @param amountString - 用户输入的数量字符串。
 * @returns 返回解析后的 bigint 数量。
 */
export async function parseTokenAmount(
    config: Config,
    tokenAddress: `0x${string}`,
    amountString: string,
): Promise<bigint> {
    const decimals = await getTokenDecimals(config, tokenAddress);
    return parseUnits(amountString, decimals);
}
