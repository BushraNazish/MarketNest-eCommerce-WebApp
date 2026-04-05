import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { CouponDto } from '../../services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const AdminCouponsPage = () => {
    const [coupons, setCoupons] = useState<CouponDto[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
    const [discountValue, setDiscountValue] = useState(0);
    const [minOrderValue, setMinOrderValue] = useState(0);
    const [startsAt, setStartsAt] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [totalUsageLimit, setTotalUsageLimit] = useState(100);

    const loadCoupons = async () => {
        try {
            const data = await adminService.getAllCoupons();
            setCoupons(data);
        } catch (error) {
            console.error("Failed to load coupons", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCoupons();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminService.createCoupon({
                code,
                description,
                discountType,
                discountValue,
                minOrderValue,
                startsAt: new Date(startsAt).toISOString(),
                expiresAt: new Date(expiresAt).toISOString(),
                totalUsageLimit,
                isActive: true
            });
            // reset form
            setCode('');
            setDescription('');
            setDiscountValue(0);
            setMinOrderValue(0);
            setStartsAt('');
            setExpiresAt('');
            loadCoupons();
        } catch (error) {
            console.error("Failed to create coupon", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this coupon?")) return;
        try {
            await adminService.deleteCoupon(id);
            loadCoupons();
        } catch (error) {
            console.error("Failed to delete coupon", error);
        }
    };

    if (loading) return <div className="p-8">Loading coupons...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Coupon Management</h2>
            <Card>
                <CardHeader>
                    <CardTitle>Create New Coupon</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Code</label>
                                <Input value={code} onChange={e => setCode(e.target.value.toUpperCase())} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={discountType}
                                    onChange={(e) => setDiscountType(e.target.value as any)}
                                >
                                    <option value="PERCENTAGE">Percentage (%)</option>
                                    <option value="FIXED">Fixed Amount</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Value</label>
                                <Input type="number" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Min Order Value</label>
                                <Input type="number" value={minOrderValue} onChange={e => setMinOrderValue(Number(e.target.value))} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Valid From</label>
                                <Input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Valid Until</label>
                                <Input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Usage Limit</label>
                                <Input type="number" value={totalUsageLimit} onChange={e => setTotalUsageLimit(Number(e.target.value))} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Input value={description} onChange={e => setDescription(e.target.value)} />
                            </div>
                        </div>
                        <Button type="submit">Create Coupon</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Existing Coupons</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-slate-50 dark:bg-slate-900">
                                <tr>
                                    <th className="px-4 py-3">Code</th>
                                    <th className="px-4 py-3">Discount</th>
                                    <th className="px-4 py-3">Validity</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.map(coupon => (
                                    <tr key={coupon.id} className="border-b dark:border-slate-800">
                                        <td className="px-4 py-3 font-medium">{coupon.code}</td>
                                        <td className="px-4 py-3">
                                            {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                                        </td>
                                        <td className="px-4 py-3">
                                            {new Date(coupon.startsAt).toLocaleDateString()} - {new Date(coupon.expiresAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {coupon.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(coupon.id!)}>Delete</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminCouponsPage;
