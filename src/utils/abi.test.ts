// // src/tests/polygonFork.test.ts
//
// import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
// import {
//     createPublicClient,
//     createTestClient,
//     createWalletClient,
//     http,
//     parseUnits,
//     zeroAddress,
//     type Address,
//     parseEther,
//     getAddress,
//     decodeEventLog, BaseError, ContractFunctionRevertedError,
// } from 'viem';
// import { polygon } from 'viem/chains';
// import AbiUtils from "./abi_utils.ts";
// import {
//     readContract,
//     writeContract,
//     waitForTransactionReceipt,
//     impersonateAccount,
//     setBalance,
//     stopImpersonatingAccount,
// } from 'viem/actions';
//
// /**
//  * -----------------------------------------------------------------
//  *                         Polygon 分叉测试
//  * -----------------------------------------------------------------
//  * 本测试套件连接到一个正在从 Polygon 主网分叉的本地 Anvil 节点。
//  * 它利用真实的链上状态和作弊码来执行高度逼真的集成测试。
//  */
// vi.setConfig({
//     testTimeout: 30000,
// });
//
// // 1. Viem 客户端设置 (全部配置为本地 Anvil 链)
// const rpcUrl = 'http://127.0.0.1:8545';
// const chain = polygon;
// const publicClient = createPublicClient({ chain: chain, transport: http(rpcUrl) });
// const testClient = createTestClient({ chain: chain, mode: 'anvil', transport: http(rpcUrl) });
// const testAccount = {
//     address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as Address,
// };
// const walletClient = createWalletClient({
//     account: testAccount.address,
//     chain: chain,
//     transport: http(rpcUrl),
// });
//
// // 2. Polygon 主网上的真实合约地址
// const POLYGON_ADDRESSES = {
//     USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' as Address,
//     DAO_FACTORY: '0x9BC7f1dc3cFAD56a0EcD924D1f9e70f5C7aF0039' as Address,
//     // 一个已知的 Polygon USDT 巨鲸地址 (例如 Binance 热钱包)
//     USDT_WHALE: '0xF977814e90dA44bFA03b6295A0616a897441aceC' as Address,
//     // 一个用于 approve 测试的虚拟地址
//     DUMMY_SPENDER: '0x1111111111111111111111111111111111111111' as Address,
//     // Aragon 核心插件仓库在 Polygon 上的地址
//     CORE_PLUGIN_REPO: '0x315963424d16a5b7d35c432049e54a614349a385' as Address,
//     AN_DAO: '0xCa834B3F404c97273f34e108029eEd776144d324' as Address,
//     AN_DAO_MULTISIG_PLUGIN: getAddress('0x90eFFA56ecc3c9b947ee9C3c4c5fedf1c460B9a4'),
//     A_REAL_MULTISIG_MEMBER: getAddress('0xBE002752949A44054a32471649b2923f62A15535'),
// };
//
// describe('Forked Interaction Tests on Polygon', () => {
//
//     // --- 只读测试 (Read-only Tests) ---
//     describe('Reading state from Polygon fork', () => {
//         it('should read correct decimals for USDT', async () => {
//             const decimals = await readContract(publicClient, {
//                 address: POLYGON_ADDRESSES.USDT,
//                 abi: AbiUtils.USDT_ABI,
//                 functionName: 'decimals',
//             });
//             expect(decimals).toBe(6);
//         });
//
//         // 可以在此添加更多只读测试，例如查询 DAOFactory 的 protocolVersion
//     });
//
//     describe('MULTISIG_PLUGIN_ABI', () => {
//
//         it('should correctly identify that our test account is NOT a member', async () => {
//             const isMember = await readContract(publicClient, {
//                 address: POLYGON_ADDRESSES.AN_DAO_MULTISIG_PLUGIN,
//                 abi: AbiUtils.MULTISIG_PLUGIN_ABI,
//                 functionName: 'isMember', // <-- 确保调用的是 isMember
//                 args: [testAccount.address],
//             });
//             expect(isMember).toBe(false);
//         });
//
//
//
//         it('should read the total proposal count from the plugin', async () => {
//             const count = await readContract(publicClient, {
//                 address: POLYGON_ADDRESSES.AN_DAO_MULTISIG_PLUGIN,
//                 abi: AbiUtils.MULTISIG_PLUGIN_ABI,
//                 functionName: 'proposalCount',
//             });
//
//             // 提案数量是一个非负整数 (bigint)
//             expect(count).toBeGreaterThanOrEqual(0n);
//             console.log(`anDAO Multisig has ${count} proposals.`);
//         });
//
//         it('should fail to approve a proposal when not impersonating a member', async () => {
//             const proposalId = 1n; // 假设我们要批准第一个提案
//
//             // 我们期望这个调用会失败，因为 testAccount 不是成员
//             // `viem` 会抛出一个错误，所以我们用 expect(...).rejects.toThrow() 来捕获它
//             await expect(
//                 writeContract(walletClient, {
//                     account: testAccount.address,
//                     address: POLYGON_ADDRESSES.AN_DAO_MULTISIG_PLUGIN,
//                     abi: AbiUtils.MULTISIG_PLUGIN_ABI,
//                     functionName: 'approve',
//                     args: [proposalId, false],
//                 })
//             ).rejects.toThrow(); // 断言这个 promise 会被拒绝
//         });
//
//         it('should successfully approve a proposal when impersonating a real member', async () => {
//             const proposalId = 1n;
//             const realMemberAddress = POLYGON_ADDRESSES.A_REAL_MULTISIG_MEMBER;
//
//             // 步骤 1: 模拟一个真实的成员
//             await impersonateAccount(testClient, { address: realMemberAddress });
//
//             // 步骤 2: 以该成员的身份发送 `approve` 交易
//             const approveHash = await writeContract(walletClient, {
//                 account: realMemberAddress, // 关键：指定交易发送者
//                 address: POLYGON_ADDRESSES.AN_DAO_MULTISIG_PLUGIN,
//                 abi: AbiUtils.MULTISIG_PLUGIN_ABI,
//                 functionName: 'approve',
//                 args: [proposalId, false],
//             });
//
//             const receipt = await waitForTransactionReceipt(publicClient, { hash: approveHash });
//
//             // 步骤 3: 断言交易成功
//             expect(receipt.status).toBe('success');
//
//             console.log(`Successfully approved proposal ${proposalId} by impersonating member ${realMemberAddress}`);
//
//             // 步骤 4: 停止模拟
//             await stopImpersonatingAccount(testClient, { address: realMemberAddress });
//         });
//     });
//
//     // --- 写操作测试 (Write Tests with Cheat Codes) ---
//     describe('Writing to state using cheat codes', () => {
//
//         describe('when impersonating a whale account', () => {
//             const whaleAddress = POLYGON_ADDRESSES.USDT_WHALE;
//
//             // 在这个 describe 块的所有测试前，开启对巨鲸账户的模拟
//             beforeEach(async () => {
//                 await impersonateAccount(testClient, { address: whaleAddress });
//             });
//
//             // 在所有测试后，停止模拟，确保测试环境的清洁
//             afterEach(async () => {
//                 await stopImpersonatingAccount(testClient, { address: whaleAddress });
//             });
//
//             it('should approve USDT spending from the whale account', async () => {
//                 const amountToApprove = parseUnits('1000', 6); // 1000 USDT
//
//                 // 以巨鲸的身份执行 approve 交易
//                 // viem 的 writeContract 允许我们通过 `account` 参数覆盖默认的钱包账户
//                 const approveHash = await writeContract(walletClient, {
//                     account: whaleAddress, // 指定交易发送者为巨鲸
//                     address: POLYGON_ADDRESSES.USDT,
//                     abi: AbiUtils.USDT_ABI,
//                     functionName: 'approve',
//                     args: [POLYGON_ADDRESSES.DUMMY_SPENDER, amountToApprove],
//                 });
//
//                 const receipt = await waitForTransactionReceipt(publicClient, { hash: approveHash });
//                 expect(receipt.status).toBe('success');
//
//                 console.log(`Successfully approved USDT from whale ${whaleAddress}`);
//             });
//         });
//
//         it('should create a DAO and emit a DAOCreated event', async () => {
//             // 步骤 1: 使用作弊码给测试账户提供足够的 MATIC (在 Anvil 中表现为 ETH)
//             await setBalance(testClient, {
//                 address: testAccount.address,
//                 value: parseEther('100'),
//             });
//
//             // 步骤 2: 准备 createDao 函数所需的参数
//             // 使用随机数确保每次运行的子域名都是唯一的，以避免 'SubdomainAlreadyExists' 错误
//             const daoSubdomain = `test-dao-${Math.floor(Math.random() * 10000000)}`;
//             const daoSettings = {
//                 trustedForwarder: zeroAddress,
//                 daoURI: 'https://example.com/dao.json',
//                 subdomain: daoSubdomain,
//                 metadata: '0x' as `0x${string}`,
//             };
//             const pluginSettings = [{
//                 pluginSetupRef: {
//                     // 注意：这个版本号必须在 CORE_PLUGIN_REPO 中真实存在
//                     // 让我们尝试一个已知的、存在的多签插件版本
//                     versionTag: { release: 1, build: 1 },
//                     pluginSetupRepo: POLYGON_ADDRESSES.CORE_PLUGIN_REPO,
//                 },
//                 // 对于多签插件，初始化数据是必须的，不能为空
//                 // 我们需要编码 MultisigSettings 结构体
//                 // 为了简化，我们先传入一个可能是错误的空数据，看看合约会报什么错
//                 data: '0x' as `0x${string}`,
//             }];
//
//             // 步骤 3: [调试核心] 使用 try/catch 和 simulateContract 来捕获 revert 原因
//             try {
//                 // 首先，模拟交易以检查是否会 revert
//                 console.log(`Attempting to simulate DAO creation with subdomain: ${daoSubdomain}`);
//                 const { request } = await publicClient.simulateContract({
//                     account: testAccount.address,
//                     address: POLYGON_ADDRESSES.DAO_FACTORY,
//                     abi: AbiUtils.DAO_FACTORY_ABI,
//                     functionName: 'createDao',
//                     args: [daoSettings, pluginSettings],
//                 });
//
//                 // 如果模拟成功，才真正发送交易
//                 console.log("Simulation successful! Writing contract...");
//                 const createDaoHash = await walletClient.writeContract(request);
//                 const receipt = await waitForTransactionReceipt(publicClient, { hash: createDaoHash });
//
//                 // 断言交易成功
//                 expect(receipt.status).toBe('success');
//
//                 // 步骤 4: 解析并验证日志
//                 const daoCreatedEventAbi = [{ "type": "event", "name": "DAOCreated", "inputs": [{"name": "dao", "type": "address", "indexed": true}, {"name": "creator", "type": "address", "indexed": true}, {"name": "subdomain", "type": "string", "indexed": false}], "anonymous": false }] as const;
//                 const daoCreatedLog = receipt.logs.find(log => log.address.toLowerCase() === POLYGON_ADDRESSES.DAO_FACTORY.toLowerCase());
//                 expect(daoCreatedLog).toBeDefined();
//                 const decodedLog = decodeEventLog({ abi: daoCreatedEventAbi, data: daoCreatedLog!.data, topics: daoCreatedLog!.topics });
//                 expect(decodedLog.eventName).toBe('DAOCreated');
//                 expect(decodedLog.args.dao).toMatch(/^0x[a-fA-F0-9]{40}$/);
//                 expect(decodedLog.args.creator).toBe(testAccount.address);
//                 expect(decodedLog.args.subdomain).toBe(daoSubdomain);
//                 console.log(`Successfully created DAO. Address on fork:`, decodedLog.args.dao);
//
//             } catch (error) {
//                 // 如果模拟失败，打印出详细的 revert 原因
//                 console.error("\n\n--- Contract Simulation Failed ---");
//
//                 if (error instanceof BaseError) {
//                     const revertError = error.walk(err => err instanceof ContractFunctionRevertedError);
//                     if (revertError instanceof ContractFunctionRevertedError) {
//                         const errorName = revertError.reason;
//                         const errorArgs = revertError.args;
//                         console.error("🔥 Revert Reason:", errorName);
//                         console.error("🔥 Revert Arguments:", errorArgs);
//                         throw new Error(`Transaction reverted with reason: ${errorName}`);
//                     }
//                 }
//
//                 console.error("An unexpected error occurred during simulation:", error);
//                 throw error;
//             }
//         });
//
//
//     });
// });
