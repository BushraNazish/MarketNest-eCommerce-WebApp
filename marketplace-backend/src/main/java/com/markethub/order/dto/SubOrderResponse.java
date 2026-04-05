package com.markethub.order.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.markethub.order.enums.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class SubOrderResponse {
    private UUID id;

    @JsonProperty("sub_order_number")
    private String subOrderNumber;

    @JsonProperty("total_amount")
    private BigDecimal totalAmount;

    private OrderStatus status;

    @JsonProperty("tracking_number")
    private String trackingNumber;

    @JsonProperty("tracking_url")
    private String trackingUrl;

    private String carrier;

    @JsonProperty("vendor_id")
    private UUID vendorId;

    private List<OrderItemResponse> items;
}
