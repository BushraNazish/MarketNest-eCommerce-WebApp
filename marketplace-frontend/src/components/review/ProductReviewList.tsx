import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { reviewService } from '@/services/reviewService';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import type { ProductReview } from '@/types/review';

interface ProductReviewListProps {
    productId: string;
}

export function ProductReviewList({ productId }: ProductReviewListProps) {
    const [page, setPage] = useState(0);
    const [sortBy, setSortBy] = useState('createdAt');
    const [ratingFilter, setRatingFilter] = useState<number | undefined>();
    const { isAuthenticated } = useAuthStore();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['productReviews', productId, page, sortBy, ratingFilter],
        queryFn: () => reviewService.getProductReviews(productId, page, 5, sortBy, 'desc', ratingFilter)
    });

    const voteMutation = useMutation({
        mutationFn: ({ reviewId, isHelpful }: { reviewId: string; isHelpful: boolean }) =>
            reviewService.voteOnReview(reviewId, { isHelpful }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productReviews', productId] });
        },
        onError: () => {
            toast.error('Failed to register vote. Please try again.');
        }
    });

    const handleVote = (reviewId: string, isHelpful: boolean) => {
        if (!isAuthenticated) {
            toast.error('Please log in to vote on reviews');
            return;
        }
        voteMutation.mutate({ reviewId, isHelpful });
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-indigo-500" />
                        Customer Reviews
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Real feedback from verified buyers</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <select
                        value={sortBy}
                        onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
                        className="text-sm border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="createdAt">Most Recent</option>
                        <option value="rating">Highest Rating</option>
                        <option value="helpfulCount">Most Helpful</option>
                    </select>

                    <select
                        value={ratingFilter || ''}
                        onChange={(e) => {
                            setRatingFilter(e.target.value ? Number(e.target.value) : undefined);
                            setPage(0);
                        }}
                        className="text-sm border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">All Ratings</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="py-12 text-center text-gray-500 animate-pulse">Loading reviews...</div>
            ) : !data || data.content.length === 0 ? (
                <div className="py-16 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No reviews yet</h3>
                    <p className="text-gray-500 mb-4 max-w-sm mx-auto">Be the first to share your thoughts about this product after purchasing it!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {data.content.map((review: ProductReview) => (
                        <div key={review.id} className="pb-6 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 p-4 -mx-4 rounded-xl transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-indigo-700 font-bold shadow-sm">
                                        {review.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 flex items-center gap-2">
                                            {review.userName}
                                            {review.isVerifiedPurchase && (
                                                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold tracking-wide uppercase">
                                                    Verified
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                {renderStars(review.rating)}
                            </div>

                            <div className="mt-4">
                                <h4 className="font-bold text-gray-900 text-base">{review.title}</h4>
                                <p className="mt-2 text-gray-600 leading-relaxed">{review.body}</p>
                            </div>

                            {(review.pros.length > 0 || review.cons.length > 0) && (
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                    {review.pros.length > 0 && (
                                        <div>
                                            <span className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2 block">Pros</span>
                                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                                {review.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                    {review.cons.length > 0 && (
                                        <div>
                                            <span className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2 block">Cons</span>
                                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                                {review.cons.map((con, i) => <li key={i}>{con}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-6 flex items-center gap-4 text-sm">
                                <span className="text-gray-500 font-medium">Was this helpful?</span>
                                <button
                                    onClick={() => handleVote(review.id, true)}
                                    disabled={voteMutation.isPending}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-700 transition-all active:scale-95"
                                >
                                    <ThumbsUp className="w-4 h-4" />
                                    <span className="font-medium">{review.helpfulCount}</span>
                                </button>
                                <button
                                    onClick={() => handleVote(review.id, false)}
                                    disabled={voteMutation.isPending}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-700 transition-all active:scale-95"
                                >
                                    <ThumbsDown className="w-4 h-4" />
                                    <span className="font-medium">{review.notHelpfulCount}</span>
                                </button>
                                <button className="flex items-center gap-1 ml-auto text-gray-400 hover:text-red-500 transition-colors">
                                    <Flag className="w-4 h-4" /> Report
                                </button>
                            </div>
                        </div>
                    ))}

                    {data.totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-8 pt-4 border-t">
                            <Button
                                variant="outline"
                                disabled={page === 0}
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                            >
                                Previous
                            </Button>
                            <div className="flex items-center px-4 font-medium text-gray-600">
                                Page {page + 1} of {data.totalPages}
                            </div>
                            <Button
                                variant="outline"
                                disabled={page >= data.totalPages - 1}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
