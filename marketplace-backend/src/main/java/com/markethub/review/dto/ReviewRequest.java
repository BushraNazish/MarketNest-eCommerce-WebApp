package com.markethub.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class ReviewRequest {

    @NotNull(message = "Product ID is required")
    private UUID productId;

    @NotNull(message = "Order Item ID is required")
    private UUID orderItemId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer rating;

    private String title;

    @NotBlank(message = "Review body is required")
    private String body;

    private List<String> pros;
    
    private List<String> cons;
    
    private List<String> images;
}
