import { create } from 'zustand'; // 1. 只从 'zustand' 导入 create
import { persist, createJSONStorage } from 'zustand/middleware';

// 你的 State 类型定义保持不变
interface AuthState {
    token: string | null;
    user: { id: string; name: string } | null;
    setToken: (token: string, user: { id: string; name: string }) => void;
    logout: () => void;
}

// 2. 使用 create 直接创建并导出自定义 Hook
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            setToken: (token, user) => set({ token, user }),
            logout: () => set({ token: null, user: null }),
        }),
        {
            name: 'auth-storage', // 在 localStorage 中的键名
            storage: createJSONStorage(() => localStorage), // 指定使用 localStorage
        }
    )
);
