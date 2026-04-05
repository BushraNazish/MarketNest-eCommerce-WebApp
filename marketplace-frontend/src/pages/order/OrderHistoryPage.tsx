import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/orderService';
import { Package, Search, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

export default function OrderHistoryPage() {
    const { data: orders, isLoading, error } = useQuery({
        queryKey: ['myOrders'],
        queryFn: orderService.getMyOrders,
    });

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Order History</h1>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-red-600">
                Failed to load order history. Please try again later.
            </div>
        );
    }

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency || 'INR',
        }).format(amount);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'DELIVERED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
            case 'RETURNED':
                return 'bg-red-100 text-red-800';
            case 'SHIPPED':
                return 'bg-blue-100 text-blue-800';
            case 'PROCESSING':
            case 'CONFIRMED':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search orders..."
                        className="pl-9"
                    />
                </div>
            </div>

            {!orders || orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                    <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                    <Link to="/products/search">
                        <Button>Start Shopping</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const formattedDate = new Intl.DateTimeFormat('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        }).format(new Date(order.placed_at));
                        return (
                            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-gray-900">
                                                Order #{order.order_number}
                                            </h3>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Placed on {formattedDate}
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                                        <div className="text-lg font-semibold text-gray-900">
                                            {formatCurrency(order.grand_total, order.currency)}
                                        </div>
                                        <Link to={`/orders/${order.id}`}>
                                            <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                                View Details <ExternalLink className="w-4 h-4 ml-2" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
