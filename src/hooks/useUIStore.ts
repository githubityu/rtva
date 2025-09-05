import { create } from 'zustand';

// 1. 定义 UI 状态的类型
interface UIState {
    isGlobalLoading: boolean;
    setGlobalLoading: (isLoading: boolean) => void;
}

// 2. 使用 `create` 函数直接创建并导出 useUIStore 这个自定义 Hook
export const useUIStore = create<UIState>((set) => ({
    // 定义初始状态
    isGlobalLoading: false,

    // 定义更新状态的方法
    setGlobalLoading: (isLoading) => set({ isGlobalLoading: isLoading }),
}));
