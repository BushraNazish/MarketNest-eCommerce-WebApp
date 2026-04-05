import { api } from './api';
import type { Category, Product, CreateProductRequest, ProductSearchParams } from '../types/product';

export const productService = {
    getAllCategories: async (): Promise<Category[]> => {
        const response = await api.get<Category[]>('/categories');
        return response.data;
    },

    searchProducts: async (params: ProductSearchParams): Promise<{ content: Product[], totalElements: number, totalPages: number }> => {
        const response = await api.get<{ content: Product[], totalElements: number, totalPages: number }>('/products/search', { params });
        return response.data;
    },

    createProduct: async (data: CreateProductRequest): Promise<Product> => {
        const response = await api.post<Product>('/products', data);
        return response.data;
    },

    getMyProducts: async (page = 0, size = 10): Promise<{ content: Product[], totalElements: number, totalPages: number }> => {
        const response = await api.get<{ content: Product[], totalElements: number, totalPages: number }>(`/products/vendor/my-products?page=${page}&size=${size}`);
        return response.data;
    },

    getProductsByVendor: async (vendorId: string, page = 0, size = 12): Promise<{ content: Product[], totalElements: number, totalPages: number }> => {
        const response = await api.get<{ content: Product[], totalElements: number, totalPages: number }>(`/products/vendor/${vendorId}?page=${page}&size=${size}`);
        return response.data;
    }
};
