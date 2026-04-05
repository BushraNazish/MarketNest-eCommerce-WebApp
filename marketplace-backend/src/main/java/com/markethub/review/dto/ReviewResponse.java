package com.markethub.review.dto;

import com.markethub.review.enums.ReviewStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ReviewResponse {
    private UUID id;
    private UUID productId;
    private UUID userId;
    private String userName;
    private Integer rating;
    private String title;
    private String body;
    private List<String> pros;
    private List<String> cons;
    private List<String> images;
    private boolean isVerifiedPurchase;
    private ReviewStatus status;
    private Integer helpfulCount;
    private Integer notHelpfulCount;
    private boolean isEdited;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
