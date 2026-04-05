package com.markethub.product.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ProductSearchRequest {
    private String query;
    private UUID categoryId;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String sort; // "price_asc", "price_desc", "newest"
    private int page = 0;
    private int size = 12;
}
