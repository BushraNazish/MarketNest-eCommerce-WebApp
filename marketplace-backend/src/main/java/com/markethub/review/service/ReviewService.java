package com.markethub.review.service;

import com.markethub.auth.entity.User;
import com.markethub.review.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ReviewService {

    // Product Reviews
    ReviewResponse submitProductReview(User user, ReviewRequest request);
    Page<ReviewResponse> getProductReviews(UUID productId, Pageable pageable);
    ReviewResponse updateProductReview(User user, UUID reviewId, ReviewRequest request);
    void deleteProductReview(User user, UUID reviewId);
    
    // Helpfulness Voting
    void voteOnReview(User user, UUID reviewId, ReviewVoteRequest request);

    // Reporting
    void reportReview(User user, UUID reviewId, ReportRequest request);

    // Seller Reviews
    SellerReviewResponse submitSellerReview(User user, SellerReviewRequest request);
    Page<SellerReviewResponse> getSellerReviews(UUID vendorId, Pageable pageable);
    Page<SellerReviewResponse> getMySellerReviews(User user, Pageable pageable);

    // Admin Moderation
    Page<ReviewResponse> getPendingReviews(Pageable pageable);
    void moderateReview(UUID adminId, UUID reviewId, String action, String notes);
}
