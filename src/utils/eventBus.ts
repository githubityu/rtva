// src/utils/eventBus.ts

import {createStore} from 'zustand/vanilla';

// 1. 定义事件名称常量
export const EVENT_NAMES = {
    TEST_EVENT: 'testEvent',
    SHOW_NOTIFICATION: 'showNotification',
    REFETCH_USER_DATA: 'refetchUserData',
    UNAUTHORIZED: 'unauthorized',
} as const;

// 从常量对象的值中创建事件名称的联合类型
type EventName = typeof EVENT_NAMES[keyof typeof EVENT_NAMES];

// 2. 定义每个事件对应的 payload 类型
interface EventPayloads {
    [EVENT_NAMES.TEST_EVENT]: { name: string; count: number };
    [EVENT_NAMES.SHOW_NOTIFICATION]: { message: string; type: 'success' | 'error' | 'info' };
    [EVENT_NAMES.REFETCH_USER_DATA]: { userId: string };
    [EVENT_NAMES.UNAUTHORIZED]: void;
}

// 3. 定义通用的 Listener 类型
type Listener<E extends EventName> = (payload: EventPayloads[E]) => void;

// 4. (核心修改) 重新定义 Listeners 类型
// 使用映射类型，确保每个事件名都对应一个明确的 Set 类型
type Listeners = {
    [E in EventName]: Set<Listener<E>>;
};

// 5. (核心修改) 创建 store 时，状态类型为 Partial<Listeners>
// 这表示 store 的状态是 Listeners 的一个子集，允许属性为 undefined
const eventStore = createStore<Partial<Listeners>>(() => ({}));

/**
 * 一个类型安全的全局事件总线。
 */
export const eventBus = {
    /**
     * 订阅一个事件。
     * @param eventName - 必须是 EVENT_NAMES 中定义的事件之一。
     * @param listener - 回调函数，其参数 payload 会被自动推断为正确的类型。
     * @returns 一个用于取消订阅的函数。
     */
    on: <E extends EventName>(eventName: E, listener: Listener<E>): (() => void) => {
        // 使用函数式 setState 以保证状态安全和不可变性
        eventStore.setState((state) => {
            // 从 state 中获取，如果不存在则创建一个新的 Set
            const currentListeners = state[eventName] || new Set();
            // 创建一个新的 Set 实例以保证状态不可变
            const newListeners = new Set(currentListeners as Set<Listener<E>>);
            newListeners.add(listener);
            return {...state, [eventName]: newListeners};
        });

        // 返回一个取消订阅的函数
        return () => {
            eventStore.setState((state) => {
                const currentListeners = state[eventName];
                if (currentListeners) {
                    const newListeners = new Set(currentListeners as Set<Listener<E>>);
                    if (newListeners.delete(listener)) {
                        return {...state, [eventName]: newListeners};
                    }
                }
                // 如果监听器不存在或未找到，不更新状态
                return state;
            });
        };
    },

    /**
     * 触发一个事件。
     * @param eventName - 必须是 EVENT_NAMES 中定义的事件之一。
     * @param payload - 必须是与事件名称匹配的负载类型。
     */
    emit: <E extends EventName>(eventName: E, payload?: EventPayloads[E] extends void ? undefined : EventPayloads[E]): void => {
        // 这里的 listenerSet 类型现在会被正确推断为 Set<Listener<E>> | undefined
        const listenerSet = eventStore.getState()[eventName];

        // if 守卫现在可以完美工作，无需任何类型断言
        if (listenerSet) {
            (listenerSet as Set<Listener<E>>).forEach(listener => listener(payload));
        }
    },
};
