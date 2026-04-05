package com.markethub.product.dto;

import com.markethub.product.entity.ProductStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class ProductDto {

    @Data
    @Builder
    public static class CreateRequest {
        private String name;
        private String description;
        private String shortDescription;
        private BigDecimal basePrice;
        private BigDecimal salePrice;
        private UUID categoryId;
        private List<String> imageUrls;
    }

    @Data
    @Builder
    public static class Response {
        private UUID id;
        private String name;
        private String slug;
        private String description;
        private String shortDescription;
        private BigDecimal basePrice;
        private BigDecimal salePrice;
        private ProductStatus status;
        private UUID categoryId;
        private String categoryName;
        private UUID vendorId;
        private String vendorName;
        private List<ImageResponse> images;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    public static class ImageResponse {
        private UUID id;
        private String imageUrl;
        private boolean isPrimary;
    }
}
