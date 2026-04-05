export interface CartItem {
    id: number;
    productId: string; // UUID
    productName: string;
    productImageUrl: string | null;
    quantity: number;
    price: number;
    subtotal: number;
}

export interface Cart {
    id: number;
    items: CartItem[];
    totalAmount: number;
}

export interface AddToCartRequest {
    productId: string;
    quantity: number;
}

export interface UpdateCartItemRequest {
    quantity: number;
}
