'use client';

import React, {useEffect} from 'react';
import {useAccount, useBalance, useReadContract} from 'wagmi';
import {formatUnits} from 'viem';

// 假设这些是你的自定义 Hooks
import {useZodiacDraw} from '../hooks/useZodiacDraw';
import {useZodiacExchange} from '../hooks/useZodiacExchange';
import {useZodiacBalanceV2} from "../hooks/useZodiacBalanceV2.ts";

// 假设这些是你的工具文件
import LocalUtils from "../utils/LocalUtils.ts";
import AppUtils from "../utils/appUtils.ts";

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
    Badge,
    Col,
    Row, App,
} from 'antd';

const {darkAlgorithm} = theme;

// 定义生肖的元数据，用于 UI 展示
const zodiacMeta = Array.from({length: 12}, (_, i) => ({
    id: i + 1,
    name: [
        '宙斯', '赫拉', '波塞冬', '德墨忒尔', '雅典娜', '阿波罗',
        '阿尔忒弥斯', ' 阿瑞斯', '阿芙罗狄忒', '赫菲斯托斯', '赫尔墨斯', '狄俄尼索斯'
    ][i],
    image: AppUtils.getPicById(i), // 确保图片路径正确
}));


export default function AntdZodiacPage() {
    // ✨ 主组件只负责提供上下文
    return (
        <ConfigProvider
            theme={{
                algorithm: darkAlgorithm,
                token: {
                    colorPrimary: '#a042c1',
                    colorBgContainer: 'black',
                    colorBgElevated: '#2d2d2d'
                }
            }}
        >
            <App>
                <ZodiacPageContent />
            </App>
        </ConfigProvider>
    );
}



 function ZodiacPageContent() {
    const {address, isConnected} = useAccount();
    const { message: messageApi } = App.useApp();
    // --- 使用自定义 Hooks ---
    // 1. 获取用户 NFT 余额
    const {ownedZodiacs, hasCompleteSet, isLoading: isLoadingBalance, refetchBalances} = useZodiacBalanceV2();

    // 2. 获取用户 MyToken 余额和合约门槛 (用于前端防御性检查)
    const {data: myTokenBalance, isLoading: isLoadingMyTokenBalance} = useBalance({
        address,
        token: LocalUtils.MY_TOKEN_ADDRESS,
        query: {enabled: isConnected},
    });

    const {data: myTokenThreshold, isLoading: isLoadingThreshold} = useReadContract({
        address: LocalUtils.ZODIAC_EXCHANGER_ADDRESS,
        abi: LocalUtils.ZODIAC_EXCHANGER_ABI,
        functionName: 'myTokenThreshold',
        query: {enabled: isConnected},
    });

    // 3. 抽奖功能 Hook
    const {
        executeDraw,
        isPending: isDrawing,
        status: drawStatus,
        drawnZodiacId,
        error: drawError
    } = useZodiacDraw(refetchBalances);

    // 4. 兑换功能 Hook
    // const { executeExchange, isPending: isExchanging, status: exchangeStatus, error: exchangeError } = useZodiacExchange(refetchBalances);

    const {
        executeExchange,
        isPending: isExchanging,
        status: exchangeStatus,
        error: exchangeError,
        isSuccess: isExchangeSuccess, // ✨ 成功获取！
    } = useZodiacExchange(refetchBalances); // 传入 refetchBalances 作为成功回调

    // --- 前端防御性逻辑 ---
    // 计算用户 MyToken 余额是否不足
    const isMyTokenBalanceInsufficient = myTokenBalance && myTokenThreshold
        ? myTokenBalance.value < myTokenThreshold
        : true;

    // 动态生成抽奖按钮的文本和禁用状态
    const getDrawButtonState = () => {
        if (!isConnected) return {text: '请连接钱包', disabled: true};
        if (isLoadingMyTokenBalance || isLoadingThreshold) return {text: '查询余额中...', disabled: true};
        if (isMyTokenBalanceInsufficient) {
            const thresholdFormatted = myTokenThreshold ? formatUnits(myTokenThreshold, 18) : '...';
            return {text: `至少需要 ${thresholdFormatted} LBB`, disabled: true};
        }
        if (isDrawing) return {text: '开奖中...', disabled: true}; // drawStatus 可能也是英文，这里直接用中文
        return {text: '立即抽奖', disabled: isExchanging};
    };
    const drawButtonState = getDrawButtonState();

    useEffect(() => {
        if (isExchangeSuccess) {
            messageApi.success('恭喜！兑换成功！');
        }
    }, [isExchangeSuccess, messageApi]);

    return (
        <Flex align="center" justify="center" style={{minHeight: '100vh',}}>
            <Card title="希腊神 NFT 抽奖 & 兑换" style={{width: '100%', maxWidth: '750px'}}>
                <Space direction="vertical" size="large" style={{width: '100%'}}>
                    <Flex justify="center">
                        <w3m-button/>
                    </Flex>

                    {isConnected ? (
                        <>
                            <Card type="inner" bodyStyle={{padding: '10px'}} bordered={false}>
                                <Flex vertical>
                                    {/* 操作区域 */}
                                    <Flex vertical gap="middle" style={{
                                        padding: '10px',
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                                    }}>
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Button
                                                    block
                                                    type="primary"
                                                    onClick={executeDraw}
                                                    loading={isDrawing}
                                                    disabled={drawButtonState.disabled}
                                                    size="large"
                                                >
                                                    {drawButtonState.text}
                                                </Button>
                                            </Col>
                                            <Col span={12}>
                                                <Button
                                                    block
                                                    onClick={executeExchange}
                                                    loading={isExchanging}
                                                    disabled={!hasCompleteSet || isDrawing}
                                                    size="large"
                                                >
                                                    {isExchanging ? '兑换中...' : "兑换整套"}
                                                </Button>
                                            </Col>
                                        </Row>

                                        {/* 抽奖结果和错误提示 */}
                                        {!isDrawing && !drawnZodiacId && drawError && (
                                            <Typography.Text type="danger" style={{textAlign: 'center'}}>
                                                抽奖失败: {drawError.shortMessage}
                                            </Typography.Text>
                                        )}
                                        {drawnZodiacId && !isDrawing && (
                                            <Result status="success"
                                                    title={`恭喜！你抽到了【${zodiacMeta[drawnZodiacId - 1].name}】!`}
                                                    style={{padding: 0, marginTop: '16px'}}/>
                                        )}

                                        {/* 兑换状态和错误提示 */}
                                        <Typography.Text type={hasCompleteSet ? 'success' : 'secondary'} style={{
                                            textAlign: 'center',
                                            marginTop: hasCompleteSet ? '0px' : '16px'
                                        }}>
                                            {hasCompleteSet ? "集齐所有希腊神！可以兑换了。" : "需要集齐全部12希腊神才能兑换。"}
                                        </Typography.Text>
                                        {!isExchanging && exchangeError && (
                                            <Typography.Text type="danger" style={{textAlign: 'center'}}>
                                                兑换失败: {exchangeError.shortMessage}
                                            </Typography.Text>
                                        )}
                                    </Flex>

                                    {/* NFT 收藏列表区域 */}
                                    <div style={{padding: '24px 0px'}}>
                                        {isLoadingBalance ?
                                            <Flex justify="center"><Spin tip="加载中..."/></Flex> : (
                                                <Row gutter={[16, 24]} justify="center">
                                                    {zodiacMeta.map(z => {
                                                        const owned = ownedZodiacs.find(o => o.id === z.id)?.balance ?? 0;
                                                        return (
                                                            <Col key={z.id} xs={8} sm={8} md={6} lg={6}>
                                                                <Flex vertical align="center" gap="small"
                                                                      style={{opacity: owned > 0 ? 1 : 0.3}}>
                                                                    <Badge count={owned} color="blue"
                                                                           offset={[-10, 10]}
                                                                           style={{boxShadow: 'none'}}>
                                                                        <img src={z.image} alt={z.name} width={100}
                                                                             style={{
                                                                                 borderRadius: '8px',
                                                                                 background: '#333'
                                                                             }}/>
                                                                    </Badge>
                                                                    <Tag>{z.name}</Tag>
                                                                </Flex>
                                                            </Col>
                                                        );
                                                    })}
                                                </Row>
                                            )}
                                    </div>
                                </Flex>
                            </Card>
                        </>
                    ) : (
                        <Typography.Text style={{textAlign: 'center', display: 'block'}}>
                            请连接你的钱包来参与活动。
                        </Typography.Text>
                    )}
                </Space>
            </Card>
        </Flex>
    );
}
