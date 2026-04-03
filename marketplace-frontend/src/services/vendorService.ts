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
};
