// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // 允许在测试文件中使用顶层 await
        testTimeout: 10000, // 增加超时时间以适应区块链交易
        environment: 'node',
    },
});
