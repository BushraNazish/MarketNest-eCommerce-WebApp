import type { Product } from '../../types/product';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { Heart, ShoppingCart } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

import { toast } from 'sonner';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const navigate = useNavigate();
    const { addItem: addToCart } = useCartStore();
    const { addItem: addToWishlist, removeItem: removeFromWishlist, wishlist } = useWishlistStore();
    const { isAuthenticated } = useAuthStore();

    const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
    const isInWishlist = wishlist?.items.some(item => item.productId === product.id);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            navigate('/auth/login');
            return;
        }
        addToCart(product.id, 1).then(() => {
            toast.success('Added to cart');
        }).catch(() => {
            toast.error('Failed to add to cart');
        });
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            navigate('/auth/login');
            return;
        }
        if (isInWishlist) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product.id);
        }
    };

    return (
        <Card className="h-full flex flex-col hover:shadow-lg transition-shadow group cursor-pointer" onClick={() => navigate(`/products/${product.slug}`)}>
            <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100">
                {primaryImage ? (
                    <img
                        src={primaryImage.imageUrl}
                        alt={product.name}
                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                    </div>
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleWishlist}
                >
                    <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </Button>
            </div>

            <CardHeader className="p-4">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-semibold line-clamp-1" title={product.name}>
                        {product.name}
                    </CardTitle>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1 min-h-[40px]">
                    {product.shortDescription || product.description}
                </p>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-grow">
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-gray-900">₹{product.salePrice ? product.salePrice.toFixed(2) : product.basePrice.toFixed(2)}</span>
                    {product.salePrice && product.basePrice > product.salePrice && (
                        <span className="text-sm text-gray-500 line-through">₹{product.basePrice.toFixed(2)}</span>
                    )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    {product.categoryName} • {product.vendorName}
                </p>
            </CardContent>

            <CardFooter className="p-4 pt-0 mt-auto">
                <Button className="w-full" onClick={handleAddToCart}>
                    <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                </Button>
            </CardFooter>
        </Card>
    );
}
