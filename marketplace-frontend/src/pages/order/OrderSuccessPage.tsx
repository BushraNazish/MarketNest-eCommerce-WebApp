import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder } from '../../services/orderService';
import type { OrderResponse } from '../../types/order';

const OrderSuccessPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<OrderResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getOrder(id)
                .then(setOrder)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!order) return <div className="p-8 text-center text-red-600">Order not found.</div>;

    return (
        <div className="container mx-auto p-4 max-w-2xl text-center py-16">
            <div className="bg-green-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
                <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <h1 className="text-3xl font-bold mb-4 text-gray-900">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-8">Thank you for your purchase. Your order number is <span className="font-semibold text-gray-900">{order.order_number}</span></p>

            <div className="bg-gray-50 p-6 rounded-lg mb-8 text-left inline-block w-full max-w-md border border-gray-200 shadow-sm">
                <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Order Status:</span>
                    <span className="font-medium text-blue-600">{order.status}</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className={`font-medium ${order.payment_status === 'PAID' ? 'text-green-600' : 'text-orange-600'}`}>{order.payment_status}</span>
                </div>
                <div className="flex justify-between pt-2 border-t mt-2">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="font-bold text-lg">{order.currency} {order.grand_total}</span>
                </div>
            </div>

            <div className="flex justify-center gap-4">
                <Link to="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
