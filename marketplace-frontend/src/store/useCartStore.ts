import { create } from 'zustand';
import type { Cart } from '../types/cart';
import { cartService } from '../services/cartService';

interface CartState {
    cart: Cart | null;
    isLoading: boolean;
    error: string | null;
    fetchCart: () => Promise<void>;
    addItem: (productId: string, quantity: number) => Promise<void>;
    updateItem: (itemId: number, quantity: number) => Promise<void>;
    removeItem: (itemId: number) => Promise<void>;
    clearCart: () => Promise<void>;
    clearLocalCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
    cart: null,
    isLoading: false,
    error: null,

    fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
            const cart = await cartService.getCart();
            set({ cart, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to fetch cart', isLoading: false });
        }
    },

    addItem: async (productId, quantity) => {
        set({ isLoading: true, error: null });
        try {
            const cart = await cartService.addItem({ productId, quantity });
            set({ cart, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to add item', isLoading: false });
            throw error;
        }
    },

    updateItem: async (itemId, quantity) => {
        set({ isLoading: true, error: null });
        try {
            const cart = await cartService.updateItem(itemId, { quantity });
            set({ cart, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to update item', isLoading: false });
        }
    },

    removeItem: async (itemId) => {
        set({ isLoading: true, error: null });
        try {
            const cart = await cartService.removeItem(itemId);
            set({ cart, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to remove item', isLoading: false });
        }
    },

    clearCart: async () => {
        set({ isLoading: true, error: null });
        try {
            await cartService.clearCart();
            set((state) => ({
                cart: state.cart ? { ...state.cart, items: [], totalAmount: 0 } : null,
                isLoading: false
            }));
        } catch (error) {
            set({ error: 'Failed to clear cart', isLoading: false });
        }
    },

    clearLocalCart: () => set({ cart: null })
}));
