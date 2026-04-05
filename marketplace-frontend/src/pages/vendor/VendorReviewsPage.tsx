import { useQuery } from '@tanstack/react-query';
import { reviewService } from '../../services/reviewService';
import { Star, MessageSquare } from 'lucide-react';

export default function VendorReviewsPage() {
    const { data: reviewsData, isLoading } = useQuery({
        queryKey: ['mySellerReviews'],
        queryFn: () => reviewService.getMySellerReviews(),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Customer Feedback</h1>
            </div>

            {reviewsData?.content && reviewsData.content.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {reviewsData.content.map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                            <div className="md:w-1/3 flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-gray-900">{review.userName}</h4>
                                    <p className="text-sm text-gray-500 mb-2">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </p>
                                    <div className="flex items-center mb-1 bg-gray-50 w-fit px-2 py-1 rounded">
                                        <span className="text-sm font-medium mr-2">Overall:</span>
                                        <div className="flex">
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
                                    <p className="text-xs text-indigo-600 font-medium mt-2">
                                        Order: {review.subOrderId?.substring(0, 8)}...
                                    </p>
                                </div>
                            </div>

                            <div className="md:w-2/3">
                                {review.body ? (
                                    <p className="text-gray-700 italic border-l-4 border-indigo-100 pl-4 py-1">"{review.body}"</p>
                                ) : (
                                    <p className="text-gray-400 italic">No text review provided.</p>
                                )}

                                <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
                                    <div className="">
                                        <span className="text-gray-500 block mb-1">Communication</span>
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star key={`comm-${star}`} className={`h-3 w-3 ${star <= review.communicationRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="">
                                        <span className="text-gray-500 block mb-1">Shipping time</span>
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star key={`ship-${star}`} className={`h-3 w-3 ${star <= review.shippingRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="">
                                        <span className="text-gray-500 block mb-1">Packaging</span>
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star key={`pack-${star}`} className={`h-3 w-3 ${star <= review.packagingRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-100 px-4">
                    <MessageSquare className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-xl font-medium text-gray-900 mb-2">No feedback yet</p>
                    <p className="max-w-md mx-auto">When customers receive their orders, they can leave feedback about their experience with your store.</p>
                </div>
            )}
        </div>
    );
}
