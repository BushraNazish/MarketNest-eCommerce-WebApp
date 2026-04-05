import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/button';
import { useEffect, useState } from 'react';
import { vendorService } from '../../services/vendorService';

export const SellerDashboardPage = () => {
    const { logout } = useAuthStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, totalProducts: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await vendorService.getVendorDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to load seller stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
    };

    const handleLogout = () => {
        logout();
        navigate('/auth/login');
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold">Seller Dashboard</h1>
                    <Button variant="outline" onClick={() => navigate('/vendor/onboarding')}>
                        Complete Shop Profile
                    </Button>
                </div>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
                    <p className="text-3xl font-bold">{loading ? '...' : formatCurrency(stats.totalSales)}</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Orders</h3>
                        <p className="text-3xl font-bold mb-4">{loading ? '...' : stats.totalOrders}</p>
                    </div>
                    <Button onClick={() => navigate('/vendor/orders')} variant="default" className="w-full mt-4">Manage Orders</Button>
                </div>
                <div className="p-6 bg-white rounded-lg shadow flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Products</h3>
                        <p className="text-3xl font-bold mb-4">{loading ? '...' : stats.totalProducts}</p>
                    </div>
                    <Button onClick={() => navigate('/vendor/products')} variant="default" className="w-full">Manage Products</Button>
                </div>
                <div className="p-6 bg-white rounded-lg shadow flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Customer Reviews</h3>
                        <p className="text-sm text-gray-500 mb-4">View feedback from buyers</p>
                    </div>
                    <Button onClick={() => navigate('/vendor/reviews')} variant="outline" className="w-full">View Reviews</Button>
                </div>
            </div>
        </div>
    );
};
