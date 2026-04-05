import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Package, Truck, Calendar, Undo2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { orderService, getOrder } from '@/services/orderService';
import type { SubOrderResponse, OrderItemResponse, OrderStatusHistoryResponse } from '@/types/order';
import { ProductReviewModal } from '@/components/review/ProductReviewModal';
import { VendorReviewModal } from '@/components/review/VendorReviewModal';
function TrackingTimeline({ subOrderId }: { subOrderId: string }) {
    const { data: history, isLoading } = useQuery({
        queryKey: ['subOrderHistory', subOrderId],
        queryFn: () => orderService.getSubOrderHistory(subOrderId)
    });

    if (isLoading) return <div className="text-sm text-gray-500 py-2">Loading tracking history...</div>;
    if (!history || history.length === 0) return null;

    return (
        <div className="mt-4 border-t pt-4">
            <h5 className="text-sm font-semibold text-gray-900 mb-3">Tracking History</h5>
            <ol className="relative border-s border-gray-200 ml-2 space-y-4">
                {history.map((event: OrderStatusHistoryResponse) => (
                    <li key={event.id} className="ms-4">
                        <div className="absolute w-2.5 h-2.5 bg-indigo-500 rounded-full mt-1.5 -start-1.5 border border-white"></div>
                        <time className="mb-0.5 text-xs font-normal leading-none text-gray-400">
                            {new Date(event.created_at).toLocaleString()}
                        </time>
                        <h6 className="text-sm font-semibold text-gray-900">
                            {event.from_status ? `${event.from_status} → ` : ''}{event.to_status}
                        </h6>
                        {event.notes && <p className="text-sm font-normal text-gray-500">{event.notes}</p>}
                    </li>
                ))}
            </ol>
        </div>
    );
}

export default function OrderDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [selectedSubOrder, setSelectedSubOrder] = useState<SubOrderResponse | null>(null);
    const [returnForm, setReturnForm] = useState({
        reason: '',
        details: ''
    });

    const [isProductReviewOpen, setIsProductReviewOpen] = useState(false);
    const [selectedReviewItem, setSelectedReviewItem] = useState<OrderItemResponse | null>(null);

    const [isVendorReviewOpen, setIsVendorReviewOpen] = useState(false);
    const [selectedReviewSubOrder, setSelectedReviewSubOrder] = useState<SubOrderResponse | null>(null);

    const { data: order, isLoading, error } = useQuery({
        queryKey: ['order', id],
        queryFn: () => getOrder(id as string),
        enabled: !!id
    });

    const returnMutation = useMutation({
        mutationFn: (data: any) => orderService.initiateReturnRequest(data),
        onSuccess: () => {
            toast.success('Return requested successfully');
            setIsReturnModalOpen(false);
        },
        onError: () => {
            toast.error('Failed to submit return request');
        }
    });

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading order details...</div>;
    if (error || !order) return <div className="p-8 text-center text-red-500">Failed to load order.</div>;

    const handleReturnClick = (subOrder: SubOrderResponse) => {
        setSelectedSubOrder(subOrder);
        setReturnForm({ reason: '', details: '' });
        setIsReturnModalOpen(true);
    };

    const handleReturnSubmit = () => {
        if (!selectedSubOrder || !returnForm.reason) return;
        returnMutation.mutate({
            subOrderId: selectedSubOrder.id,
            itemsJson: JSON.stringify([{ action: "Return All Items" }]), // Simplified for now, but valid JSON
            reason: returnForm.reason,
            reasonDetails: returnForm.details
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DELIVERED': return 'bg-green-100 text-green-800';
            case 'SHIPPED': return 'bg-blue-100 text-blue-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            case 'RETURNED': return 'bg-purple-100 text-purple-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link to="/orders" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 border border-indigo-200 px-3 py-1.5 rounded-full mb-6 transition-colors hover:bg-indigo-50">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Orders
            </Link>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        Order #{order.order_number}
                        <span className={`px-3 py-1 text-xs rounded-full font-semibold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                            {order.status}
                        </span>
                    </h1>
                    <div className="flex items-center text-sm text-gray-500 mt-2 gap-4">
                        <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" /> {new Date(order.placed_at).toLocaleDateString()}</span>
                        <span>Total: <strong className="text-gray-900">₹{order.grand_total}</strong></span>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Shipments</h3>
                {order.sub_orders && order.sub_orders.map((subOrder: SubOrderResponse) => (
                    <div key={subOrder.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-5 border-b bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Package className="w-4 h-4 text-indigo-500" />
                                    Sub-Order: {subOrder.sub_order_number}
                                </h4>
                                <div className="text-sm text-gray-500 mt-1">Status: <span className={`font-medium ${getStatusColor(subOrder.status).split(' ')[1]}`}>{subOrder.status}</span></div>
                            </div>
                            <div className="flex gap-2">
                                {subOrder.status === 'DELIVERED' && (
                                    <>
                                        <Button variant="outline" size="sm" onClick={() => {
                                            setSelectedReviewSubOrder(subOrder);
                                            setIsVendorReviewOpen(true);
                                        }} className="text-yellow-600 border-yellow-200 hover:bg-yellow-50">
                                            <Star className="w-4 h-4 mr-1.5" /> Review Vendor
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleReturnClick(subOrder)} className="text-purple-600 border-purple-200 hover:bg-purple-50">
                                            <Undo2 className="w-4 h-4 mr-1.5" /> Request Return
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {subOrder.tracking_number && (
                            <div className="px-5 pt-4">
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
                                    <Truck className="w-5 h-5 text-blue-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-blue-900">Tracking Info</p>
                                        <p className="text-sm text-blue-700">{subOrder.carrier} - <span className="font-mono bg-blue-100 px-1.5 rounded">{subOrder.tracking_number}</span></p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="px-5">
                            <TrackingTimeline subOrderId={subOrder.id} />
                        </div>

                        <div className="p-5">
                            <ul className="divide-y divide-gray-100">
                                {subOrder.items.map((item: OrderItemResponse) => (
                                    <li key={item.id} className="py-4 flex justify-between items-center group">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">{item.product_name}</span>
                                            <span className="text-sm text-gray-500 mt-0.5">Qty: {item.quantity} × ₹{item.unit_price}</span>
                                            {subOrder.status === 'DELIVERED' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedReviewItem(item);
                                                        setIsProductReviewOpen(true);
                                                    }}
                                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-500 mt-2 flex items-center w-max"
                                                >
                                                    <Star className="w-3.5 h-3.5 mr-1" /> Write a Product Review
                                                </button>
                                            )}
                                        </div>
                                        <div className="font-medium text-gray-900">₹{item.total_amount}</div>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 pt-4 border-t flex justify-end">
                                <span className="font-semibold text-gray-900">Subtotal: ₹{subOrder.total_amount}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={isReturnModalOpen} onOpenChange={setIsReturnModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Undo2 className="w-5 h-5 text-purple-600" /> Request a Return</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 py-4">
                        <div className="bg-purple-50 p-3 rounded-lg text-sm text-purple-800 mb-2">
                            You are requesting exactly one return for all items in <strong>{selectedSubOrder?.sub_order_number}</strong>.
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-sm font-medium text-gray-700">Reason for Return</Label>
                            <Select value={returnForm.reason} onValueChange={(val) => setReturnForm({ ...returnForm, reason: val })}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DEFECTIVE">Item is defective or doesn't work</SelectItem>
                                    <SelectItem value="WRONG_ITEM">Wrong item was sent</SelectItem>
                                    <SelectItem value="NOT_AS_DESCRIBED">Item not as described</SelectItem>
                                    <SelectItem value="CHANGED_MIND">Changed my mind</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-sm font-medium text-gray-700">Additional Details (Optional)</Label>
                            <Textarea
                                placeholder="Please provide any additional context..."
                                value={returnForm.details}
                                onChange={(e) => setReturnForm({ ...returnForm, details: e.target.value })}
                                className="resize-none h-24"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsReturnModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleReturnSubmit} disabled={returnMutation.isPending || !returnForm.reason} className="bg-purple-600 hover:bg-purple-700 text-white">
                            Submit Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ProductReviewModal
                isOpen={isProductReviewOpen}
                onClose={() => setIsProductReviewOpen(false)}
                orderItem={selectedReviewItem}
            />

            <VendorReviewModal
                isOpen={isVendorReviewOpen}
                onClose={() => setIsVendorReviewOpen(false)}
                subOrder={selectedReviewSubOrder}
            />
        </div>
    );
}
