package com.markethub.vendor.dto;

import com.markethub.vendor.entity.VendorStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;
import lombok.Data;

public class VendorDto {

    @Data
    @Builder
    public static class CreateRequest {
        @NotBlank(message = "Business name is required")
        private String businessName;

        @NotBlank(message = "Store name is required")
        private String storeName;

        @NotBlank(message = "Store slug is required")
        @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug must be lowercase alphanumeric with hyphens")
        private String storeSlug;

        private String storeDescription;
        private String businessEmail;
        private String businessPhone;
    }

    @Data
    @Builder
    public static class Response {
        private String id;
        private String businessName;
        private String storeName;
        private String storeSlug;
        private String storeDescription;
        private String storeLogoUrl;
        private String storeBannerUrl;
        private VendorStatus status;
        private String createdAt;
    }
}
