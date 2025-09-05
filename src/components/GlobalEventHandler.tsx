// src/components/GlobalEventHandler.tsx
import {useEffect} from 'react';
import {EVENT_NAMES, eventBus} from '../utils/eventBus';
import {useAuthStore} from '../hooks/useAuthStore';
import {APP_ROUTES} from '../constants/routes';
import {useNavigate} from "react-router-dom";

// 这个组件没有 UI，它的唯一作用就是监听全局事件
export function GlobalEventHandler() {
    const navigate = useNavigate();
    const { logout } = useAuthStore();
    useEffect(() => {
        // 监听“未授权”事件
        // 组件卸载时取消订阅
        return eventBus.on(EVENT_NAMES.UNAUTHORIZED, () => {
            console.log('Unauthorized event caught! Logging out and redirecting...');
            logout();
            navigate(APP_ROUTES.STUDY_ANTD, {replace: true});
        });
    }, [navigate, logout]); // 依赖项

    return null; // 不渲染任何东西
}
