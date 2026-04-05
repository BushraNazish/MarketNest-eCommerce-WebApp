export interface WishlistItem {
    id: number;
    productId: string; // UUID
    productName: string;
    productImageUrl: string | null;
    price: number;
}

export interface Wishlist {
    id: number;
    items: WishlistItem[];
}
