package com.markethub.order.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class OrderItemResponse {
    private UUID id;

    @JsonProperty("product_id")
    private UUID productId;

    @JsonProperty("product_name")
    private String productName;

    private Integer quantity;

    @JsonProperty("unit_price")
    private BigDecimal unitPrice;

    @JsonProperty("total_amount")
    private BigDecimal totalAmount;
}
