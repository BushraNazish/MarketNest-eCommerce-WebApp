import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Search, Edit2, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { orderService } from '@/services/orderService';
import { api } from '@/services/api';
import type { SubOrderResponse, ReturnRequestResponse } from '@/types/order';

export default function VendorOrderManagementPage() {
    const queryClient = useQueryClient();

    // Order Update Modal State
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<SubOrderResponse | null>(null);
    const [updateForm, setUpdateForm] = useState({
        status: '',
        trackingNumber: '',
        carrier: '',
        notes: ''
    });

    // Return Process Modal State
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState<ReturnRequestResponse | null>(null);
    const [returnForm, setReturnForm] = useState({
        status: '',
        adminNotes: ''
    });

    const { data: subOrders, isLoading: ordersLoading } = useQuery({
        queryKey: ['vendorOrders'],
        queryFn: async () => {
            try {
                const res = await api.get('/vendor/orders');
                return res.data as SubOrderResponse[];
            } catch (e) {
                console.error(e);
                return [];
            }
        }
    });

    const { data: returnRequests, isLoading: returnsLoading } = useQuery({
        queryKey: ['vendorReturns'],
        queryFn: () => orderService.getVendorReturns()
    });

    const updateStatusMutation = useMutation({
        mutationFn: (data: any) => orderService.updateSubOrderStatus(data.id, data.payload),
        onSuccess: () => {
            toast.success('Order status updated successfully');
            queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
            setIsUpdateModalOpen(false);
        },
        onError: () => toast.error('Failed to update order status')
    });

    const processReturnMutation = useMutation({
        mutationFn: (data: any) => orderService.processReturnRequest(data.id, data.payload),
        onSuccess: () => {
            toast.success('Return request processed successfully');
            queryClient.invalidateQueries({ queryKey: ['vendorReturns'] });
            queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
            setIsReturnModalOpen(false);
        },
        onError: () => toast.error('Failed to process return request')
    });

    const handleUpdateClick = (order: SubOrderResponse) => {
        setSelectedOrder(order);
        setUpdateForm({
            status: order.status,
            trackingNumber: order.tracking_number || '',
            carrier: order.carrier || '',
            notes: ''
        });
        setIsUpdateModalOpen(true);
    };

    const handleUpdateSubmit = () => {
        if (!selectedOrder) return;
        updateStatusMutation.mutate({
            id: selectedOrder.id,
            payload: updateForm
        });
    };

    const handleProcessReturnClick = (req: ReturnRequestResponse) => {
        setSelectedReturn(req);
        setReturnForm({
            status: req.status === 'REQUESTED' ? 'APPROVED' : req.status,
            adminNotes: req.admin_notes || ''
        });
        setIsReturnModalOpen(true);
    };

    const handleProcessReturnSubmit = () => {
        if (!selectedReturn) return;
        processReturnMutation.mutate({
            id: selectedReturn.id,
            payload: returnForm
        });
    };

    if (ordersLoading || returnsLoading) {
        return <div className="p-8 text-center text-gray-500">Loading management data...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Order & Returns Management</h1>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="Search records..." className="pl-9" />
                </div>
            </div>

            <Tabs defaultValue="orders" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 max-w-md">
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="returns">Returns</TabsTrigger>
                </TabsList>

                <TabsContent value="orders">
                    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Order ID</th>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Amount</th>
                                    <th className="px-6 py-4 font-medium">Tracking</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {subOrders && subOrders.length > 0 ? (
                                    subOrders.map(order => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-indigo-600">
                                                #{order.sub_order_number}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">Recently</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium 
                                                    ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                                                            order.status === 'RETURNED' ? 'bg-purple-100 text-purple-800' :
                                                                'bg-yellow-100 text-yellow-800'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium">₹{order.total_amount}</td>
                                            <td className="px-6 py-4 text-gray-500 text-xs">
                                                {order.tracking_number ? (
                                                    <div>
                                                        <div>{order.carrier}</div>
                                                        <div className="font-mono">{order.tracking_number}</div>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="outline" size="sm" onClick={() => handleUpdateClick(order)}>
                                                    <Edit2 className="w-4 h-4 mr-1" /> Update
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                            No orders found for your shop yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                <TabsContent value="returns">
                    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Return ID</th>
                                    <th className="px-6 py-4 font-medium">Order Ref</th>
                                    <th className="px-6 py-4 font-medium">Reason</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {returnRequests && returnRequests.length > 0 ? (
                                    returnRequests.map(req => (
                                        <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-purple-600">
                                                {req.return_number}
                                                <div className="text-xs text-gray-500 font-normal mt-0.5">
                                                    {new Date(req.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 text-xs font-mono">
                                                {req.sub_order_number || req.order_number}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{req.reason.replace(/_/g, ' ')}</div>
                                                {req.reason_details && <div className="text-xs text-gray-500 truncate max-w-[200px]">{req.reason_details}</div>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium 
                                                    ${req.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                        req.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                            req.status === 'REFUNDED' ? 'bg-purple-100 text-purple-800' :
                                                                req.status === 'RECEIVED' ? 'bg-blue-100 text-blue-800' :
                                                                    'bg-yellow-100 text-yellow-800'}`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="outline" size="sm" onClick={() => handleProcessReturnClick(req)} className="text-purple-700 border-purple-200">
                                                    <Undo2 className="w-4 h-4 mr-1" /> Process
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            <Undo2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                            No return requests found yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Order Status Update Modal */}
            <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Order Status</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={updateForm.status} onValueChange={(val) => setUpdateForm({ ...updateForm, status: val })}>
                                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="PROCESSING">Processing</SelectItem>
                                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {(updateForm.status === 'SHIPPED' || updateForm.status === 'DELIVERED') && (
                            <>
                                <div className="space-y-2">
                                    <Label>Carrier</Label>
                                    <Input value={updateForm.carrier} onChange={(e) => setUpdateForm({ ...updateForm, carrier: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tracking Number</Label>
                                    <Input value={updateForm.trackingNumber} onChange={(e) => setUpdateForm({ ...updateForm, trackingNumber: e.target.value })} />
                                </div>
                            </>
                        )}
                        <div className="space-y-2">
                            <Label>Notes (Optional)</Label>
                            <Input value={updateForm.notes} onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateSubmit} disabled={updateStatusMutation.isPending}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Return Process Modal */}
            <Dialog open={isReturnModalOpen} onOpenChange={setIsReturnModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Process Return Request</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                            Processing return <strong>{selectedReturn?.return_number}</strong> for sub-order {selectedReturn?.sub_order_number}.
                        </div>
                        <div className="space-y-2">
                            <Label>Action / Status</Label>
                            <Select value={returnForm.status} onValueChange={(val) => setReturnForm({ ...returnForm, status: val })}>
                                <SelectTrigger><SelectValue placeholder="Select action" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="APPROVED">Approve (Await Items)</SelectItem>
                                    <SelectItem value="REJECTED">Reject</SelectItem>
                                    <SelectItem value="RECEIVED">Mark Items Received</SelectItem>
                                    <SelectItem value="REFUNDED">Process Refund (Close)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Internal Notes / Customer Message</Label>
                            <Textarea
                                placeholder="Why was this action taken?"
                                value={returnForm.adminNotes}
                                onChange={(e) => setReturnForm({ ...returnForm, adminNotes: e.target.value })}
                                className="resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReturnModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleProcessReturnSubmit} disabled={processReturnMutation.isPending} className="bg-purple-600 hover:bg-purple-700 text-white">
                            Submit Update
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
