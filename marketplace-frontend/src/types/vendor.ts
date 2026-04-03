export type VendorStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';

export interface Vendor {
    id: string;
    businessName: string;
    storeName: string;
    storeSlug: string;
    storeDescription?: string;
    storeLogoUrl?: string;
    storeBannerUrl?: string;
    status: VendorStatus;
    createdAt: string;
}

export interface CreateShopRequest {
    businessName: string;
    storeName: string;
    storeSlug: string;
    storeDescription?: string;
    businessEmail?: string;
    businessPhone?: string;
}
