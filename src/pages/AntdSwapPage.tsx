// src/pages/AntdSwapPage.tsx (重构后)

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Link } from "react-router-dom";
import { useTokenSwap } from '../hooks/useTokenSwap'; // 1. 导入我们之前创建的 Hook
import { APP_ROUTES } from "../constants/routes.ts";

// Ant Design 组件
import {
    Button,
    InputNumber,
    Card,
    Typography,
    Space,
    Flex,
    ConfigProvider,
    theme,
} from 'antd';

const { darkAlgorithm } = theme;

export default function AntdSwapPage() {
    const { isConnected } = useAccount();
    const [usdtAmount, setUsdtAmount] = useState('');

    // 2. 像上次一样，直接使用 useTokenSwap Hook！
    const { executeSwap, status, isPending, txHash, error } = useTokenSwap({
        amount: usdtAmount
    });

    // Ant Design 的 InputNumber onChange 返回的是 string | null
    const handleAmountChange = (value: string | null) => {
        setUsdtAmount(value ?? '');
    };

    return (
        <ConfigProvider
            theme={{
                algorithm: darkAlgorithm,
                token: {
                    colorPrimary: '#6f42c1',
                    colorBgContainer: '#212529',
                },
            }}
        >
            <Flex
                align="center"
                justify="center"
                style={{ minHeight: '100vh', background: '#1c1c1e' }}
            >
                <Card
                    title="Token Swap"
                    variant="outlined"
                    style={{ width: 400, header: { textAlign: 'center', borderBottom: '1px solid #333' } }}
                >
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                            <w3m-button />
                        </div>

                        <Link to={APP_ROUTES.STUDY_WEB3}>
                            <Button block>跳转到 OriginalSwapPage</Button>
                        </Link>

                        {isConnected ? (
                            <>
                                <InputNumber
                                    placeholder="USDT Amount"
                                    value={usdtAmount}
                                    onChange={handleAmountChange}
                                    disabled={isPending} // 3. 使用 Hook 的 isPending
                                    min={0}
                                    stringMode
                                    style={{ width: '100%' }}
                                    size="large"
                                />
                                <Button
                                    type="primary"
                                    onClick={executeSwap} // 4. 直接调用 Hook 的 executeSwap
                                    disabled={!usdtAmount || isPending}
                                    loading={isPending} // Antd 的 loading 属性也用 isPending
                                    block
                                    size="large"
                                >
                                    {isPending ? 'Processing...' : 'Buy Tokens'}
                                </Button>
                            </>
                        ) : null}

                        {/* 5. 显示 Hook 返回的状态和错误 */}
                        <Typography.Text
                            type={error ? 'danger' : 'secondary'} // 如果有错误，可以用红色文本
                            style={{ textAlign: 'center', display: 'block', paddingTop: '1rem' }}
                        >
                            Status: {error ? `Error: ${error}` : status}
                        </Typography.Text>

                        {txHash && (
                            <Typography.Link
                                href={`https://polygonscan.com/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textAlign: 'center', display: 'block' }}
                            >
                                View Last Transaction on Polygonscan
                            </Typography.Link>
                        )}
                    </Space>
                </Card>
            </Flex>
        </ConfigProvider>
    );
}
