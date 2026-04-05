import { useEffect } from 'react';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCartStore } from '../../store/useCartStore';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WishlistPage() {
    const { wishlist, fetchWishlist, removeItem, isLoading } = useWishlistStore();
    const { addItem: addToCart } = useCartStore();

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    if (isLoading && !wishlist) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!wishlist || wishlist.items.length === 0) {
        return (
            <div className="container mx-auto p-4 text-center">
                <h1 className="text-2xl font-bold mb-4">My Wishlist</h1>
                <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
                <Link to="/products/search"><Button>Browse Products</Button></Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">My Wishlist ({wishlist.items.length})</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {wishlist.items.map((item) => (
                    <div key={item.id} className="border rounded-lg overflow-hidden shadow-sm flex flex-col">
                        <div className="aspect-square bg-gray-100 relative">
                            {item.productImageUrl ? (
                                <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                            )}
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                            <h3 className="font-semibold text-lg hover:underline truncate">
                                <Link to={`/products/${item.productId}`}>{item.productName}</Link>
                            </h3>
                            <p className="text-lg font-bold mt-2">${item.price.toFixed(2)}</p>
                            <div className="mt-auto pt-4 flex gap-2">
                                <Button
                                    className="flex-1"
                                    onClick={() => addToCart(item.productId, 1)}
                                >
                                    <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeItem(item.productId)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
