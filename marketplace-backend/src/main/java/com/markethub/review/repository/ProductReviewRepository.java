package com.markethub.review.repository;

import com.markethub.review.entity.ProductReview;
import com.markethub.review.enums.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, UUID> {
    
    Page<ProductReview> findByProductIdAndStatus(UUID productId, ReviewStatus status, Pageable pageable);
    
    Page<ProductReview> findByStatus(ReviewStatus status, Pageable pageable);
    
    Optional<ProductReview> findByUserIdAndOrderItemId(UUID userId, UUID orderItemId);
    
    boolean existsByUserIdAndOrderItemId(UUID userId, UUID orderItemId);
    
    @Query("SELECT AVG(r.rating) FROM ProductReview r WHERE r.product.id = :productId AND r.status = 'APPROVED'")
    Double calculateAverageRating(UUID productId);
    
    @Query("SELECT COUNT(r) FROM ProductReview r WHERE r.product.id = :productId AND r.status = 'APPROVED'")
    Long countApprovedReviews(UUID productId);
}
