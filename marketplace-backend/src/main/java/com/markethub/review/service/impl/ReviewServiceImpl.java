package com.markethub.review.service.impl;

import com.markethub.auth.entity.User;

import com.markethub.order.entity.OrderItem;
import com.markethub.order.entity.SubOrder;
import com.markethub.order.repository.OrderItemRepository;
import com.markethub.order.repository.SubOrderRepository;
import com.markethub.product.entity.Product;
import com.markethub.product.repository.ProductRepository;
import com.markethub.review.dto.*;
import com.markethub.review.entity.*;
import com.markethub.review.enums.ReportStatus;
import com.markethub.review.enums.ReviewStatus;
import com.markethub.review.repository.*;
import com.markethub.review.service.ReviewService;
import com.markethub.vendor.entity.Vendor;
import com.markethub.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ProductReviewRepository productReviewRepository;
    private final SellerReviewRepository sellerReviewRepository;
    private final ReviewVoteRepository reviewVoteRepository;
    private final ReviewReportRepository reviewReportRepository;
    
    private final ProductRepository productRepository;
    private final VendorRepository vendorRepository;
    private final OrderItemRepository orderItemRepository;
    private final SubOrderRepository subOrderRepository;

    @Override
    @Transactional
    public ReviewResponse submitProductReview(User user, ReviewRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
                
        OrderItem orderItem = orderItemRepository.findById(request.getOrderItemId())
                .orElseThrow(() -> new RuntimeException("Order item not found"));
                
        // Ensure user hasn't already reviewed this exact order item
        if (productReviewRepository.existsByUserIdAndOrderItemId(user.getId(), orderItem.getId())) {
            throw new RuntimeException("You have already reviewed this item");
        }
        
        // Verify purchase (simplified: if orderItem exists and belongs to a suborder for this user)
        boolean isVerified = orderItem.getOrder().getUser().getId().equals(user.getId());

        ProductReview review = ProductReview.builder()
                .product(product)
                .user(user)
                .orderItem(orderItem)
                .rating(request.getRating())
                .title(request.getTitle())
                .body(request.getBody())
                .pros(request.getPros())
                .cons(request.getCons())
                .images(request.getImages())
                .isVerifiedPurchase(isVerified)
                .status(ReviewStatus.APPROVED) // Auto-approve for MVP
                .build();
                
        ProductReview savedReview = productReviewRepository.save(review);
        
        updateProductRating(product.getId());
        
        return mapToReviewResponse(savedReview);
    }

    @Override
    public Page<ReviewResponse> getProductReviews(UUID productId, Pageable pageable) {
        return productReviewRepository.findByProductIdAndStatus(productId, ReviewStatus.APPROVED, pageable)
                .map(this::mapToReviewResponse);
    }

    @Override
    @Transactional
    public ReviewResponse updateProductReview(User user, UUID reviewId, ReviewRequest request) {
        ProductReview review = productReviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
                
        if (!review.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to edit this review");
        }
        
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setBody(request.getBody());
        review.setPros(request.getPros());
        review.setCons(request.getCons());
        review.setImages(request.getImages());
        review.setEdited(true);
        review.setEditedAt(LocalDateTime.now());
        
        ProductReview updated = productReviewRepository.save(review);
        updateProductRating(review.getProduct().getId());
        
        return mapToReviewResponse(updated);
    }

    @Override
    @Transactional
    public void deleteProductReview(User user, UUID reviewId) {
        ProductReview review = productReviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
                
        if (!review.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this review");
        }
        
        UUID productId = review.getProduct().getId();
        productReviewRepository.delete(review);
        updateProductRating(productId);
    }

    @Override
    @Transactional
    public void voteOnReview(User user, UUID reviewId, ReviewVoteRequest request) {
        ProductReview review = productReviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
                
        Optional<ReviewVote> existingVote = reviewVoteRepository.findByReviewIdAndUserId(reviewId, user.getId());
        
        if (existingVote.isPresent()) {
            ReviewVote vote = existingVote.get();
            if (vote.isHelpful() == request.getIsHelpful()) {
                // Same vote again = remove vote (toggle functionality)
                if (vote.isHelpful()) review.setHelpfulCount(review.getHelpfulCount() - 1);
                else review.setNotHelpfulCount(review.getNotHelpfulCount() - 1);
                reviewVoteRepository.delete(vote);
            } else {
                // Changing vote
                if (vote.isHelpful()) {
                    review.setHelpfulCount(review.getHelpfulCount() - 1);
                    review.setNotHelpfulCount(review.getNotHelpfulCount() + 1);
                } else {
                    review.setNotHelpfulCount(review.getNotHelpfulCount() - 1);
                    review.setHelpfulCount(review.getHelpfulCount() + 1);
                }
                vote.setHelpful(request.getIsHelpful());
                reviewVoteRepository.save(vote);
            }
        } else {
            // New vote
            if (request.getIsHelpful()) review.setHelpfulCount(review.getHelpfulCount() + 1);
            else review.setNotHelpfulCount(review.getNotHelpfulCount() + 1);
            
            ReviewVote vote = ReviewVote.builder()
                    .review(review)
                    .user(user)
                    .isHelpful(request.getIsHelpful())
                    .build();
            reviewVoteRepository.save(vote);
        }
        
        productReviewRepository.save(review);
    }

    @Override
    @Transactional
    public void reportReview(User user, UUID reviewId, ReportRequest request) {
        ProductReview review = productReviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
                
        if (reviewReportRepository.existsByReviewIdAndUserId(reviewId, user.getId())) {
            throw new RuntimeException("You have already reported this review");
        }
        
        ReviewReport report = ReviewReport.builder()
                .review(review)
                .user(user)
                .reason(request.getReason())
                .details(request.getDetails())
                .status(ReportStatus.PENDING)
                .build();
                
        reviewReportRepository.save(report);
    }

    @Override
    @Transactional
    public SellerReviewResponse submitSellerReview(User user, SellerReviewRequest request) {
        Vendor vendor = vendorRepository.findById(request.getVendorId())
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
                
        SubOrder subOrder = subOrderRepository.findById(request.getSubOrderId())
                .orElseThrow(() -> new RuntimeException("SubOrder not found"));
                
        if (sellerReviewRepository.existsByUserIdAndSubOrderId(user.getId(), subOrder.getId())) {
            throw new RuntimeException("You have already reviewed this seller for this order");
        }
        
        SellerReview review = SellerReview.builder()
                .vendor(vendor)
                .user(user)
                .subOrder(subOrder)
                .rating(request.getRating())
                .communicationRating(request.getCommunicationRating())
                .shippingRating(request.getShippingRating())
                .packagingRating(request.getPackagingRating())
                .body(request.getBody())
                .status(ReviewStatus.APPROVED)
                .build();
                
        SellerReview savedReview = sellerReviewRepository.save(review);
        
        updateVendorRating(vendor.getId());
        
        return SellerReviewResponse.builder()
                .id(savedReview.getId())
                .vendorId(vendor.getId())
                .userId(user.getId())
                .userName(user.getFirstName() + " " + user.getLastName())
                .subOrderId(subOrder.getId())
                .rating(savedReview.getRating())
                .communicationRating(savedReview.getCommunicationRating())
                .shippingRating(savedReview.getShippingRating())
                .packagingRating(savedReview.getPackagingRating())
                .body(savedReview.getBody())
                .status(savedReview.getStatus())
                .createdAt(savedReview.getCreatedAt())
                .build();
    }

    @Override
    public Page<SellerReviewResponse> getSellerReviews(UUID vendorId, Pageable pageable) {
        return sellerReviewRepository.findByVendorId(vendorId, pageable)
                .map(review -> SellerReviewResponse.builder()
                        .id(review.getId())
                        .vendorId(review.getVendor().getId())
                        .userId(review.getUser().getId())
                        .userName(review.getUser().getFirstName() + " " + review.getUser().getLastName())
                        .subOrderId(review.getSubOrder() != null ? review.getSubOrder().getId() : null)
                        .rating(review.getRating())
                        .communicationRating(review.getCommunicationRating())
                        .shippingRating(review.getShippingRating())
                        .packagingRating(review.getPackagingRating())
                        .body(review.getBody())
                        .status(review.getStatus())
                        .createdAt(review.getCreatedAt())
                        .build());
    }

    @Override
    public Page<SellerReviewResponse> getMySellerReviews(User user, Pageable pageable) {
        Vendor vendor = vendorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        return getSellerReviews(vendor.getId(), pageable);
    }

    @Override
    public Page<ReviewResponse> getPendingReviews(Pageable pageable) {
        return productReviewRepository.findByStatus(ReviewStatus.PENDING, pageable)
                .map(this::mapToReviewResponse);
    }

    @Override
    @Transactional
    public void moderateReview(UUID adminId, UUID reviewId, String action, String notes) {
        ProductReview review = productReviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
                
        if ("APPROVE".equalsIgnoreCase(action)) {
            review.setStatus(ReviewStatus.APPROVED);
        } else if ("REJECT".equalsIgnoreCase(action)) {
            review.setStatus(ReviewStatus.REJECTED);
        } else if ("FLAG".equalsIgnoreCase(action)) {
            review.setStatus(ReviewStatus.FLAGGED);
        } else {
            throw new RuntimeException("Invalid action. Use APPROVE, REJECT, or FLAG.");
        }
        
        review.setModerationNotes(notes);
        // Assuming adminId can be fetched from User repo if needed, omitted here for brevity
        review.setModeratedAt(LocalDateTime.now());
        
        productReviewRepository.save(review);
        updateProductRating(review.getProduct().getId());
    }
    
    // Internal helpers
    private void updateProductRating(UUID productId) {
        Double avg = productReviewRepository.calculateAverageRating(productId);
        Long count = productReviewRepository.countApprovedReviews(productId);
        
        BigDecimal avgBg = avg != null ? BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        
        // Update product table denormalized columns
        productRepository.findById(productId).ifPresent(p -> {
            p.setRatingAverage(avgBg);
            p.setRatingCount(count.intValue());
            productRepository.save(p);
        });
    }

    private void updateVendorRating(UUID vendorId) {
        Double avg = sellerReviewRepository.calculateAverageRating(vendorId);
        Long count = sellerReviewRepository.countApprovedReviews(vendorId);
        
        BigDecimal avgBg = avg != null ? BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        
        vendorRepository.findById(vendorId).ifPresent(v -> {
            v.setRatingAverage(avgBg);
            v.setRatingCount(count.intValue());
            vendorRepository.save(v);
        });
    }

    private ReviewResponse mapToReviewResponse(ProductReview review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .userId(review.getUser() != null ? review.getUser().getId() : null)
                .userName(review.getUser() != null ? review.getUser().getFirstName() + " " + review.getUser().getLastName() : "Anonymous")
                .rating(review.getRating())
                .title(review.getTitle())
                .body(review.getBody())
                .pros(review.getPros())
                .cons(review.getCons())
                .images(review.getImages())
                .isVerifiedPurchase(review.isVerifiedPurchase())
                .status(review.getStatus())
                .helpfulCount(review.getHelpfulCount())
                .notHelpfulCount(review.getNotHelpfulCount())
                .isEdited(review.isEdited())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
