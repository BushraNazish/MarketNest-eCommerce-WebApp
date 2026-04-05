package com.markethub.product.dto;

import com.markethub.product.entity.CategoryType;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

public class CategoryDto {

    @Data
    @Builder
    public static class Response {
        private UUID id;
        private String name;
        private String slug;
        private String description;
        private String imageUrl;
        private String iconName;
        private CategoryType categoryType;
        private Integer level;
        private List<Response> children;
    }
}
