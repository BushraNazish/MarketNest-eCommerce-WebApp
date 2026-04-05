import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Activity, CreditCard, Users, Store, Package, CheckCircle, XCircle } from 'lucide-react';
import { adminService, type AdminDashboardStatsDto, type VendorProfileDto, type CustomerResponseDto, type ProductResponseDto, type CommissionResponseDto } from '../../services/adminService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
};

const AdminDashboardPage = () => {
    const [stats, setStats] = useState<AdminDashboardStatsDto | null>(null);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [allOrders, setAllOrders] = useState<any[]>([]);
    const [vendors, setVendors] = useState<VendorProfileDto[]>([]);
    const [customers, setCustomers] = useState<CustomerResponseDto[]>([]);
    const [products, setProducts] = useState<ProductResponseDto[]>([]);
    const [commissions, setCommissions] = useState<CommissionResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsData, ordersData, allOrdersData, vendorsData, customersData, productsData, commissionsData] = await Promise.all([
                    adminService.getDashboardStats(),
                    adminService.getRecentOrders(),
                    adminService.getAllOrders(),
                    adminService.getAllVendors(),
                    adminService.getAllCustomers(),
                    adminService.getAllProducts(),
                    adminService.getAllCommissions()
                ]);
                setStats(statsData);
                setRecentOrders(ordersData);
                setAllOrders(allOrdersData);
                setVendors(vendorsData);
                setCustomers(customersData);
                setProducts(productsData);
                setCommissions(commissionsData);
            } catch (error) {
                console.error("Failed to fetch admin dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleVendorStatusUpdate = async (vendorId: string, status: string) => {
        try {
            await adminService.updateVendorStatus(vendorId, status);
            toast.success(`Vendor ${status.toLowerCase()} successfully`);

            // Refresh vendor list and stats
            const [newStats, newVendors] = await Promise.all([
                adminService.getDashboardStats(),
                adminService.getAllVendors()
            ]);
            setStats(newStats);
            setVendors(newVendors);
        } catch (error) {
            console.error("Failed to update vendor", error);
            toast.error("Failed to update vendor status");
        }
    };

    if (loading) {
        return <div className="p-8">Loading dashboard...</div>;
    }

    if (!stats) {
        return <div className="p-8 text-red-500">Failed to load statistics.</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
                <p className="text-muted-foreground">
                    Overview of marketplace performance and recent activity.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue (GMV)
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</div>
                    </CardContent>
                </Card>
                <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
                    <DialogTrigger asChild>
                        <Card className="cursor-pointer hover:bg-slate-50 transition-colors border-orange-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-orange-800">
                                    Total Orders
                                </CardTitle>
                                <Activity className="h-4 w-4 text-orange-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-700">{stats.totalOrders}</div>
                            </CardContent>
                        </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>All Marketplace Orders</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                            {allOrders.length === 0 ? (
                                <p className="text-muted-foreground">No orders placed yet.</p>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground uppercase bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3">Order Number</th>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Payment</th>
                                            <th className="px-4 py-3 text-right">Total Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allOrders.map(order => (
                                            <tr key={order.id} className="border-b">
                                                <td className="px-4 py-3 font-medium">{order.orderNumber || order.order_number}</td>
                                                <td className="px-4 py-3">{new Date(order.placedAt || order.placed_at).toLocaleDateString()}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                        ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                                'bg-blue-100 text-blue-800'}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">{order.paymentStatus || 'N/A'}</td>
                                                <td className="px-4 py-3 text-right font-bold">{formatCurrency(order.grandTotal || order.grand_total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
                <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
                    <DialogTrigger asChild>
                        <Card className="cursor-pointer hover:bg-slate-50 transition-colors border-purple-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-purple-800">
                                    Total Customers
                                </CardTitle>
                                <Users className="h-4 w-4 text-purple-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-700">{stats.totalCustomers}</div>
                            </CardContent>
                        </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Registered Customers</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                            {customers.length === 0 ? (
                                <p className="text-muted-foreground">No customers registered yet.</p>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground uppercase bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3">Name</th>
                                            <th className="px-4 py-3">Email</th>
                                            <th className="px-4 py-3">Phone</th>
                                            <th className="px-4 py-3">Registered At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customers.map(customer => (
                                            <tr key={customer.id} className="border-b">
                                                <td className="px-4 py-3 font-medium">{customer.name}</td>
                                                <td className="px-4 py-3">{customer.email}</td>
                                                <td className="px-4 py-3">{customer.phone || 'N/A'}</td>
                                                <td className="px-4 py-3">{new Date(customer.registeredAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
                <Dialog open={isVendorModalOpen} onOpenChange={setIsVendorModalOpen}>
                    <DialogTrigger asChild>
                        <Card className="cursor-pointer hover:bg-slate-50 transition-colors border-blue-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-blue-800">
                                    Total Sellers
                                </CardTitle>
                                <Store className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-700">{vendors.length}</div>
                                <p className="text-xs text-blue-600 mt-1">Pending: {vendors.filter(v => v.status === 'PENDING').length}</p>
                            </CardContent>
                        </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Marketplace Sellers</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                            {vendors.length === 0 ? (
                                <p className="text-muted-foreground">No sellers registered yet.</p>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground uppercase bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3">Store Name</th>
                                            <th className="px-4 py-3">Business Name</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vendors.map(vendor => (
                                            <tr key={vendor.id} className="border-b">
                                                <td className="px-4 py-3 font-medium">{vendor.storeName}</td>
                                                <td className="px-4 py-3">{vendor.businessName}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                        ${vendor.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                            vendor.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'}`}>
                                                        {vendor.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right space-x-2">
                                                    {vendor.status === 'PENDING' && (
                                                        <>
                                                            <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => handleVendorStatusUpdate(vendor.id, 'APPROVED')}>
                                                                <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                                            </Button>
                                                            <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => handleVendorStatusUpdate(vendor.id, 'REJECTED')}>
                                                                <XCircle className="w-4 h-4 mr-1" /> Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                    {vendor.status === 'APPROVED' && (
                                                        <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => handleVendorStatusUpdate(vendor.id, 'SUSPENDED')}>
                                                            Suspend
                                                        </Button>
                                                    )}
                                                    {(vendor.status === 'REJECTED' || vendor.status === 'SUSPENDED') && (
                                                        <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => handleVendorStatusUpdate(vendor.id, 'APPROVED')}>
                                                            Re-Activate
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
                <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
                    <DialogTrigger asChild>
                        <Card className="cursor-pointer hover:bg-slate-50 transition-colors border-sky-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-sky-800">
                                    Total Products
                                </CardTitle>
                                <Package className="h-4 w-4 text-sky-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-sky-700">{stats.totalProducts}</div>
                            </CardContent>
                        </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Marketplace Products</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                            {products.length === 0 ? (
                                <p className="text-muted-foreground">No products listed yet.</p>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground uppercase bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3">Product Name</th>
                                            <th className="px-4 py-3">Vendor</th>
                                            <th className="px-4 py-3">Price</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map(product => (
                                            <tr key={product.id} className="border-b">
                                                <td className="px-4 py-3 font-medium">{product.name}</td>
                                                <td className="px-4 py-3">{product.vendorName || '-'}</td>
                                                <td className="px-4 py-3 font-bold">{formatCurrency(product.basePrice)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                        ${product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                        {product.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
                <Dialog open={isCommissionModalOpen} onOpenChange={setIsCommissionModalOpen}>
                    <DialogTrigger asChild>
                        <Card className="cursor-pointer hover:bg-slate-50 transition-colors bg-green-50 border-green-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-green-800">
                                    Total Commission
                                </CardTitle>
                                <CreditCard className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-700">{formatCurrency(stats.totalCommission || 0)}</div>
                            </CardContent>
                        </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Marketplace Commissions</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                            {commissions.length === 0 ? (
                                <p className="text-muted-foreground">No commissions earned yet.</p>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground uppercase bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3">Order Number</th>
                                            <th className="px-4 py-3">Vendor</th>
                                            <th className="px-4 py-3">Products</th>
                                            <th className="px-4 py-3 text-right">Order Total</th>
                                            <th className="px-4 py-3 text-right">Cut %</th>
                                            <th className="px-4 py-3 text-right">Commission Earned</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {commissions.map((comm, idx) => (
                                            <tr key={idx} className="border-b">
                                                <td className="px-4 py-3">{new Date(comm.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 font-medium text-xs">{comm.subOrderNumber}</td>
                                                <td className="px-4 py-3">{comm.vendorName}</td>
                                                <td className="px-4 py-3 truncate max-w-[200px]" title={comm.products}>{comm.products}</td>
                                                <td className="px-4 py-3 text-right">{formatCurrency(comm.orderTotal)}</td>
                                                <td className="px-4 py-3 text-right">{comm.commissionRate}%</td>
                                                <td className="px-4 py-3 text-right font-bold text-green-700">{formatCurrency(comm.commissionAmount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 lg:col-span-7">
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No recent orders found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground uppercase bg-slate-50 dark:bg-slate-900">
                                        <tr>
                                            <th className="px-4 py-3">Order Number</th>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Total Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentOrders.map((order) => (
                                            <tr key={order.id} className="border-b dark:border-slate-800 hover:bg-muted/50 transition-colors">
                                                <td className="px-4 py-3 font-medium">{order.order_number}</td>
                                                <td className="px-4 py-3">{order.placed_at ? new Date(order.placed_at).toLocaleDateString() : 'N/A'}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                        ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                                'bg-blue-100 text-blue-800'}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">{formatCurrency(order.grand_total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
