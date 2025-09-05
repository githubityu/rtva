// App.tsx

import {BrowserRouter, Routes, Route} from 'react-router-dom';
import OriginalSwapPage from './pages/OriginalSwapPage'; // 假设你的页面路径是这样
import AntdSwapPage from './pages/AntdSwapPage';     // 假设你的页面路径是这样
import {APP_ROUTES} from './constants/routes';
import StudyWeb3 from "./pages/StudyWeb3.tsx";
import StudyAntd from "./pages/StudyAntd.tsx";
import {GlobalEventHandler} from "./components/GlobalEventHandler.tsx";
import {GlobalSpinner} from "./components/GlobalSpinner.tsx";
import AntdDepositPage from "./pages/AntdDepositPage.tsx";
import AntdZodiacPage from "./pages/AntdZodiacPage.tsx";
import AdminPage from "./pages/AdminPage.tsx";
import UniswapInteractionPage from "./pages/UniswapInteractionPage.tsx";

export default function App2() {
    return (
        <BrowserRouter>
            <GlobalEventHandler />
            <GlobalSpinner />

            {/* 你可以在这里放一个全局的导航栏 */}
            {/* <Navbar /> */}

            {/* 使用 <main> 标签包裹你的主要路由内容 */}
            <main>
                <Routes>
                    <Route path={APP_ROUTES.HOME} element={<OriginalSwapPage />} />
                    <Route path={APP_ROUTES.ANTD_SWAP} element={<AntdSwapPage />} />
                    <Route path={APP_ROUTES.STUDY_WEB3} element={<StudyWeb3 />} />
                    <Route path={APP_ROUTES.STUDY_ANTD} element={<StudyAntd />} />
                    <Route path={APP_ROUTES.AntdDeposit} element={<AntdDepositPage />} />
                    <Route path={APP_ROUTES.AntdZodiac} element={<AntdZodiacPage />} />
                    <Route path={APP_ROUTES.Admin} element={<AdminPage />} />
                    <Route path={APP_ROUTES.UniSwap} element={<UniswapInteractionPage />} />
                </Routes>
            </main>

            {/* 你可以在这里放一个全局的页脚 */}
            {/* <Footer /> */}
        </BrowserRouter>
    );
}
