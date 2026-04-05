import { api } from './api';
import type {
    ProductReview,
    ReviewRequest,
    ReviewVoteRequest,
    ReportRequest,
    PaginatedResponse,
    SellerReviewRequest,
    SellerReview
} from '../types/review';

export const reviewService = {
    // Product Reviews
    submitProductReview: async (data: ReviewRequest): Promise<ProductReview> => {
        const response = await api.post('/reviews/products', data);
        return response.data;
    },

    getProductReviews: async (
        productId: string,
        page = 0,
        size = 10,
        sortBy = 'createdAt',
        sortDir = 'desc',
        rating?: number
    ): Promise<PaginatedResponse<ProductReview>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sortBy,
            sortDir,
        });
        if (rating) {
            params.append('rating', rating.toString());
        }
        const response = await api.get(`/reviews/products/${productId}`, { params });
        return response.data;
    },

    updateProductReview: async (reviewId: string, data: ReviewRequest): Promise<ProductReview> => {
        const response = await api.put(`/reviews/products/${reviewId}`, data);
        return response.data;
    },

    deleteProductReview: async (reviewId: string): Promise<void> => {
        await api.delete(`/reviews/products/${reviewId}`);
    },

    voteOnReview: async (reviewId: string, data: ReviewVoteRequest): Promise<void> => {
        await api.post(`/reviews/${reviewId}/vote`, data);
    },

    reportReview: async (reviewId: string, data: ReportRequest): Promise<void> => {
        await api.post(`/reviews/${reviewId}/report`, data);
    },

    // Seller Reviews
    submitSellerReview: async (data: SellerReviewRequest): Promise<SellerReview> => {
        const response = await api.post('/reviews/sellers', data);
        return response.data;
    },

    getSellerReviews: async (
        vendorId: string,
        page = 0,
        size = 10,
        sortBy = 'createdAt',
        sortDir = 'desc'
    ): Promise<PaginatedResponse<SellerReview>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sortBy,
            sortDir,
        });
        const response = await api.get(`/reviews/sellers/${vendorId}`, { params });
        return response.data;
    },

    getMySellerReviews: async (
        page = 0,
        size = 10,
        sortBy = 'createdAt',
        sortDir = 'desc'
    ): Promise<PaginatedResponse<SellerReview>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sortBy,
            sortDir,
        });
        const response = await api.get(`/reviews/sellers/me`, { params });
        return response.data;
    },

    // Moderation (Admin)
    getPendingReviews: async (page = 0, size = 10): Promise<PaginatedResponse<ProductReview>> => {
        const response = await api.get('/reviews/moderation/pending', {
            params: { page, size },
        });
        return response.data;
    },

    moderateReview: async (reviewId: string, action: string, notes?: string): Promise<void> => {
        const params = new URLSearchParams({ action });
        if (notes) {
            params.append('notes', notes);
        }
        await api.post(`/reviews/${reviewId}/moderate`, null, { params });
    }
};
