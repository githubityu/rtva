// abi-decoder.ts

import {
    keccak256,
    stringToHex,
    decodeFunctionData,
    type Abi,
    type AbiFunction,
    type AbiParameter,
    type Hex,
} from 'viem';
import {formatAbiItem} from 'viem/utils';

// --- 类型定义 ---

/**
 * ABI (Application Binary Interface) 的类型定义。
 * 直接从 viem 导入，以保持类型一致性。
 */
export type {Abi};

/**
 * 解码后的参数结构。
 */
export interface DecodedParam {
    /** 参数名称，例如 "_to" 或 "amount" */
    name: string;
    /** 参数的 Solidity 类型，例如 "address" 或 "uint256" */
    type: string;
    /** 解码后的值。可能是 bigint, string, boolean, object, 或数组 */
    value: unknown;
}

/**
 * 解码后的方法调用数据。
 */
export interface DecodedMethodData {
    /** 调用的函数名称 */
    name: string;
    /** 解码后的参数数组 */
    params: DecodedParam[];
}

// --- 内部状态管理 ---

const state: {
    savedABIs: Abi;
    methodIDs: Record<Hex, AbiFunction>;
} = {
    /** 存储所有添加的 ABI 定义 */
    savedABIs: [],
    /** 一个映射表，从 4 字节的方法选择器 (method ID) 映射到对应的 ABI 函数定义 */
    methodIDs: {},
};

// --- 公共 API 函数 ---

/**
 * 获取所有已存储的 ABI 定义。
 * @returns {Abi} ABI 数组
 */
export function getABIs(): Abi {
    return state.savedABIs;
}

/**
 * 向解码器添加一组 ABI 定义。
 * 这个函数会解析 ABI 中的函数，并为它们生成方法 ID。
 * @param {Abi} abiArray - 要添加的 ABI 数组。
 */
export function addABI(abiArray: Abi): void {
    if (!Array.isArray(abiArray)) {
        throw new Error(`Expected ABI array, got ${typeof abiArray}`);
    }

    abiArray.forEach((abiItem) => {
        // 我们只关心 'function' 类型的 ABI 条目
        if (abiItem.type === 'function') {
            const functionItem = abiItem as AbiFunction;

            // 使用 viem 的 formatAbiItem 生成标准的函数签名
            // 例如: "transfer(address,uint256)"
            const signature = formatAbiItem(functionItem);

            // 计算签名的 Keccak-256 哈希，并取前 4 字节 (8个十六进制字符 + '0x')
            // 这就是方法 ID 或函数选择器
            const methodID = keccak256(stringToHex(signature)).slice(0, 10) as Hex;

            // 将方法 ID 和对应的 ABI 函数定义存入映射表
            state.methodIDs[methodID] = functionItem;
        }
        // 注意：事件解码通常使用 viem 的 decodeEventLog，这里我们专注于方法调用解码
    });

    // 将新的 ABI 添加到已保存的列表中
    state.savedABIs = state.savedABIs.concat(abiArray);
}

/**
 * (可选实现) 从解码器中移除 ABI 定义。
 * @param {Abi} abiArray - 要移除的 ABI 数组。
 */
export function removeABI(abiArray: Abi): void {
    // 实现与 addABI 类似，但进行删除操作。
    // 为了简洁，具体实现已省略，因为它在很多用例中不常用。
    console.warn("removeABI is not fully implemented in this version.");
}

/**
 * 获取所有已知的方法 ID 及其对应的 ABI 函数定义。
 * @returns {Record<Hex, AbiFunction>} 一个从方法 ID 到 ABI 函数定义的映射表。
 */
export function getMethodIDs(): Record<Hex, AbiFunction> {
    return state.methodIDs;
}

/**
 * 解码十六进制的交易输入数据 (calldata)。
 * @param {string} data - 交易的 `input` 或 `data` 字段的十六进制字符串，必须以 '0x' 开头。
 * @returns {DecodedMethodData | undefined} 如果成功解码，返回包含函数名和参数的对象；否则返回 undefined。
 */
export function decodeMethod(data: string): DecodedMethodData | undefined {
    // 提取前 4 字节作为方法 ID
    const methodID = data.slice(0, 10).toLowerCase() as Hex;

    // 在我们的映射表中查找对应的 ABI 函数定义
    const abiItem = state.methodIDs[methodID];

    // 如果找不到，说明这是一个未知的方法，无法解码
    if (!abiItem) {
        return undefined;
    }

    try {
        // 使用 viem 核心的 decodeFunctionData 函数进行解码
        const {functionName, args} = decodeFunctionData({
            abi: [abiItem], // decodeFunctionData 需要一个 ABI 数组作为上下文
            data: data as Hex,
        });

        const params: DecodedParam[] = [];

        // 如果解码成功并且有参数，则进行格式化
        if (args && abiItem.inputs) {
            for (let i = 0; i < args.length; i++) {
                const inputDefinition = abiItem.inputs[i] as AbiParameter;
                const decodedValue = args[i];
                const {name = '', type} = inputDefinition;
                params.push({
                    // 现在 name 变量可以安全地使用了
                    name: name || `param_${i}`,
                    type: type,
                    value: decodedValue,
                });
            }
        }

        return {
            name: functionName,
            params: params,
        };
    } catch (error) {
        // 如果解码失败（例如，数据格式错误），则打印错误并返回 undefined
        console.error(`[abi-decoder] Failed to decode method data for ID ${methodID}:`, error);
        return undefined;
    }
}
export function _resetDecoderState(): void {
    state.savedABIs = [];
    state.methodIDs = {};
}
