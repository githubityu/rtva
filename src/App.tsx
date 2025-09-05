// App.tsx

// 删除路由相关导入
import AntdZodiacPage from "./pages/AntdZodiacPage.tsx";



export default function App() {
    return (
        <>

            {/* 全局导航栏（如需保留） */}
            {/* <Navbar /> */}

            {/* 直接渲染目标页面组件 */}
            <main>
                <AntdZodiacPage />
            </main>

            {/* 全局页脚（如需保留） */}
            {/* <Footer /> */}
        </>
    );
}
