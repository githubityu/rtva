// src/wagmi.ts

import { createWeb3Modal } from '@web3modal/wagmi/react'
import {polygon, anvil,sepolia} from 'wagmi/chains'
import {defaultWagmiConfig} from "@web3modal/wagmi";

// 1. 获取你的 Project ID
const projectId = 'c72c65e1c0fb2ece35a270747fa27aff' // <-- 请务必替换成你的 Project ID




// 2. 定义 DApp 元数据
const metadata = {
    name: 'draw',
    description: '一个很棒的十二生肖应用',
    url: 'https://wenzhuang.top',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// 3. 定义支持的链
const chains = [polygon,anvil,sepolia] as const

// 4. 创建 wagmiConfig
export const config = defaultWagmiConfig({
    chains,
    projectId,
    metadata,
})

// 5. 创建 modal
createWeb3Modal({
    wagmiConfig: config,
    projectId: projectId,
})
