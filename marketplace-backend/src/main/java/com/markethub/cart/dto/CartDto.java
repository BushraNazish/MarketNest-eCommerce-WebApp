package com.markethub.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class CartDto {
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private List<CartItemDto> items;
        private BigDecimal totalAmount;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemDto {
        private Long id;
        private UUID productId;
        private String productName;
        private String productImageUrl;
        private Integer quantity;
        private BigDecimal price;
        private BigDecimal subtotal;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddItemRequest {
        private UUID productId;
        private Integer quantity;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateItemRequest {
        private Integer quantity;
    }
}
