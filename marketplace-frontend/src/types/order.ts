export interface Address {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    label?: string;
}

export interface OrderRequest {
    shipping_address?: Address;
    billing_address?: Address;
    shipping_address_id?: string;
    billing_address_id?: string;
    payment_method: 'CASH' | 'CARD' | 'ONLINE';
    coupon_code?: string;
    notes?: string;
}

export interface OrderResponse {
    id: string;
    order_number: string;
    grand_total: number;
    currency: string;
    status: string;
    payment_status: string;
    placed_at: string;
    razorpay_order_id?: string;
    razorpay_key_id?: string;
    sub_orders?: SubOrderResponse[];
}

export interface SubOrderResponse {
    id: string;
    sub_order_number: string;
    total_amount: number;
    status: string;
    tracking_number?: string;
    tracking_url?: string;
    carrier?: string;
    vendor_id: string;
    items: OrderItemResponse[];
    history?: OrderStatusHistoryResponse[];
}

export interface OrderItemResponse {
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
}

export interface PaymentVerificationRequest {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface OrderStatusHistoryResponse {
    id: string;
    from_status: string;
    to_status: string;
    notes?: string;
    created_at: string;
}

export interface ReturnRequestResponse {
    id: string;
    return_number: string;
    order_number: string;
    sub_order_number: string;
    items: string;
    reason: string;
    reason_details?: string;
    status: string;
    admin_notes?: string;
    created_at: string;
}
