// 确保这个路径是正确的，指向你项目中的 Router ABI JSON 文件
import UniswapV2Router02_ABI from '../abis/UniswapV2Router02.json';

// --- Hardhat 本地节点的合约地址 ---
// 这些地址来自你提供的 Remix 截图

// Router 合约地址
export const ROUTER_ADDRESS = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9' as const;

// WETH 代币地址
export const WETH_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const;

// DAI (模拟的 ERC20) 代币地址
export const DAI_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as const;
export const DAI2_ADDRESS = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9' as const;

// Factory 合约地址
export const FACTORY_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0' as const;

// ------------------------------------

export const ROUTER_ABI = UniswapV2Router02_ABI.abi;

// Factory 的精简版 ABI
export const FACTORY_ABI = [
    {
        "constant": true,
        "inputs": [
            { "internalType": "address", "name": "tokenA", "type": "address" },
            { "internalType": "address", "name": "tokenB", "type": "address" }
        ],
        "name": "getPair",
        "outputs": [{ "internalType": "address", "name": "pair", "type": "address" }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

// 前端 UI 中使用的代币列表
export const TOKENS = {
    'ETH': { address: WETH_ADDRESS, symbol: 'ETH', decimals: 18 },
    'DAI': { address: DAI_ADDRESS, symbol: 'DAI', decimals: 18 },
    'DAI2': { address: DAI2_ADDRESS, symbol: 'DAI2', decimals: 18 },
};
