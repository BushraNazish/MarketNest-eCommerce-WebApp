package com.markethub.review.dto;

import com.markethub.review.enums.ReviewStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class SellerReviewResponse {
    private UUID id;
    private UUID vendorId;
    private UUID userId;
    private String userName;
    private UUID subOrderId;
    private Integer rating;
    private Integer communicationRating;
    private Integer shippingRating;
    private Integer packagingRating;
    private String body;
    private ReviewStatus status;
    private LocalDateTime createdAt;
}
