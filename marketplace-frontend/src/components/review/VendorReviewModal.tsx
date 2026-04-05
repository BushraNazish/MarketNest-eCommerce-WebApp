import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { reviewService } from '@/services/reviewService';
import type { SubOrderResponse } from '@/types/order';

interface VendorReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    subOrder: SubOrderResponse | null;
}

export function VendorReviewModal({ isOpen, onClose, subOrder }: VendorReviewModalProps) {
    const [overallRating, setOverallRating] = useState(0);
    const [communicationRating, setCommunicationRating] = useState(0);
    const [shippingRating, setShippingRating] = useState(0);
    const [packagingRating, setPackagingRating] = useState(0);
    const [body, setBody] = useState('');

    const submitMutation = useMutation({
        mutationFn: (data: any) => reviewService.submitSellerReview(data),
        onSuccess: () => {
            toast.success('Feedback submitted successfully!');
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to submit feedback');
        }
    });

    const handleClose = () => {
        setOverallRating(0);
        setCommunicationRating(0);
        setShippingRating(0);
        setPackagingRating(0);
        setBody('');
        onClose();
    };

    const handleSubmit = () => {
        if (!subOrder) return;
        if (!subOrder.vendor_id) {
            toast.error('Vendor ID is missing. Please refresh the page to get the latest order data.');
            return;
        }
        if (!overallRating || !communicationRating || !shippingRating || !packagingRating) {
            toast.error('Please provide a rating for all categories');
            return;
        }

        submitMutation.mutate({
            vendorId: subOrder.vendor_id,
            subOrderId: subOrder.id,
            rating: overallRating,
            communicationRating,
            shippingRating,
            packagingRating,
            body,
        });
    };

    const renderStars = (rating: number, setRating: (r: number) => void) => (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    className="p-1 focus:outline-none transition-colors"
                    onClick={() => setRating(star)}
                >
                    <Star
                        className={`w-6 h-6 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                    />
                </button>
            ))}
        </div>
    );

    if (!subOrder) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Leave Seller Feedback</DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">For Sub-Order: {subOrder.sub_order_number}</p>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="grid gap-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-medium text-gray-700">Overall Experience *</Label>
                            {renderStars(overallRating, setOverallRating)}
                        </div>
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-medium text-gray-700">Communication *</Label>
                            {renderStars(communicationRating, setCommunicationRating)}
                        </div>
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-medium text-gray-700">Shipping Speed *</Label>
                            {renderStars(shippingRating, setShippingRating)}
                        </div>
                        <div className="flex justify-between items-center">
                            <Label className="text-sm font-medium text-gray-700">Packaging Quality *</Label>
                            {renderStars(packagingRating, setPackagingRating)}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="vendor-review-body" className="text-sm font-medium text-gray-700">Additional Comments (Optional)</Label>
                        <Textarea
                            id="vendor-review-body"
                            placeholder="How was your experience with this seller?"
                            className="resize-none h-24"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitMutation.isPending}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {submitMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
