import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { vendorService } from '../../services/vendorService';
import { productService } from '../../services/productService';
import { reviewService } from '../../services/reviewService';
import { Star, Store, Package, MessageSquare } from 'lucide-react';
import { ProductCard } from '../../components/products/ProductCard';

export default function VendorProfilePage() {
    const { id: vendorId } = useParams<{ id: string }>();
    const [activeTab, setActiveTab] = useState<'products' | 'reviews'>('products');

    const { data: vendor, isLoading: isLoadingVendor } = useQuery({
        queryKey: ['vendor', vendorId],
        queryFn: () => vendorService.getPublicVendorProfile(vendorId!),
        enabled: !!vendorId,
    });

    const { data: productsData, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['vendorProducts', vendorId],
        queryFn: () => productService.getProductsByVendor(vendorId!),
        enabled: !!vendorId && activeTab === 'products',
    });

    const { data: reviewsData, isLoading: isLoadingReviews } = useQuery({
        queryKey: ['vendorReviews', vendorId],
        queryFn: () => reviewService.getSellerReviews(vendorId!),
        enabled: !!vendorId && activeTab === 'reviews',
    });

    if (isLoadingVendor) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-gray-500">
                Vendor not found.
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Vendor Banner Header */}
            <div className="bg-white border-b">
                <div
                    className="h-64 w-full bg-indigo-100 bg-cover bg-center"
                    style={vendor.storeBannerUrl ? { backgroundImage: `url(${vendor.storeBannerUrl})` } : undefined}
                >
                    {!vendor.storeBannerUrl && (
                        <div className="h-full flex items-center justify-center text-indigo-300">
                            <Store className="h-24 w-24 opacity-50" />
                        </div>
                    )}
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative -mt-16 flex items-end justify-between pb-8">
                        <div className="flex items-end space-x-5">
                            <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white bg-white shadow-lg">
                                {vendor.storeLogoUrl ? (
                                    <img src={vendor.storeLogoUrl} alt={vendor.storeName} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
                                        {vendor.storeName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="pb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{vendor.storeName}</h1>
                                <p className="text-gray-500">{vendor.businessName}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border">
                            <Star className="h-5 w-5 text-yellow-400 fill-current" />
                            <span className="font-bold text-gray-900">{vendor.ratingAverage?.toFixed(1) || '0.0'}</span>
                            <span className="text-gray-500 text-sm">({vendor.ratingCount || 0} reviews)</span>
                        </div>
                    </div>
                    {vendor.storeDescription && (
                        <div className="pb-8 max-w-3xl text-gray-600">
                            <p>{vendor.storeDescription}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs & Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`${activeTab === 'products'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                        >
                            <Package className="mr-2 h-5 w-5" />
                            Products
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`${activeTab === 'reviews'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                        >
                            <MessageSquare className="mr-2 h-5 w-5" />
                            Reviews
                        </button>
                    </nav>
                </div>

                <div className="mt-8">
                    {/* Products Tab */}
                    {activeTab === 'products' && (
                        <div>
                            {isLoadingProducts ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : productsData?.content && productsData.content.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {productsData.content.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-100">
                                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                    <p className="text-lg font-medium text-gray-900">No products found</p>
                                    <p>This vendor hasn't listed any products yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reviews Tab */}
                    {activeTab === 'reviews' && (
                        <div>
                            {isLoadingReviews ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : reviewsData?.content && reviewsData.content.length > 0 ? (
                                <div className="space-y-6">
                                    {reviewsData.content.map((review) => (
                                        <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                                                        {review.userName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-gray-900">{review.userName}</h4>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`h-4 w-4 ${star <= review.rating
                                                                ? 'text-yellow-400 fill-current'
                                                                : 'text-gray-300'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-gray-700 italic">"{review.body}"</p>
                                            <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
                                                <div className="bg-gray-50 p-2 rounded">
                                                    <span className="text-gray-500 block mb-1">Communication</span>
                                                    <div className="flex">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star key={`comm-${star}`} className={`h-3 w-3 ${star <= review.communicationRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-2 rounded">
                                                    <span className="text-gray-500 block mb-1">Shipping time</span>
                                                    <div className="flex">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star key={`ship-${star}`} className={`h-3 w-3 ${star <= review.shippingRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-2 rounded">
                                                    <span className="text-gray-500 block mb-1">Packaging</span>
                                                    <div className="flex">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star key={`pack-${star}`} className={`h-3 w-3 ${star <= review.packagingRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-100">
                                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                    <p className="text-lg font-medium text-gray-900">No reviews yet</p>
                                    <p>Customers haven't left any feedback for this vendor.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
