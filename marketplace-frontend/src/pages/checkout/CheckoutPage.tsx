
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createOrder, verifyPayment, validateCoupon } from '../../services/orderService';
import type { CouponValidationResponse } from '../../services/orderService';
import type { Address } from '../../types/order';
import { useCartStore } from '../../store/useCartStore';

declare const Razorpay: any;

const AddressForm = ({ onSubmit, initialData }: { onSubmit: (data: Address) => void, initialData: Address | null }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<Address>({ defaultValues: initialData || {} });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input {...register("fullName", { required: "Full name is required" })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    {errors.fullName && <span className="text-red-500 text-sm">{errors.fullName.message}</span>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input {...register("phone", { required: "Phone is required" })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    {errors.phone && <span className="text-red-500 text-sm">{errors.phone.message}</span>}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                <input {...register("addressLine1", { required: "Address Line 1 is required" })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                {errors.addressLine1 && <span className="text-red-500 text-sm">{errors.addressLine1.message}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Address Line 2 (Optional)</label>
                <input {...register("addressLine2")} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input {...register("city", { required: "City is required" })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    {errors.city && <span className="text-red-500 text-sm">{errors.city.message}</span>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input {...register("state", { required: "State is required" })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    {errors.state && <span className="text-red-500 text-sm">{errors.state.message}</span>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                    <input {...register("postalCode", { required: "Postal Code is required" })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    {errors.postalCode && <span className="text-red-500 text-sm">{errors.postalCode.message}</span>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <input {...register("country", { required: "Country is required" })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    {errors.country && <span className="text-red-500 text-sm">{errors.country.message}</span>}
                </div>
            </div>

            <div className="flex justify-end">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Continue to Payment
                </button>
            </div>
        </form>
    );
};

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [address, setAddress] = useState<Address | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'ONLINE'>('ONLINE');
    const [loading, setLoading] = useState(false);

    const { cart } = useCartStore();
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResponse | null>(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [couponError, setCouponError] = useState('');

    const handleAddressSubmit = (data: Address) => {
        setAddress(data);
        setStep(2);
    };

    const handleBackStep = () => {
        setStep(step - 1);
    };

    const handleApplyCoupon = async () => {
        if (!couponCodeInput || !cart) return;
        setIsApplyingCoupon(true);
        setCouponError('');
        try {
            const res = await validateCoupon(couponCodeInput, cart.totalAmount);
            if (res.valid) {
                setAppliedCoupon(res);
            } else {
                setCouponError(res.message);
                setAppliedCoupon(null);
            }
        } catch (error: any) {
            setCouponError(error.response?.data?.message || 'Failed to validate coupon');
            setAppliedCoupon(null);
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCodeInput('');
        setCouponError('');
    };

    const handlePlaceOrder = async () => {
        if (!address) return;
        setLoading(true);
        try {
            const order = await createOrder({
                shipping_address: address,
                billing_address: address, // Same for now
                payment_method: paymentMethod,
                coupon_code: appliedCoupon ? appliedCoupon.couponCode : undefined
            });

            if (order.razorpay_order_id) {
                const options = {
                    key: order.razorpay_key_id,
                    amount: order.grand_total * 100, // Amount in paise
                    currency: order.currency,
                    name: "MarketNest",
                    description: "Order #" + order.order_number,
                    order_id: order.razorpay_order_id,
                    handler: async function (response: any) {
                        try {
                            await verifyPayment({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            });
                            navigate(`/order/success/${order.id}`); // Redirect to success page
                        } catch (err) {
                            console.error("Payment verification failed", err);
                            alert("Payment verification failed. Please contact support if amount was deducted.");
                        }
                    },
                    prefill: {
                        name: address.fullName,
                        email: "user@example.com", // Should get from store
                        contact: address.phone
                    },
                    theme: {
                        color: "#2563EB"
                    }
                };

                const rzp1 = new Razorpay(options);
                rzp1.on('payment.failed', function (response: any) {
                    alert(response.error.description);
                });
                rzp1.open();
            } else {
                // For non-Razorpay flows (future scope)
                navigate(`/order/success/${order.id}`);
            }

        } catch (error) {
            console.error("Order creation failed", error);
            alert("Failed to place order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Checkout</h1>

            <div className="flex items-center justify-between mb-8 border-b pb-4">
                <div className={`text-lg font-medium ${step === 1 ? 'text-blue-600 border-b-2 border-blue-600 pb-4 -mb-4' : 'text-gray-500'}`}>
                    1. Shipping Address
                </div>
                <div className={`text-lg font-medium ${step === 2 ? 'text-blue-600 border-b-2 border-blue-600 pb-4 -mb-4' : 'text-gray-500'}`}>
                    2. Payment
                </div>
            </div>

            {step === 1 && (
                <AddressForm onSubmit={handleAddressSubmit} initialData={address} />
            )}

            {step === 2 && address && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Shipping Details</h3>
                            <button onClick={handleBackStep} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                        </div>
                        <div className="text-gray-700 space-y-1">
                            <p className="font-medium">{address.fullName}</p>
                            <p>{address.addressLine1}</p>
                            {address.addressLine2 && <p>{address.addressLine2}</p>}
                            <p>{address.city}, {address.state} {address.postalCode}</p>
                            <p>{address.country}</p>
                            <p className="mt-2">Phone: {address.phone}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                        <div className="space-y-3">
                            <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'ONLINE' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input
                                    type="radio"
                                    name="paymentParams"
                                    value="ONLINE"
                                    checked={paymentMethod === 'ONLINE'}
                                    onChange={() => setPaymentMethod('ONLINE')}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="ml-3 font-medium text-gray-900">Online Payment (Razorpay)</span>
                            </label>

                            {/* Allow expansion for COD later */}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Promo Code</h3>
                        {appliedCoupon ? (
                            <div className="flex items-center justify-between bg-green-50 p-4 border border-green-200 rounded-lg">
                                <div>
                                    <p className="text-green-800 font-semibold text-sm">Coupon '{appliedCoupon.couponCode}' Applied!</p>
                                    <p className="text-green-700 text-sm">You saved ${appliedCoupon.discountAmount?.toFixed(2)}</p>
                                </div>
                                <button onClick={handleRemoveCoupon} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                            </div>
                        ) : (
                            <div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter coupon code"
                                        value={couponCodeInput}
                                        onChange={(e) => setCouponCodeInput(e.target.value)}
                                        className="flex-1 border border-gray-300 rounded-md p-2 uppercase"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={isApplyingCoupon || !couponCodeInput}
                                        className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 disabled:opacity-50"
                                    >
                                        {isApplyingCoupon ? 'Applying...' : 'Apply'}
                                    </button>
                                </div>
                                {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
                            </div>
                        )}

                        <div className="mt-6 space-y-2 border-t pt-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>${cart?.totalAmount.toFixed(2)}</span>
                            </div>
                            {appliedCoupon && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount ({appliedCoupon.couponCode})</span>
                                    <span>-${appliedCoupon.discountAmount?.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                                <span>Total</span>
                                <span>${appliedCoupon ? appliedCoupon.newTotal?.toFixed(2) : cart?.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                        <button
                            onClick={handleBackStep}
                            className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2"
                        >
                            Back
                        </button>
                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading}
                            className={`bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold shadow-md transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700 hover:shadow-lg'}`}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : 'Place Order'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutPage;
