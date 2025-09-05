// src/services/apiClient.ts

import axios, { type AxiosInstance, type AxiosRequestConfig, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { useAppStore } from '../stores/useAppStore';
import { eventBus, EVENT_NAMES } from './eventBus.ts';
import { notification } from 'antd';
import {useUIStore} from "../hooks/useUIStore.ts";

// 1. 定义我们期望的后端响应数据结构
interface ApiResponse<T = unknown> {
    code: number;
    msg: string;
    data: T;
}

// 2. 自定义请求配置
interface CustomRequestConfig extends AxiosRequestConfig {
    hideLoading?: boolean;
    isForm?: boolean;
}

// --- 基础配置 ---
const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com/v1',
    timeout: 10000,
});

// --- 拦截器 ---
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig & CustomRequestConfig) => {
        const token = useAppStore.getState?.().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers['Content-Type'] = config.isForm ? 'application/x-www-form-urlencoded' : 'application/json';
        if (!config.hideLoading) {
            useUIStore.getState?.().setGlobalLoading(true);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        useUIStore.getState?.().setGlobalLoading(false);
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            switch (status) {
                case 401:
                    notification.error({ message: '认证已过期', description: '请重新登录。' });
                    eventBus.emit(EVENT_NAMES.UNAUTHORIZED);
                    break;
                // ... 其他 case
                default:
                    notification.error({ message: '请求失败', description: error.response?.data?.msg || error.message });
                    break;
            }
        } else {
            notification.error({ message: '网络错误', description: '无法连接到服务器。' });
        }
        return Promise.reject(error);
    }
);

// 3. (核心) 处理函数 - 签名保持不变
async function handleRequest<T>(requestPromise: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
    try {
        const response = await requestPromise;
        const responseData = response.data;

        if (responseData) {
            if (responseData.code === 0) {
                return responseData.data;
            } else if (responseData.code === 10021 || responseData.code === 10020) {
                notification.error({ message: '登录失效', description: '您的登录已失效，请重新登录。' });
                eventBus.emit(EVENT_NAMES.UNAUTHORIZED);
                throw new Error('Login expired');
            } else {
                notification.error({ message: '操作失败', description: responseData.msg });
                throw new Error(responseData.msg);
            }
        } else {
            throw new Error('Invalid response format');
        }
    } finally {
        useUIStore.getState?.().setGlobalLoading(false);
    }
}

/**
 * 封装好的 API 请求服务
 */
export const apiService = {
    get: <T>(url: string, config?: CustomRequestConfig): Promise<T> => {
        // 确保 apiClient.get 的泛型是 ApiResponse<T>
        return handleRequest(apiClient.get<ApiResponse<T>>(url, config));
    },

    post: <T, D = unknown>(url: string, data?: D, config?: CustomRequestConfig): Promise<T> => {
        // 确保 apiClient.post 的泛型是 ApiResponse<T>
        return handleRequest(apiClient.post<ApiResponse<T>>(url, data, config));
    },

    put: <T, D = unknown>(url: string, data?: D, config?: CustomRequestConfig): Promise<T> => {
        // 确保 apiClient.put 的泛型是 ApiResponse<T>
        return handleRequest(apiClient.put<ApiResponse<T>>(url, data, config));
    },

    delete: <T>(url: string, config?: CustomRequestConfig): Promise<T> => {
        // 确保 apiClient.delete 的泛型是 ApiResponse<T>
        return handleRequest(apiClient.delete<ApiResponse<T>>(url, config));
    },

    uploadFile: <T>(
        url: string,
        file: File,
        name: string = 'file',
        formData: Record<string, string | number | boolean> = {},
        config: CustomRequestConfig = {}
    ): Promise<T> => {
        const data = new FormData();
        data.append(name, file);
        Object.keys(formData).forEach(key => {
            const value = formData[key];
            // FormData 会自动将 number 和 boolean 转换为字符串
            data.append(key, String(value));
        });

        const requestConfig: CustomRequestConfig = {
            ...config,
            headers: {
                'Content-Type': 'multipart/form-data',
                ...config.headers,
            },
        };

        return handleRequest(apiClient.post<ApiResponse<T>>(url, data, requestConfig));
    }
};

export default apiClient;
