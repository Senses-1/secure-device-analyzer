import { Outlet } from 'react-router-dom'
import Test from "../components/Test";

export default function MainLayout() {
    return (
        <div>
            <header className='flex flex-col items-center bg-yellow-500'>
                <h1>Very beautiful project</h1>
                {/* === Здесь вставляем фильтры === */}
                <div className="mt-1">
                <Test />
                </div>
            </header>

            <main>
                <Outlet />
            </main>

            <footer className='flex flex-col items-center bg-yellow-500'>
                {/* Footer will be added here */}
                <p>© 2025</p>
            </footer>
        </div>
    )
}