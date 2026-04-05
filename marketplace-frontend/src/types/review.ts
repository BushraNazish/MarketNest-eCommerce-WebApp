export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';

export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';

export interface ProductReview {
    id: string;
    productId: string;
    userId: string;
    userName: string;
    orderItemId: string;
    rating: number;
    title: string;
    body: string;
    pros: string[];
    cons: string[];
    images: string[];
    isVerifiedPurchase: boolean;
    status: ReviewStatus;
    moderationNotes?: string;
    helpfulCount: number;
    notHelpfulCount: number;
    isEdited: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SellerReview {
    id: string;
    vendorId: string;
    userId: string;
    userName: string;
    subOrderId: string;
    rating: number;
    communicationRating: number;
    shippingRating: number;
    packagingRating: number;
    body: string;
    status: ReviewStatus;
    createdAt: string;
    updatedAt: string;
}

export interface ReviewRequest {
    productId: string;
    orderItemId: string;
    rating: number;
    title: string;
    body: string;
    pros?: string[];
    cons?: string[];
    images?: string[];
}

export interface SellerReviewRequest {
    vendorId: string;
    subOrderId: string;
    rating: number;
    communicationRating: number;
    shippingRating: number;
    packagingRating: number;
    body?: string;
}

export interface ReviewVoteRequest {
    isHelpful: boolean;
}

export interface ReportRequest {
    reason: string;
    details?: string;
}

export interface PaginatedResponse<T> {
    content: T[];
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}
