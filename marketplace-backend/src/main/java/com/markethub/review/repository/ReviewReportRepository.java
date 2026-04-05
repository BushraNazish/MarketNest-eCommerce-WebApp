package com.markethub.review.repository;

import com.markethub.review.entity.ReviewReport;
import com.markethub.review.enums.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ReviewReportRepository extends JpaRepository<ReviewReport, UUID> {
    
    Page<ReviewReport> findByStatus(ReportStatus status, Pageable pageable);
    
    boolean existsByReviewIdAndUserId(UUID reviewId, UUID userId);
    
}
