package com.markethub.admin.dto;

import com.markethub.admin.entity.Coupon.DiscountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CouponDto {

    @Data
    @Builder
    public static class Response {
        private String id;
        private String code;
        private String description;
        private DiscountType discountType;
        private BigDecimal discountValue;
        private BigDecimal minOrderValue;
        private BigDecimal maxDiscount;
        private LocalDateTime startsAt;
        private LocalDateTime expiresAt;
        private Integer totalUsageLimit;
        private Integer perUserLimit;
        private Integer currentUsage;
        private Boolean isActive;
    }

    @Data
    public static class CreateRequest {
        @NotBlank(message = "Coupon code is required")
        private String code;
        
        private String description;

        @NotNull(message = "Discount type is required")
        private DiscountType discountType;

        @NotNull(message = "Discount value is required")
        private BigDecimal discountValue;

        private BigDecimal minOrderValue;
        private BigDecimal maxDiscount;

        @NotNull(message = "Starts at is required")
        private LocalDateTime startsAt;

        @NotNull(message = "Expires at is required")
        private LocalDateTime expiresAt;

        private Integer totalUsageLimit;
        private Integer perUserLimit;
        private Boolean isActive = true;
    }
}
