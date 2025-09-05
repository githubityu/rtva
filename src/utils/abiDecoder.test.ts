// abiDecoder.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import {
    addABI,
    getABIs,
    getMethodIDs,
    decodeMethod,
    // 我们需要一个方法来重置状态，所以在 decoder 中导出它
    _resetDecoderState,
} from './abiDecoder'; // 假设文件名为 abiDecoder.ts
import LocalUtils from './LocalUtils'; // 假设包含 USDT_ABI 和 TOKEN_SWAP_ABI
import { encodeFunctionData } from 'viem';

/**
 * ------------------------------------------------------------------
 *                       测试 `abi-decoder` 模块
 * ------------------------------------------------------------------
 * 关键点：由于 abiDecoder 是一个有状态的模块（它在内部存储 ABIs 和 methodIDs），
 * 我们必须在每个测试用例运行前使用 `beforeEach` hook 来重置其状态。
 * 这能确保每个测试用例都是独立的，互不干扰。
 */

describe('abiDecoder', () => {

    // 在每个 'it' 测试块运行之前，调用 _resetDecoderState 来清理环境
    beforeEach(() => {
        _resetDecoderState();
    });

    // --- 测试 addABI 和 getABIs ---
    describe('addABI() and getABIs()', () => {
        it('should correctly add a single ABI set', () => {
            addABI(LocalUtils.USDT_ABI);
            const abis = getABIs();

            // 断言 ABI 数组的长度是正确的
            expect(abis.length).toBe(LocalUtils.USDT_ABI.length);
            // 断言内容也被正确添加
            expect(abis).toEqual(LocalUtils.USDT_ABI);
        });

        it('should correctly add multiple ABI sets', () => {
            addABI(LocalUtils.USDT_ABI);
            addABI(LocalUtils.TOKEN_SWAP_ABI);
            const abis = getABIs();

            const expectedLength = LocalUtils.USDT_ABI.length + LocalUtils.TOKEN_SWAP_ABI.length;

            // 断言总长度正确
            expect(abis.length).toBe(expectedLength);
            // 断言内容包含了所有添加的 ABI
            expect(abis).toEqual([...LocalUtils.USDT_ABI, ...LocalUtils.TOKEN_SWAP_ABI]);
        });

        it('should throw an error if input is not an array', () => {
            // 断言当传入非数组时，会抛出错误
            expect(() => addABI({} as any)).toThrow('Expected ABI array, got object');
        });
    });

    // --- 测试 getMethodIDs ---
    describe('getMethodIDs()', () => {
        it('should generate correct method IDs for functions', () => {
            addABI(LocalUtils.USDT_ABI);
            const methodIDs = getMethodIDs();

            // 我们知道 USDT_ABI 中有 'transfer' 和 'approve' 函数
            // transfer(address,uint256) -> a9059cbb
            // approve(address,uint256)  -> 095ea7b3
            const transferId = '0xa9059cbb';
            const approveId = '0x095ea7b3';

            // 断言方法 ID 映射表中包含了正确的键
            expect(Object.keys(methodIDs)).toContain(transferId);
            expect(Object.keys(methodIDs)).toContain(approveId);

            // 断言映射的值是正确的 ABI function item
            expect(methodIDs[transferId].name).toBe('transfer');
            expect(methodIDs[approveId].name).toBe('approve');
        });
    });

    // --- 测试 decodeMethod ---
    describe('decodeMethod()', () => {
        beforeEach(() => {
            // 在解码测试前，确保解码器已经“学习”了必要的 ABI
            addABI(LocalUtils.USDT_ABI);
            addABI(LocalUtils.TOKEN_SWAP_ABI);
        });

        it('should correctly decode a "transfer" call', () => {
            const toAddress = '0x1234567890123456789012345678901234567890';
            const amount = 100n * (10n ** 18n); // 100 Ether in wei

            // 使用 viem 的 encodeFunctionData 来生成真实的 calldata
            const calldata = encodeFunctionData({
                abi: LocalUtils.USDT_ABI,
                functionName: 'transfer',
                args: [toAddress, amount],
            });

            const decoded = decodeMethod(calldata);

            // 断言解码结果非空
            expect(decoded).toBeDefined();
            // 断言函数名正确
            expect(decoded?.name).toBe('transfer');
            // 断言参数数量正确
            expect(decoded?.params.length).toBe(2);
            // 断言每个参数的名称、类型和值都正确
            expect(decoded?.params[0]).toEqual({ name: 'to', type: 'address', value: toAddress });
            expect(decoded?.params[1]).toEqual({ name: 'amount', type: 'uint256', value: amount });
        });

        it('should correctly decode a "buyTokens" call', () => {
            const usdtAmount = 500n * (10n ** 6n); // 500 USDT with 6 decimals

            const calldata = encodeFunctionData({
                abi: LocalUtils.TOKEN_SWAP_ABI,
                functionName: 'buyTokens',
                args: [usdtAmount],
            });

            const decoded = decodeMethod(calldata);

            expect(decoded).toBeDefined();
            expect(decoded?.name).toBe('buyTokens');
            expect(decoded?.params.length).toBe(1);
            expect(decoded?.params[0]).toEqual({ name: '_usdtAmount', type: 'uint256', value: usdtAmount });
        });

        it('should return undefined for an unknown method ID', () => {
            const unknownCalldata = '0x123456780000000000000000000000000000000000000000000000000000000000000001';
            const decoded = decodeMethod(unknownCalldata);

            // 断言对于未知的函数，返回 undefined
            expect(decoded).toBeUndefined();
        });
    });
});
