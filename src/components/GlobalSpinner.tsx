// src/components/GlobalSpinner.tsx

import { Spin } from 'antd';
import {useUIStore} from "../hooks/useUIStore.ts";
import React from "react"; // 使用 Ant Design 的 Spin 组件作为示例

const spinnerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 半透明遮罩层
    zIndex: 9999, // 确保在最上层
};

export function GlobalSpinner() {
    // 2. 订阅 isGlobalLoading 状态
    const isGlobalLoading = useUIStore((state) => state.isGlobalLoading);

    // 3. 如果不在加载中，就什么都不渲染
    if (!isGlobalLoading) {
        return null;
    }

    // 如果在加载中，就显示一个全屏的加载动画
    return (
        <div style={spinnerStyle}>
        <Spin size="large" />
            </div>
    );
}
