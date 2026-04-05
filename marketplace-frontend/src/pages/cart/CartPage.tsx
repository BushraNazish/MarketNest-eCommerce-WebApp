import { useEffect } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CartPage() {
    const { cart, fetchCart, updateItem, removeItem, isLoading } = useCartStore();

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    if (isLoading && !cart) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container mx-auto p-4 text-center">
                <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
                <p className="text-gray-500 mb-4">Your cart is empty.</p>
                <Link to="/products/search"><Button>Start Shopping</Button></Link>
            </div>
        )
    }

    const handleQuantityChange = (itemId: number, newQty: number) => {
        if (newQty < 1) return;
        updateItem(itemId, newQty);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {cart.items.map((item) => (
                        <div key={item.id} className="flex gap-4 border rounded-lg p-4 items-center">
                            <div className="h-24 w-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                {item.productImageUrl ? (
                                    <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">No Img</div>
                                )}
                            </div>

                            <div className="flex-grow">
                                <h3 className="font-semibold hover:underline">
                                    <Link to={`/products/${item.productId}`}>{item.productName}</Link>
                                </h3>
                                <p className="text-lg font-bold mt-1">${item.price.toFixed(2)}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>
                                    <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>

                            <div className="w-24 text-right font-bold">
                                ${item.subtotal.toFixed(2)}
                            </div>

                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => removeItem(item.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-1">
                    <div className="border rounded-lg p-6 bg-gray-50">
                        <h2 className="text-lg font-bold mb-4">Order Summary</h2>
                        <div className="flex justify-between mb-4">
                            <span>Subtotal</span>
                            <span className="font-bold">${cart.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-4">
                            <Link to="/checkout" className="block w-full">
                                <Button className="w-full text-lg py-6">Proceed to Checkout</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
