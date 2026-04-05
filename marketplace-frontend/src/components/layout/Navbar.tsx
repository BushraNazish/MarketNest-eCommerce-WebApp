import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { ShoppingCart, Heart, User, Store, Package, ShieldAlert } from 'lucide-react';
import { useEffect } from 'react';

export default function Navbar() {
    const navigate = useNavigate();
    const { isAuthenticated, role } = useAuthStore();
    const { cart, fetchCart } = useCartStore();
    const { wishlist, fetchWishlist } = useWishlistStore();

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
            fetchWishlist();
        }
    }, [isAuthenticated, fetchCart, fetchWishlist]);

    const totalItems = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;
    const wishlistCount = wishlist?.items.length || 0;

    return (
        <header className="bg-white shadow sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
                    MarketNest
                </Link>

                <div className="flex items-center gap-2 md:gap-4">
                    <Link to="/products/search">
                        <Button variant="ghost">Browse</Button>
                    </Link>

                    {isAuthenticated ? (
                        <>
                            {role === 'SELLER' && (
                                <Link to="/vendor/dashboard">
                                    <Button variant="ghost" size="sm">
                                        <Store className="w-5 h-5 mr-1" /> Seller Hub
                                    </Button>
                                </Link>
                            )}

                            {role === 'ADMIN' && (
                                <Link to="/admin/dashboard">
                                    <Button variant="ghost" size="sm">
                                        <ShieldAlert className="w-5 h-5 mr-1" /> Admin Panel
                                    </Button>
                                </Link>
                            )}

                            {role !== 'SELLER' && (
                                <>
                                    <Link to="/wishlist">
                                        <Button variant="ghost" size="icon" className="relative">
                                            <Heart className="w-5 h-5" />
                                            {wishlistCount > 0 && (
                                                <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                                                    {wishlistCount}
                                                </span>
                                            )}
                                        </Button>
                                    </Link>

                                    <Link to="/cart">
                                        <Button variant="ghost" size="icon" className="relative">
                                            <ShoppingCart className="w-5 h-5" />
                                            {totalItems > 0 && (
                                                <span className="absolute top-0 right-0 h-4 w-4 bg-indigo-600 rounded-full text-xs text-white flex items-center justify-center">
                                                    {totalItems}
                                                </span>
                                            )}
                                        </Button>
                                    </Link>
                                    <Link to="/orders">
                                        <Button variant="ghost">
                                            <Package className="w-5 h-5 mr-1" /> My Orders
                                        </Button>
                                    </Link>
                                </>
                            )}

                            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                                <User className="w-5 h-5 mr-1" /> Dashboard
                            </Button>
                        </>
                    ) : (
                        <div className="flex gap-2">
                            <Link to="/auth/login"><Button variant="ghost">Sign In</Button></Link>
                            <Link to="/auth/register"><Button>Register</Button></Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
