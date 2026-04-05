export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    iconName: string;
    categoryType: 'ELECTRONICS' | 'FASHION' | 'GROCERIES';
    level: number;
    children: Category[];
}

export interface ProductImage {
    id: string;
    imageUrl: string;
    isPrimary: boolean;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    basePrice: number;
    salePrice: number;
    status: 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'INACTIVE' | 'REJECTED';
    categoryId: string;
    categoryName: string;
    vendorId: string;
    vendorName: string;
    images: ProductImage[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductRequest {
    name: string;
    description: string;
    shortDescription: string;
    basePrice: number;
    salePrice: number;
    categoryId: string;
    imageUrls: string[];
}

export interface ProductSearchParams {
    q?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: 'price_asc' | 'price_desc' | 'newest';
    page?: number;
    size?: number;
}
