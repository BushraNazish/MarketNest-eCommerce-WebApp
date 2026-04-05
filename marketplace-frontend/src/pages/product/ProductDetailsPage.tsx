import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Heart, Star, Store, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { ProductReviewList } from '@/components/review/ProductReviewList';
import type { Product } from '@/types/product';

export default function ProductDetailsPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { addItem: addToCart } = useCartStore();
    const { addItem: addToWishlist, removeItem: removeFromWishlist, wishlist } = useWishlistStore();
    const { isAuthenticated } = useAuthStore();

    // For simplicity, we fetch directly here. Ideally, add this to productService.ts
    const { data: product, isLoading, error } = useQuery<Product>({
        queryKey: ['product', slug],
        queryFn: async () => {
            const response = await api.get(`/products/slug/${slug}`);
            return response.data;
        },
        enabled: !!slug
    });

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (isLoading) return <div className="p-12 text-center text-gray-500">Loading product details...</div>;
    if (error || !product) return <div className="p-12 text-center text-red-500">Failed to load product.</div>;

    const isInWishlist = wishlist?.items.some(item => item.productId === product.id);
    const displayImage = selectedImage || (product.images?.find(img => img.isPrimary)?.imageUrl) || product.images?.[0]?.imageUrl;

    const handleAddToCart = () => {
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

    const handleWishlist = () => {
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
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-6 group">
                <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" /> Back
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 mb-16">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border">
                        {displayImage ? (
                            <img src={displayImage} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image Available</div>
                        )}
                    </div>
                    {product.images && product.images.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {product.images.map(img => (
                                <button
                                    key={img.id}
                                    onClick={() => setSelectedImage(img.imageUrl)}
                                    className={`w-20 h-20 flex-shrink-0 border-2 rounded-lg overflow-hidden transition-all ${displayImage === img.imageUrl ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-transparent hover:border-gray-200'}`}
                                >
                                    <img src={img.imageUrl} alt="thumbnail" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                    <div className="mb-2">
                        <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wide">
                            {product.categoryName}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4 leading-tight">
                        {product.name}
                    </h1>

                    {/* Ratings Summary (Placeholder until aggregated ratings are linked) */}
                    <div className="flex items-center gap-3 mb-6 bg-gray-50 w-max px-3 py-1.5 rounded-lg">
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                        </div>
                        <span className="text-sm font-medium text-gray-700">5.0</span>
                        <span className="text-sm text-gray-500 hover:text-indigo-600 cursor-pointer underline decoration-dotted underline-offset-4">(See reviews)</span>
                    </div>

                    <div className="flex items-end gap-3 mb-6">
                        <span className="text-4xl font-extrabold text-gray-900">₹{product.salePrice ? product.salePrice.toFixed(2) : product.basePrice.toFixed(2)}</span>
                        {product.salePrice && product.basePrice > product.salePrice && (
                            <span className="text-xl text-gray-500 line-through mb-1">₹{product.basePrice.toFixed(2)}</span>
                        )}
                    </div>

                    <p className="text-gray-600 text-base leading-relaxed mb-8">
                        {product.description || product.shortDescription || "No description provided."}
                    </p>

                    <Link to={`/vendor/${product.vendorId}`} className="block mb-8">
                        <div className="flex items-center gap-3 bg-white border rounded-xl p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                                <Store className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Sold by</p>
                                <p className="text-sm font-medium text-indigo-600 hover:underline">{product.vendorName}</p>
                            </div>
                        </div>
                    </Link>

                    <div className="mt-auto flex gap-4">
                        <Button onClick={handleAddToCart} size="lg" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-base h-12 shadow-md shadow-indigo-600/20">
                            <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                        </Button>
                        <Button onClick={handleWishlist} size="lg" variant="outline" className={`h-12 w-14 p-0 shrink-0 border-2 transition-colors ${isInWishlist ? 'border-red-200 bg-red-50 hover:bg-red-100' : ''}`}>
                            <Heart className={`h-6 w-6 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-gray-600'}`} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Separator */}
            <hr className="my-16 border-gray-200" />

            {/* Reviews Section */}
            <div className="mt-8">
                <ProductReviewList productId={product.id} />
            </div>
        </div>
    );
}
