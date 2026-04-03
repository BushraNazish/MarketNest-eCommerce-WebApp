import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/button';

export const SellerDashboardPage = () => {
    const { logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/auth/login');
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Seller Dashboard</h1>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
                    <p className="text-3xl font-bold">$0.00</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Orders</h3>
                    <p className="text-3xl font-bold">0</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Products</h3>
                    <p className="text-3xl font-bold">0</p>
                </div>
            </div>
        </div>
    );
};
