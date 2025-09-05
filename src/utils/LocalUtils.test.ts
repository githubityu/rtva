// // tests/LocalUtils.test.ts
// import { describe, it, expect, beforeAll } from 'vitest';
// import {
//     keccak256, toHex, createTestClient, http, publicActions, walletActions,
//     encodeDeployData, decodeEventLog, type Address,
// } from 'viem';
// import { hardhat } from 'viem/chains';
//
// // 导入你编译后的合约 ABI 和 Bytecode
// // 确保这些 JSON 文件存在并且路径正确
// import MyToken from '../contracts/MyToken.json';
// import ContractFactory from '../contracts/ContractFactory.json';
//
// // 创建一个连接到本地 Hardhat 节点的测试客户端
// const testClient = createTestClient({
//     chain: hardhat,
//     mode: 'hardhat',
//     transport: http(),
// })
//     .extend(publicActions)
//     .extend(walletActions);
//
// // 定义全局变量，用于在测试用例之间共享
// let factoryAddress: Address;
// let deployerAccount: Address;
//
// describe('LocalUtils & Deployment', () => {
//
//     beforeAll(async () => {
//         try {
//             console.log('--- beforeAll started ---'); // 日志1
//
//             // 获取 Hardhat 节点提供的测试账户
//             const accounts = await testClient.getAddresses();
//             deployerAccount = accounts[0];
//             console.log(`Deployer account found: ${deployerAccount}`); // 日志2
//
//             // 1. 部署 ContractFactory 合约
//             console.log('Attempting to deploy ContractFactory...'); // 日志3
//
//             // --- 关键修复点：尝试不同的 bytecode 路径 ---
//             // 选项A: Hardhat 默认
//             const bytecodeToDeploy = ContractFactory.bytecode as `0x${string}`;
//
//             // 选项B: Foundry 风格
//             // const bytecodeToDeploy = (ContractFactory as any).bytecode.object as `0x${string}`;
//
//             // 选项C: 根据你的截图推测的风格
//             // const bytecodeToDeploy = (ContractFactory as any).deploy.bytecode as `0x${string}`;
//
//             if (!bytecodeToDeploy) {
//                 // 如果 bytecode 仍然是 undefined，提前抛出明确错误
//                 throw new Error("ContractFactory.bytecode is undefined. Check the JSON artifact path and structure.");
//             }
//
//             const factoryHash = await testClient.deployContract({
//                 abi: ContractFactory.abi,
//                 bytecode: bytecodeToDeploy, // <--- 使用我们准备好的变量
//                 account: deployerAccount,
//                 args: [],
//             });
//             console.log(`ContractFactory deployment transaction sent. Hash: ${factoryHash}`); // 日志4
//
//             // 2. 等待交易确认并获取合约地址
//             const receipt = await testClient.waitForTransactionReceipt({ hash: factoryHash });
//             if (!receipt.contractAddress) {
//                 throw new Error("ContractFactory deployment failed: No contract address found.");
//             }
//             factoryAddress = receipt.contractAddress;
//
//             console.log(`--- beforeAll finished successfully! Factory at: ${factoryAddress} ---`); // 日志5
//
//         } catch (error) {
//             console.error("!!! FATAL ERROR IN beforeAll !!!");
//             console.error(error);
//             // 重新抛出错误，确保测试状态是失败
//             throw error;
//         }
//     });
//
//     it('test MINTER_ROLE is correct', () => {
//         const expectedHash = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
//         const minterRoleHash = keccak256(toHex("MINTER_ROLE"));
//
//         console.log(`Calculated MINTER_ROLE hash: ${minterRoleHash}`);
//         expect(minterRoleHash).toBe(expectedHash);
//     });
//
//     it('should deploy MyToken via ContractFactory and set the correct owner', async () => {
//         // --- 1. Arrange (准备) ---
//         // 获取另一个测试账户作为 MyToken 的初始所有者
//         const accounts = await testClient.getAddresses();
//         const initialOwner = accounts[1];
//
//         // 准备 MyToken 的 creationBytecode，包含构造函数参数
//         const creationBytecode = encodeDeployData({
//             abi: MyToken.abi,
//             bytecode: MyToken.bytecode as `0x${string}`,
//             args: [initialOwner], // 将 initialOwner 作为构造函数参数
//         });
//
//         // --- 2. Act (行动) ---
//         // 通过已部署的 ContractFactory 调用 deployContract 函数
//         const deployTxHash = await testClient.writeContract({
//             address: factoryAddress,
//             abi: ContractFactory.abi,
//             functionName: 'deployContract',
//             args: [creationBytecode],
//             account: deployerAccount,
//         });
//
//         // 等待部署 MyToken 的交易被打包
//         const deployReceipt = await testClient.waitForTransactionReceipt({ hash: deployTxHash });
//         expect(deployReceipt.status).toBe('success');
//
//         // --- 3. Assert (验证) ---
//         // 从交易日志中解析出 ContractDeployed 事件，以获取新合约地址
//         const deployLog = deployReceipt.logs.find(log => log.address.toLowerCase() === factoryAddress.toLowerCase());
//         expect(deployLog).toBeDefined();
//
//         const decodedLog = decodeEventLog({
//             abi: ContractFactory.abi,
//             data: deployLog!.data,
//             topics: deployLog!.topics,
//         });
//
//         const deployedTokenAddress = (decodedLog.args as any).newContractAddress as Address;
//         console.log(`MyToken deployed via factory at: ${deployedTokenAddress}`);
//
//         // 验证地址是否有效
//         expect(deployedTokenAddress).not.toBe(undefined);
//         expect(deployedTokenAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
//
//         // **最关键的验证**：读取新部署的 MyToken 合约的 owner
//         const actualOwner = await testClient.readContract({
//             address: deployedTokenAddress,
//             abi: MyToken.abi,
//             functionName: 'owner',
//         });
//
//         // 验证 owner 是否是我们指定的 initialOwner
//         expect(actualOwner.toLowerCase()).toBe(initialOwner.toLowerCase());
//
//         // (可选) 额外的验证，确保合约是正确的
//         const name = await testClient.readContract({
//             address: deployedTokenAddress,
//             abi: MyToken.abi,
//             functionName: 'name',
//         });
//         expect(name).toBe('MyToken');
//     });
// });
