package com.markethub.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class SellerReviewRequest {

    @NotNull(message = "Vendor ID is required")
    private UUID vendorId;

    @NotNull(message = "Sub Order ID is required")
    private UUID subOrderId;

    @NotNull(message = "Rating is required")
    @Min(1) @Max(5)
    private Integer rating;

    @Min(1) @Max(5)
    private Integer communicationRating;

    @Min(1) @Max(5)
    private Integer shippingRating;

    @Min(1) @Max(5)
    private Integer packagingRating;

    private String body;
}
