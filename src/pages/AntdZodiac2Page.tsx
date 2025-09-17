import { useAccount, useBalance } from 'wagmi';
import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';

import { useZodiacDraw } from '../hooks/useZodiacDraw';
import { useZodiacExchange } from '../hooks/useZodiacExchange';
import { useZodiacBalanceV2 } from "../hooks/useZodiacBalanceV2.ts";

// 导入所有需要的 Ant Design 组件
import {
    Button,
    Card,
    Typography,
    Space,
    Flex,
    ConfigProvider,
    theme,
    Spin,
    Result,
    Tag,
    Badge, Col, Row,
} from 'antd';
import LocalUtils from "../utils/LocalUtils.ts";
import AppUtils from "../utils/appUtils.ts"; // 导入 LocalUtils

const { darkAlgorithm } = theme;

// 定义生肖的元数据，用于 UI 展示
const zodiacMeta = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: [
        '鼠', '牛', '虎', '兔', '龙', '蛇',
        '马', '羊', '猴', '鸡', '狗', '猪'
    ][i],
    image: AppUtils.getPicById(i), // 确保图片路径正确
}));
export default function AntdZodiac2Page() {
    const { address, isConnected } = useAccount();

    // --- 使用自定义 Hooks ---
    // 1. 获取用户 NFT 余额
    const { ownedZodiacs, hasCompleteSet, isLoading: isLoadingBalance, refetchBalances } = useZodiacBalanceV2();

    // 2. 获取用户 MyToken 余额和合约门槛 (用于前端防御性检查)
    const { data: myTokenBalance, isLoading: isLoadingMyTokenBalance } = useBalance({
        address,
        token: LocalUtils.MY_TOKEN_ADDRESS,
        query: { enabled: isConnected },
    });

    const { data: myTokenThreshold, isLoading: isLoadingThreshold } = useReadContract({
        address: LocalUtils.ZODIAC_EXCHANGER_ADDRESS,
        abi: LocalUtils.ZODIAC_EXCHANGER_ABI,
        functionName: 'myTokenThreshold',
        query: { enabled: isConnected },
    });

    // 3. 抽奖功能 Hook
    const { executeDraw, isPending: isDrawing, status: drawStatus, drawnZodiacId, error: drawError } = useZodiacDraw(refetchBalances);

    // 4. 兑换功能 Hook
    const { executeExchange, isPending: isExchanging, status: exchangeStatus, error: exchangeError } = useZodiacExchange(refetchBalances);

    // --- 前端防御性逻辑 ---
    // 计算用户 MyToken 余额是否不足
    const isMyTokenBalanceInsufficient = myTokenBalance && myTokenThreshold
        ? myTokenBalance.value < myTokenThreshold
        : true;

    // 动态生成抽奖按钮的文本和禁用状态
    const getDrawButtonState = () => {
        if (!isConnected) return { text: 'Connect Wallet to Draw', disabled: true };
        if (isLoadingMyTokenBalance || isLoadingThreshold) return { text: 'Checking balance...', disabled: true };
        if (isMyTokenBalanceInsufficient) {
            const thresholdFormatted = myTokenThreshold ? formatUnits(myTokenThreshold, 18) : '...';
            return { text: `Need at least ${thresholdFormatted} ${LocalUtils.TOKEN_NAME}`, disabled: true };
        }
        if (isDrawing) return { text: drawStatus, disabled: true };
        return { text: 'Draw Now', disabled: isExchanging };
    };
    const drawButtonState = getDrawButtonState();

    return (
        <ConfigProvider
            theme={{
                algorithm: darkAlgorithm,
                token: {
                    colorPrimary: '#a042c1',
                    colorBgContainer: '#1f1f1f',
                    colorBgElevated: '#2d2d2d'
                }
            }}
        >
            <Flex align="center" justify="center" style={{ minHeight: '100vh', background: '#141414', padding: '2rem' }}>
                <Card title="Zodiac NFT Lottery & Exchange" style={{ width: '100%', maxWidth: '550px' }}>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <Flex justify="center"><w3m-button /></Flex>

                        {isConnected ? (
                            <>
                                {/* --- 抽奖区域 --- */}
                                <Card type="inner" title="1. Draw a Zodiac NFT">
                                    <Button
                                        block
                                        type="primary"
                                        onClick={executeDraw}
                                        loading={isDrawing}
                                        disabled={drawButtonState.disabled}
                                        size="large"
                                    >
                                        {drawButtonState.text} {/* 使用我们动态生成的文本 */}
                                    </Button>

                                    {/* 错误显示区域 */}
                                    {!isDrawing && !drawnZodiacId && drawError && (
                                        <Typography.Text type="danger" style={{ display: 'block', textAlign: 'center', marginTop: '10px' }}>
                                            Error: {drawError.shortMessage}
                                        </Typography.Text>
                                    )}

                                    {/* 成功显示区域 */}
                                    {drawnZodiacId && !isDrawing && (
                                        <Result status="success" title={`You got a ${zodiacMeta[drawnZodiacId - 1].name}!`} style={{ padding: '24px 0 0' }} />
                                    )}
                                </Card>

                                <Card type="inner" title="2. My Zodiac Collection">
                                    {isLoadingBalance ? <Flex justify="center"><Spin /></Flex> : (
                                        // 使用 Row 和 Col 替代 Flex
                                        // gutter={[水平间距, 垂直间距]}
                                        <Row gutter={[16, 24]} justify="center">
                                            {zodiacMeta.map(z => {
                                                const owned = ownedZodiacs.find(o => o.id === z.id)?.balance ?? 0;
                                                return (
                                                    <Col key={z.id} xs={6} sm={6} md={4} lg={4}>
                                                        <Flex vertical align="center" gap="small" style={{ opacity: owned > 0 ? 1 : 0.3 }}>
                                                            <Badge count={owned} color="blue" offset={[-10, 10]} style={{ boxShadow: 'none' }}>
                                                                <img src={z.image} alt={z.name} width={50} style={{ borderRadius: '8px', background: '#333' }} />
                                                            </Badge>
                                                            <Tag>{z.name}</Tag>
                                                        </Flex>
                                                    </Col>
                                                );
                                            })}
                                        </Row>
                                    )}
                                </Card>

                                {/* --- 兑换区域 --- */}
                                <Card type="inner" title="3. Exchange for MyToken">
                                    {/* 使用 Flex 布局将按钮和辅助文本组合在一起 */}
                                    <Flex vertical gap="small">
                                        <Button
                                            block
                                            onClick={executeExchange}
                                            loading={isExchanging}
                                            disabled={!hasCompleteSet || isDrawing}
                                            size="large"
                                        >
                                            {/* 按钮文本变得非常简洁 */}
                                            {isExchanging ? exchangeStatus : "Exchange Full Set"}
                                        </Button>

                                        {/* 将详细信息作为辅助文本 */}
                                        <Typography.Text type="secondary" style={{ textAlign: 'center' }}>
                                            Exchange 12 NFTs for 1 {LocalUtils.TOKEN_NAME}
                                        </Typography.Text>
                                    </Flex>

                                    {/* 错误显示区域 */}
                                    {!isExchanging && exchangeError && (
                                        <Typography.Text type="danger" style={{ display: 'block', textAlign: 'center', marginTop: '10px' }}>
                                            Error: {exchangeError.shortMessage}
                                        </Typography.Text>
                                    )}

                                    <Typography.Text type={hasCompleteSet ? 'success' : 'secondary'} style={{ display: 'block', textAlign: 'center', marginTop: '8px' }}>
                                        {hasCompleteSet ? "You have a complete set! Ready to exchange." : "You need to collect all 12 Zodiacs to exchange."}
                                    </Typography.Text>
                                </Card>
                            </>
                        ) : (
                            <Typography.Text style={{ textAlign: 'center', display: 'block' }}>
                                Please connect your wallet to participate.
                            </Typography.Text>
                        )}
                    </Space>
                </Card>
            </Flex>
        </ConfigProvider>
    );
}
