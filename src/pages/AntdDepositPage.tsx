import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useTokenDeposit } from '../hooks/useTokenDeposit'; // 1. 导入我们创建的新 Hook
import {
    Button, InputNumber, Card, Typography, Space, Flex, ConfigProvider, theme,
} from 'antd';

const { darkAlgorithm } = theme;

export default function AntdDepositPage() {
    const { isConnected } = useAccount();
    const [depositAmount, setDepositAmount] = useState('');

    // 2. 直接使用 useTokenDeposit Hook！逻辑保持在视图之外。
    const { executeDeposit, status, isPending, txHash, error } = useTokenDeposit({
        amount: depositAmount,
    });

    const handleAmountChange = (value: string | null) => {
        setDepositAmount(value ?? '');
    };

    return (
        <ConfigProvider theme={{ algorithm: darkAlgorithm, token: { colorPrimary: '#6f42c1', colorBgContainer: '#212529' } }}>
            <Flex align="center" justify="center" style={{ minHeight: '100vh', background: '#1c1c1e' }}>
                <Card title="Deposit with Permit" variant="outlined" style={{ width: 400 }}>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                            <w3m-button />
                        </div>

                        {isConnected ? (
                            <>
                                <InputNumber
                                    placeholder="MyToken Amount to Deposit"
                                    value={depositAmount}
                                    onChange={handleAmountChange}
                                    disabled={isPending} // 3. 使用 Hook 的 isPending 状态
                                    min={0}
                                    stringMode
                                    style={{ width: '100%' }}
                                    size="large"
                                />
                                <Button
                                    type="primary"
                                    onClick={executeDeposit} // 4. 直接调用 Hook 的 executeDeposit
                                    disabled={!depositAmount || isPending}
                                    loading={isPending}
                                    block
                                    size="large"
                                >
                                    {isPending ? status : 'Deposit Tokens'}
                                </Button>
                            </>
                        ) : (
                            <Typography.Text style={{ textAlign: 'center', display: 'block' }}>
                                Please connect your wallet to deposit.
                            </Typography.Text>
                        )}

                        {/* 5. 显示 Hook 返回的状态和错误 */}
                        <Typography.Text
                            type={error ? 'danger' : 'secondary'}
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
                                View Last Transaction
                            </Typography.Link>
                        )}
                    </Space>
                </Card>
            </Flex>
        </ConfigProvider>
    );
}
