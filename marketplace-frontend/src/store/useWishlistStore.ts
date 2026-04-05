import { create } from 'zustand';
import type { Wishlist } from '../types/wishlist';
import { wishlistService } from '../services/wishlistService';

interface WishlistState {
    wishlist: Wishlist | null;
    isLoading: boolean;
    error: string | null;
    fetchWishlist: () => Promise<void>;
    addItem: (productId: string) => Promise<void>;
    removeItem: (productId: string) => Promise<void>;
    clearLocalWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set) => ({
    wishlist: null,
    isLoading: false,
    error: null,

    fetchWishlist: async () => {
        set({ isLoading: true, error: null });
        try {
            const wishlist = await wishlistService.getWishlist();
            set({ wishlist, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to fetch wishlist', isLoading: false });
        }
    },

    addItem: async (productId) => {
        set({ isLoading: true, error: null });
        try {
            const wishlist = await wishlistService.addItem(productId);
            set({ wishlist, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to add to wishlist', isLoading: false });
        }
    },

    removeItem: async (productId) => {
        set({ isLoading: true, error: null });
        try {
            const wishlist = await wishlistService.removeItem(productId);
            set({ wishlist, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to remove from wishlist', isLoading: false });
        }
    },

    clearLocalWishlist: () => set({ wishlist: null })
}));
