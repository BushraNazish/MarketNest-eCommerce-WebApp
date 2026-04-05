package com.markethub.review.repository;

import com.markethub.review.entity.ProductRatingSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProductRatingSummaryRepository extends JpaRepository<ProductRatingSummary, UUID> {
}
