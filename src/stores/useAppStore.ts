import { create } from 'zustand';

// 模拟的 API 函数保持不变
const fetchUserDataAPI = async (userId: number): Promise<{ name: string; email: string }> => {
    console.log(`Fetching data for user ${userId}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (Math.random() > 0.2) {
        return { name: `User ${userId}`, email: `user${userId}@example.com` };
    } else {
        throw new Error('Failed to fetch user data from API.');
    }
};

// --- 1. 优化点：更完整的类型定义 ---

// 定义用户对象类型
interface User {
    id: number;
    name: string;
    email: string;
}

// 定义完整的 Store 状态类型
interface AppState {
    // 同步状态
    count: number;
    theme: 'light' | 'dark';

    // 异步相关状态
    user: User | null;
    isLoadingUser: boolean;
    error: string | null;

    // 操作 (actions)
    increment: () => void;
    decrement: (by: number) => void;
    toggleTheme: () => void;
    fetchUser: (userId: number) => Promise<void>; // fetchUser 是一个返回 Promise 的异步函数
    reset: () => void; // 添加一个重置函数
}

// --- 2. 优化点：分离 State 和 Actions，结构更清晰 ---

// 定义初始状态，方便重置
const initialState = {
    count: 0,
    theme: 'light' as const, // 使用 'as const' 获得更精确的类型
    user: null,
    isLoadingUser: false,
    error: null,
};

export const useAppStore = create<AppState>()((set, get) => ({
    ...initialState,

    // --- Actions ---

    increment: () => {
        set((state) => ({ count: state.count + 1 }));
    },

    decrement: (by) => {
        set((state) => ({ count: state.count - by }));
    },

    toggleTheme: () => {
        // --- 3. 优化点：使用 get() 获取当前状态，代码更简洁 ---
        const currentTheme = get().theme;
        set({ theme: currentTheme === 'light' ? 'dark' : 'light' });
    },

    fetchUser: async (userId) => {
        // 在 action 内部，如果只是为了设置状态，直接用 set 即可
        set({ isLoadingUser: true, error: null });

        try {
            const fetchedUser = await fetchUserDataAPI(userId);
            set({ user: { id: userId, ...fetchedUser }, isLoadingUser: false });
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
            set({ error: errorMessage, isLoadingUser: false, user: null }); // 失败时最好也清空 user
        }
    },

    // --- 4. 优化点：提供一个重置函数 ---
    reset: () => {
        set(initialState);
    },
}));
