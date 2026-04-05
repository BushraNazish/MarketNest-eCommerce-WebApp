import { api } from './api';
import type { CreateShopRequest, Vendor } from '../types/vendor';

export const vendorService = {
    createShop: async (data: CreateShopRequest): Promise<Vendor> => {
        const response = await api.post<Vendor>('/vendor/shops', data);
        return response.data;
    },

    getMyShop: async (): Promise<Vendor> => {
        const response = await api.get<Vendor>('/vendor/shops/my-shop');
        return response.data;
    },

    getPublicVendorProfile: async (vendorId: string): Promise<Vendor> => {
        const response = await api.get<Vendor>(`/vendor/${vendorId}/public`);
        return response.data;
    },

    getVendorDashboardStats: async (): Promise<{ totalSales: number; totalOrders: number; totalProducts: number }> => {
        const response = await api.get('/vendor/dashboard/stats');
        return response.data;
    },
};
