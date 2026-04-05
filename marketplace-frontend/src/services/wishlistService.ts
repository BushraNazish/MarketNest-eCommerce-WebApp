import { api } from './api';
import type { Wishlist } from '../types/wishlist';

export const wishlistService = {
    getWishlist: async (): Promise<Wishlist> => {
        const response = await api.get('/wishlist');
        return response.data;
    },

    addItem: async (productId: string): Promise<Wishlist> => {
        const response = await api.post(`/wishlist/items/${productId}`);
        return response.data;
    },

    removeItem: async (productId: string): Promise<Wishlist> => {
        const response = await api.delete(`/wishlist/items/${productId}`);
        return response.data;
    }
};
