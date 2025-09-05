// src/main.tsx (示例)

import React from 'react';
import ReactDOM from 'react-dom/client';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './wagmi';
import App from './App';

// 导入你的全局 CSS 和 Ant Design CSS
import './index.css';
import 'antd/dist/reset.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {/* App 组件现在包含了路由，被所有 Provider 包裹 */}
                <App />
            </QueryClientProvider>
        </WagmiProvider>
    </React.StrictMode>,
);
