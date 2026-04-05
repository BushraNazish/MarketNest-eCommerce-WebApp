package com.markethub.order.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.markethub.order.enums.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class OrderStatusHistoryResponse {
    private UUID id;

    @JsonProperty("from_status")
    private OrderStatus fromStatus;

    @JsonProperty("to_status")
    private OrderStatus toStatus;

    private String notes;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}
