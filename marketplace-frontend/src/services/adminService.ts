import { api } from './api';

export interface AdminDashboardStatsDto {
    totalSales: number;
    totalOrders: number;
    totalCustomers: number;
    activeVendors: number;
    totalProducts: number;
    totalCommission: number;
}

export interface VendorProfileDto {
    id: string;
    businessName: string;
    storeName: string;
    storeSlug: string;
    storeDescription?: string;
    storeLogoUrl?: string;
    storeBannerUrl?: string;
    status: string;
    ratingAverage: number;
    ratingCount: number;
    createdAt: string;
}

export interface CustomerResponseDto {
    id: string;
    name: string;
    email: string;
    phone: string;
    registeredAt: string;
}

export interface ProductResponseDto {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    salePrice?: number;
    status: string;
    categoryName?: string;
    vendorName?: string;
    createdAt: string;
}

export interface CommissionResponseDto {
    orderNumber: string;
    subOrderNumber: string;
    vendorName: string;
    products: string;
    orderTotal: number;
    commissionRate: number;
    commissionAmount: number;
    date: string;
}

export interface SystemConfigDto {
    id?: string;
    configKey: string;
    configValue: string;
    description?: string;
    updatedAt?: string;
    updatedBy?: string;
}

export interface CouponDto {
    id?: string;
    code: string;
    description?: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    minOrderValue?: number;
    maxDiscount?: number;
    startsAt: string;
    expiresAt: string;
    totalUsageLimit?: number;
    perUserLimit?: number;
    currentUsage?: number;
    isActive: boolean;
}

export const adminService = {
    getDashboardStats: async (): Promise<AdminDashboardStatsDto> => {
        const response = await api.get('/admin/dashboard/stats');
        return response.data;
    },

    getRecentOrders: async (): Promise<any[]> => {
        const response = await api.get('/admin/dashboard/recent-orders');
        return response.data;
    },

    getAllOrders: async (): Promise<any[]> => {
        const response = await api.get('/admin/orders');
        return response.data;
    },

    getAllProducts: async (): Promise<ProductResponseDto[]> => {
        const response = await api.get('/admin/products');
        return response.data;
    },

    getAllCommissions: async (): Promise<CommissionResponseDto[]> => {
        const response = await api.get('/admin/commissions');
        return response.data;
    },

    getAllVendors: async (): Promise<VendorProfileDto[]> => {
        const response = await api.get('/admin/vendors');
        return response.data;
    },

    getAllCustomers: async (): Promise<CustomerResponseDto[]> => {
        const response = await api.get('/admin/customers');
        return response.data;
    },

    updateVendorStatus: async (vendorId: string, status: string): Promise<VendorProfileDto> => {
        const response = await api.put(`/admin/vendors/${vendorId}/status`, { status });
        return response.data;
    },

    getAllConfigs: async (): Promise<SystemConfigDto[]> => {
        const response = await api.get('/admin/config');
        return response.data;
    },

    upsertConfig: async (key: string, data: Partial<SystemConfigDto>): Promise<SystemConfigDto> => {
        const response = await api.put(`/admin/config/${key}`, data);
        return response.data;
    },

    getAllCoupons: async (): Promise<CouponDto[]> => {
        const response = await api.get('/admin/coupons');
        return response.data;
    },

    createCoupon: async (data: CouponDto): Promise<CouponDto> => {
        const response = await api.post('/admin/coupons', data);
        return response.data;
    },

    deleteCoupon: async (id: string): Promise<void> => {
        await api.delete(`/admin/coupons/${id}`);
    }
};
