import { Outlet } from 'react-router-dom'
import Filters from "../components/Filters";

export default function MainLayout() {
    return (
        <div>
            <header className='flex flex-col items-center bg-yellow-600'>
                {/* === Здесь вставляем фильтры === */}
                <div>
                <Filters />
                </div>
            </header>

            <main>
                <Outlet />
            </main>

            <footer className='flex flex-col items-center bg-yellow-500'>
                {/* Footer will be added here */}
                <p>© 2025 Secure Device Analyzer</p>
            </footer>
        </div>
    )
}