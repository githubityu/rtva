// src/stores/useSettingsStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
    theme: 'light' | 'dark';
    language: 'en' | 'zh';
    // 我们再加一个不想被保存的状态，用于演示
    lastVisited: Date | null;
    toggleTheme: () => void;
    setLanguage: (lang: 'en' | 'zh') => void;
    updateLastVisited: () => void;
}

// 2. 将你的 create 函数用 persist(...) 包裹起来
export const useSettingsStore = create<SettingsState>()(
    persist(
        // 你的 store 定义（和以前一样）
        (set) => ({
            theme: 'light',
            language: 'en',
            lastVisited: null,
            toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
            setLanguage: (lang) => set({ language: lang }),
            updateLastVisited: () => set({ lastVisited: new Date() }),
        }),

        // 3. 第二个参数是 persist 的配置对象
        {
            name: 'user-settings-storage', // 存储在 localStorage 中的 key，必须是唯一的！

            // (可选) 指定存储引擎。默认是 localStorage。
            // createJSONStorage 是一个帮助函数，可以轻松地使用 localStorage, sessionStorage, 或者其他兼容的存储 API
            storage: createJSONStorage(() => localStorage),
            // 如果你想用 sessionStorage，就改成：
            // storage: createJSONStorage(() => sessionStorage),

            // (可选) 只持久化部分 state。这非常有用！
            partialize: (state) => ({
                theme: state.theme,
                language: state.language,
            }), // 在这个例子中，`lastVisited` 状态不会被保存到 localStorage
        }
    )
);
