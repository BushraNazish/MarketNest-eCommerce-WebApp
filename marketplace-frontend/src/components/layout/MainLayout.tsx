import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <footer className="bg-white border-t mt-auto">
                <div className="container mx-auto px-4 py-6 text-center text-gray-500 text-sm">
                    © 2026 MarketNest. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
