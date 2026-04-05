import { api } from './api';
import type { OrderRequest, OrderResponse, PaymentVerificationRequest, OrderStatusHistoryResponse, ReturnRequestResponse } from '../types/order';

export const createOrder = async (request: OrderRequest): Promise<OrderResponse> => {
    const response = await api.post('/orders/checkout', request);
    return response.data;
};

export const verifyPayment = async (request: PaymentVerificationRequest): Promise<string> => {
    const response = await api.post('/orders/verify-payment', request);
    return response.data;
};

export const getOrder = async (id: string): Promise<OrderResponse> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
};

export interface CouponValidationResponse {
    valid: boolean;
    message: string;
    couponCode?: string;
    discountType?: string;
    discountValue?: number;
    discountAmount?: number;
    newTotal?: number;
}

export const validateCoupon = async (code: string, orderAmount: number): Promise<CouponValidationResponse> => {
    const response = await api.get(`/coupons/validate?code=${code}&orderAmount=${orderAmount}`);
    return response.data;
};

export const orderService = {
    // Current user orders
    getMyOrders: async (): Promise<OrderResponse[]> => {
        const response = await api.get<OrderResponse[]>('/orders/my-orders');
        return response.data;
    },

    // Order Tracking History
    getOrderHistory: async (orderId: string): Promise<OrderStatusHistoryResponse[]> => {
        const response = await api.get<OrderStatusHistoryResponse[]>(`/orders/${orderId}/history`);
        return response.data;
    },

    getSubOrderHistory: async (subOrderId: string): Promise<OrderStatusHistoryResponse[]> => {
        const response = await api.get<OrderStatusHistoryResponse[]>(`/orders/sub/${subOrderId}/history`);
        return response.data;
    },

    // Vendor specific sub-order status update
    updateSubOrderStatus: async (subOrderId: string, updateData: {
        status: string;
        trackingNumber?: string;
        trackingUrl?: string;
        carrier?: string;
        notes?: string;
    }): Promise<void> => {
        await api.put(`/vendor/orders/${subOrderId}/status`, updateData);
    },

    // Vendor specific returns list
    getVendorReturns: async (): Promise<ReturnRequestResponse[]> => {
        const response = await api.get<ReturnRequestResponse[]>('/vendor/returns');
        return response.data;
    },

    // Customer initiating return
    initiateReturnRequest: async (data: {
        orderId?: string;
        subOrderId?: string;
        itemsJson: string;
        reason: string;
        reasonDetails: string;
    }): Promise<void> => {
        await api.post('/orders/returns/initiate', data);
    },

    // Vendor/Admin process return request
    processReturnRequest: async (returnRequestId: string, data: {
        status: string;
        adminNotes?: string;
    }): Promise<void> => {
        await api.put(`/orders/returns/${returnRequestId}/process`, data);
    }
};
