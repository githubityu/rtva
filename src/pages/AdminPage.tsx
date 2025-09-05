import { useState } from 'react';
import { useAccount } from 'wagmi';
import { formatEther, formatUnits } from 'viem';
import { useZodiacAdmin } from '../hooks/useZodiacAdmin';

import {
    Button,
    Card,
    Typography,
    Space,
    Flex,
    ConfigProvider,
    theme,
    Spin,
    Input,
    Statistic,
    Divider,
    Alert,
    notification,
} from 'antd';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { darkAlgorithm } = theme;

/**
 * 管理后台的主面板组件
 */
const AdminPanel = () => {
    const {
        drawPrice, myTokenThreshold, contractEthBalance, contractMyTokenBalance,
        updateDrawPrice, updateMyTokenThreshold, withdrawFunds,
        airdropSingle, airdropBatch,
        isPending, status,
    } = useZodiacAdmin();

    const [newPrice, setNewPrice] = useState('');
    const [newThreshold, setNewThreshold] = useState('');
    const [singleAirdropUser, setSingleAirdropUser] = useState('');
    const [singleAirdropId, setSingleAirdropId] = useState('');
    const [batchAirdropData, setBatchAirdropData] = useState('');

    const handleBatchAirdrop = () => {
        const lines = batchAirdropData.split('\n').filter(line => line.trim() !== '');
        const users: string[] = [];
        const zodiacIds: string[] = [];
        let parseError = false;

        lines.forEach((line, index) => {
            const parts = line.split(/[,;\s]+/).map(item => item.trim());
            const [user, id] = parts;
            if (!user || !id || !/^0x[a-fA-F0-9]{40}$/.test(user) || !/^\d+$/.test(id)) {
                notification.error({
                    message: `Invalid format on line ${index + 1}`,
                    description: `Line: "${line}"`,
                });
                parseError = true;
            }
            users.push(user);
            zodiacIds.push(id);
        });

        if (parseError) return;
        airdropBatch(users, zodiacIds);
    };

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Title level={3} style={{ textAlign: 'center', color: '#fff' }}>Admin Control Panel</Title>

            {/* --- Contract Status --- */}
            <Card type="inner" title="Contract Status">
                <Flex justify="space-around" align="center">
                    <Statistic title="Draw Price (ETH)" value={drawPrice ? formatEther(drawPrice) : '...'} precision={4} />
                    <Statistic title="MTK Threshold" value={myTokenThreshold ? formatUnits(myTokenThreshold, 18) : '...'} />
                    <Statistic title="ETH in Contract" value={contractEthBalance ? contractEthBalance.formatted.slice(0, 7) : '...'} />
                    <Statistic title="MTK in Contract" value={contractMyTokenBalance ? contractMyTokenBalance.formatted.slice(0, 7) : '...'} />
                </Flex>
            </Card>

            {/* --- Manage Settings --- */}
            <Card type="inner" title="Manage Settings">
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Flex align="center" gap="middle">
                        <Input
                            addonBefore="New Draw Price (ETH)"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            placeholder="e.g., 0.02"
                            style={{ flexGrow: 1 }}
                        />
                        <Button onClick={() => updateDrawPrice(newPrice)} disabled={!newPrice || isPending}>Update Price</Button>
                    </Flex>
                    <Flex align="center" gap="middle">
                        <Input
                            addonBefore="New MTK Threshold"
                            value={newThreshold}
                            onChange={(e) => setNewThreshold(e.target.value)}
                            placeholder="e.g., 150"
                            style={{ flexGrow: 1 }}
                        />
                        <Button onClick={() => updateMyTokenThreshold(newThreshold)} disabled={!newThreshold || isPending}>Update Threshold</Button>
                    </Flex>
                </Space>
            </Card>

            {/* --- Airdrop Tools --- */}
            <Card type="inner" title="Airdrop Tools">
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Title level={5}>Single Airdrop</Title>
                    <Flex align="center" gap="middle">
                        <Input value={singleAirdropUser} onChange={(e) => setSingleAirdropUser(e.target.value)} placeholder="User Address (0x...)" style={{ flex: 2 }} />
                        <Input value={singleAirdropId} onChange={(e) => setSingleAirdropId(e.target.value)} placeholder="Zodiac ID (1-12)" style={{ flex: 1 }} />
                        <Button onClick={() => airdropSingle(singleAirdropUser, singleAirdropId)} disabled={!singleAirdropUser || !singleAirdropId || isPending}>Airdrop</Button>
                    </Flex>
                    <Divider />
                    <Title level={5}>Batch Airdrop</Title>
                    <Paragraph type="secondary">
                        Enter one address and Zodiac ID per line. Supported separators: comma, semicolon, space.
                    </Paragraph>
                    <TextArea rows={5} value={batchAirdropData} onChange={(e) => setBatchAirdropData(e.target.value)} placeholder={"0x123...abc, 1\n0x456...def 5\n0x789...ghi;12"} />
                    <Button block type="primary" onClick={handleBatchAirdrop} disabled={!batchAirdropData || isPending}>Execute Batch Airdrop</Button>
                </Space>
            </Card>

            {/* --- Fund Management --- */}
            <Card type="inner" title="Fund Management">
                <Button block onClick={withdrawFunds} disabled={(contractEthBalance?.value ?? 0n) === 0n || isPending}>
                    Withdraw All ETH from Contract
                </Button>
            </Card>

            {/* --- Transaction Status --- */}
            {isPending && <Flex justify="center"><Spin tip={status} /></Flex>}
        </Space>
    );
};


/**
 * 主页面组件，包含权限检查
 */
export default function AdminPage() {
    const { isConnected } = useAccount();
    const { isOwner, error, hash, isPending } = useZodiacAdmin();

    // --- Notification for success ---
    if (hash && !isPending && !error) {
        notification.success({
            key: hash, // Use hash as key to prevent duplicate notifications
            message: 'Transaction Confirmed',
            description: <a href={`https://polygonscan.com/tx/${hash}`} target="_blank" rel="noopener noreferrer">View on Polygonscan</a>,
            placement: 'topRight',
        });
    }

    // --- Notification for error ---
    if (error && !isPending) {
        notification.error({
            key: 'error-key', // A static key for errors
            message: 'Transaction Failed',
            description: error.shortMessage || error.message,
            placement: 'topRight',
        });
    }

    return (
        <ConfigProvider theme={{ algorithm: darkAlgorithm, token: { colorPrimary: '#096dd9', colorBgContainer: '#1f1f1f' } }}>
            <Flex align="center" justify="center" style={{ minHeight: '100vh', background: '#141414', padding: '2rem' }}>
                <Card style={{ width: '100%', maxWidth: '700px' }}>
                    <Flex justify="center" style={{ marginBottom: '1.5rem' }}><w3m-button /></Flex>

                    {!isConnected ? (
                        <Text style={{ textAlign: 'center', display: 'block' }}>Please connect your wallet.</Text>
                    ) : isOwner === undefined ? ( // Added a loading state check
                        <Flex justify="center"><Spin tip="Checking ownership..." /></Flex>
                    ) : isOwner ? (
                        <AdminPanel />
                    ) : (
                        <Alert message="Access Denied" description="You are not the owner of this contract." type="error" showIcon />
                    )}
                </Card>
            </Flex>
        </ConfigProvider>
    );
}
