import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { reviewService } from '@/services/reviewService';
import type { OrderItemResponse } from '@/types/order';

interface ProductReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderItem: OrderItemResponse | null;
}

export function ProductReviewModal({ isOpen, onClose, orderItem }: ProductReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [pros, setPros] = useState('');
    const [cons, setCons] = useState('');

    const submitMutation = useMutation({
        mutationFn: (data: any) => reviewService.submitProductReview(data),
        onSuccess: () => {
            toast.success('Review submitted successfully!');
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to submit review');
        }
    });

    const handleClose = () => {
        setRating(0);
        setTitle('');
        setBody('');
        setPros('');
        setCons('');
        onClose();
    };

    const handleSubmit = () => {
        if (!orderItem) return;
        if (!orderItem.product_id) {
            toast.error('Product ID is missing. Please refresh the page to get the latest order data.');
            return;
        }
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }
        if (!title || !body) {
            toast.error('Title and body are required');
            return;
        }

        submitMutation.mutate({
            productId: orderItem.product_id,
            orderItemId: orderItem.id,
            rating,
            title,
            body,
            pros: pros.split(',').map(s => s.trim()).filter(Boolean),
            cons: cons.split(',').map(s => s.trim()).filter(Boolean),
            images: [] // Assuming no image upload for MVP yet
        });
    };

    if (!orderItem) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Write a Review</DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">For {orderItem.product_name}</p>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">Overall Rating <span className="text-red-500">*</span></Label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className="p-1 focus:outline-none transition-colors"
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    onClick={() => setRating(star)}
                                >
                                    <Star
                                        className={`w-8 h-8 ${star <= (hoveredRating || rating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="review-title" className="text-sm font-medium text-gray-700">Add a headline <span className="text-red-500">*</span></Label>
                        <Input
                            id="review-title"
                            placeholder="What's most important to know?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="review-body" className="text-sm font-medium text-gray-700">Add a written review <span className="text-red-500">*</span></Label>
                        <Textarea
                            id="review-body"
                            placeholder="What did you like or dislike? What did you use this product for?"
                            className="resize-none h-32"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <Label htmlFor="review-pros" className="text-sm font-medium text-gray-700">Pros</Label>
                            <Input
                                id="review-pros"
                                placeholder="Comma separated..."
                                value={pros}
                                onChange={(e) => setPros(e.target.value)}
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="review-cons" className="text-sm font-medium text-gray-700">Cons</Label>
                            <Input
                                id="review-cons"
                                placeholder="Comma separated..."
                                value={cons}
                                onChange={(e) => setCons(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitMutation.isPending}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {submitMutation.isPending ? 'Submitting...' : 'Submit Review'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
