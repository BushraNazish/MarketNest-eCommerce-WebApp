package com.markethub.review.repository;

import com.markethub.review.entity.SellerReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SellerReviewRepository extends JpaRepository<SellerReview, UUID> {
    
    Page<SellerReview> findByVendorId(UUID vendorId, Pageable pageable);
    
    boolean existsByUserIdAndSubOrderId(UUID userId, UUID subOrderId);
    
    @Query("SELECT AVG(r.rating) FROM SellerReview r WHERE r.vendor.id = :vendorId AND r.status = 'APPROVED'")
    Double calculateAverageRating(UUID vendorId);
    
    @Query("SELECT COUNT(r) FROM SellerReview r WHERE r.vendor.id = :vendorId AND r.status = 'APPROVED'")
    Long countApprovedReviews(UUID vendorId);
}
