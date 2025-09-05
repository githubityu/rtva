import {
    useAccount,
} from 'wagmi';
import {
    Button,
    Card,
    Typography,
    Space,
    Flex,
    ConfigProvider,
    theme,
    Spin,
    Tabs,
    InputNumber,
    Select,
    App
} from 'antd';

// 导入我们创建的合约工具文件
import { TOKENS } from '../utils/uniswapContracts.ts';
import {useUniswapLiquidity, useUniswapSwap} from "../hooks/useUniswap.ts";

const { darkAlgorithm } = theme;
const { Text } = Typography;

// =================================================================================================
// 3. UI 组件 (现在非常简洁)
// =================================================================================================
function SwapComponent() {
    const {
        tokenInSymbol, setTokenInSymbol,
        tokenOutSymbol, setTokenOutSymbol,
        amountIn, setAmountIn,
        amountOut,
        balanceIn,
        handleSwap, handleSetMax,
        isQuoting,
        isLoading,
        getButtonText
    } = useUniswapSwap();

    return (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <InputNumber
                addonBefore={<Select value={tokenInSymbol} onChange={setTokenInSymbol} options={Object.values(TOKENS).map(t => ({ value: t.symbol, label: t.symbol }))} />}
                addonAfter={<Button type="link" onClick={handleSetMax}>Max</Button>}
                value={amountIn}
                onChange={(v) => setAmountIn(v?.toString() || '')}
                style={{ width: '100%' }} size="large" placeholder="0.0" stringMode
            />
            <Text style={{ textAlign: 'right', display: 'block' }}>
                余额: {balanceIn ? `${parseFloat(balanceIn.formatted).toFixed(4)} ${balanceIn.symbol}` : '...'}
            </Text>
            <InputNumber
                addonBefore={<Select value={tokenOutSymbol} onChange={setTokenOutSymbol} options={Object.values(TOKENS).map(t => ({ value: t.symbol, label: t.symbol }))} />}
                value={amountOut}
                readOnly style={{ width: '100%' }} size="large" placeholder="0.0"
                addonAfter={isQuoting ? <Spin size="small" /> : undefined}
            />
            <Button block type="primary" onClick={handleSwap} loading={isLoading} disabled={!amountIn || isLoading} size="large">
                {getButtonText()}
            </Button>
        </Space>
    );
}

// 文件位置: src/pages/UniswapInteractionPage.tsx

function AddLiquidityComponent() {
    const {
        tokenASymbol, setTokenASymbol,
        tokenBSymbol, setTokenBSymbol,
        amountA, setAmountA,
        amountB, setAmountB,
        balanceA, balanceB,
        lastEdited, setLastEdited,
        handleSetMax,
        handleAddLiquidity,
        isLoading,
        poolExists,
        getButtonText
    } = useUniswapLiquidity();

    const isInteractionLoading = isLoading && status !== 'idle';
    const isQuoteLoading = poolExists && isLoading && !isInteractionLoading;

    return (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Text>Token A</Text>
            <InputNumber
                addonBefore={<Select value={tokenASymbol} onChange={(v) => {setTokenASymbol(v); setAmountA(''); setAmountB('');}} options={Object.values(TOKENS).map(t => ({ value: t.symbol, label: t.symbol }))} />}
                addonAfter={<Button type="link" onClick={() => handleSetMax('A')}>Max</Button>}
                value={amountA}
                onChange={(v) => { setAmountA(v?.toString() || ''); setLastEdited('A'); }}
                style={{ width: '100%' }}
                size="large"
                placeholder="0.0"
                stringMode
                // 当池子存在且另一个输入框正在编辑时，此框变为只读
                readOnly={poolExists && lastEdited === 'B'}
            />
            <Text style={{ textAlign: 'right', display: 'block' }}>余额: {balanceA ? `${parseFloat(balanceA.formatted).toFixed(4)} ${balanceA.symbol}` : '...'}</Text>

            <Text>Token B</Text>
            <InputNumber
                addonBefore={<Select value={tokenBSymbol} onChange={(v) => {setTokenBSymbol(v); setAmountA(''); setAmountB('');}} options={Object.values(TOKENS).map(t => ({ value: t.symbol, label: t.symbol }))} />}
                value={amountB}
                onChange={(v) => { setAmountB(v?.toString() || ''); setLastEdited('B'); }}
                style={{ width: '100%' }}
                size="large"
                placeholder="0.0"
                stringMode
                // 当池子存在且另一个输入框正在编辑时，此框变为只读
                readOnly={poolExists && lastEdited === 'A'}
                addonAfter={isQuoteLoading ? <Spin size="small" /> : <Button type="link" onClick={() => handleSetMax('B')}>Max</Button>}
            />
            <Text style={{ textAlign: 'right', display: 'block' }}>余额: {balanceB ? `${parseFloat(balanceB.formatted).toFixed(4)} ${balanceB.symbol}` : '...'}</Text>

            {isLoading && !isInteractionLoading && <Flex justify="center"><Spin tip="正在查询流动性池..." /></Flex>}
            {!isLoading && !poolExists && (
                <Text type="warning" style={{ textAlign: 'center', display: 'block' }}>
                    流动性池不存在。你将是第一位提供者，请手动输入两种代币数量。
                </Text>
            )}

            <Button block type="primary" onClick={handleAddLiquidity} disabled={!amountA || !amountB || isLoading} loading={isInteractionLoading} size="large">
                {getButtonText()}
            </Button>
        </Space>
    );
}

// =================================================================================================
// 4. 页面框架 (无需改动)
// =================================================================================================
const PageContent = () => {
    const { isConnected } = useAccount();
    const items = [
        { key: '1', label: '交换 (Swap)', children: <SwapComponent /> },
        { key: '2', label: '添加流动性 (Liquidity)', children: <AddLiquidityComponent /> },
    ];
    return (
        <Card title="Uniswap V2 交互 (Sepolia)" style={{ width: '100%', maxWidth: '480px' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Flex justify="center"><w3m-button /></Flex>
                {isConnected ? (
                    <Tabs defaultActiveKey="2" items={items} centered />
                ) : (
                    <Text style={{ textAlign: 'center', display: 'block' }}>
                        请连接钱包以进行交互。
                    </Text>
                )}
            </Space>
        </Card>
    );
}

export default function UniswapInteractionPage() {
    return (
        <ConfigProvider theme={{ algorithm: darkAlgorithm, token: { colorPrimary: '#a042c1', colorBgContainer: '#1f1f1f' } }}>
            <App>
                <Flex align="center" justify="center" style={{ minHeight: '100vh', background: '#141414', padding: '2rem' }}>
                    <PageContent />
                </Flex>
            </App>
        </ConfigProvider>
    );
}
