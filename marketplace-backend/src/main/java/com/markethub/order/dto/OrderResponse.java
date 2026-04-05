package com.markethub.order.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.markethub.order.enums.OrderStatus;
import com.markethub.order.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class OrderResponse {
    private UUID id;
    
    @JsonProperty("order_number")
    private String orderNumber;
    
    @JsonProperty("grand_total")
    private BigDecimal grandTotal;
    
    private String currency;
    
    private OrderStatus status;
    
    @JsonProperty("payment_status")
    private PaymentStatus paymentStatus;
    
    @JsonProperty("placed_at")
    private LocalDateTime placedAt;
    
    @JsonProperty("razorpay_order_id")
    private String razorpayOrderId;
    
    @JsonProperty("razorpay_key_id")
    private String razorpayKeyId;

    @JsonProperty("sub_orders")
    private List<SubOrderResponse> subOrders;
}
