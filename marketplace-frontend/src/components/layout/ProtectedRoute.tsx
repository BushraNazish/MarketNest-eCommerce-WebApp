import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export const ProtectedRoute = () => {
    const { isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <main className="container mx-auto py-8">
                <Outlet />
            </main>
        </div>
    );
};
