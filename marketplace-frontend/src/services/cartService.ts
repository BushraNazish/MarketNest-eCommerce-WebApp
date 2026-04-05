import { api } from './api';
import type { Cart, AddToCartRequest, UpdateCartItemRequest } from '../types/cart';

export const cartService = {
    getCart: async (): Promise<Cart> => {
        const response = await api.get('/cart');
        return response.data;
    },

    addItem: async (data: AddToCartRequest): Promise<Cart> => {
        const response = await api.post('/cart/items', data);
        return response.data;
    },

    updateItem: async (itemId: number, data: UpdateCartItemRequest): Promise<Cart> => {
        const response = await api.put(`/cart/items/${itemId}`, data);
        return response.data;
    },

    removeItem: async (itemId: number): Promise<Cart> => {
        const response = await api.delete(`/cart/items/${itemId}`);
        return response.data;
    },

    clearCart: async (): Promise<void> => {
        await api.delete('/cart');
    }
};
