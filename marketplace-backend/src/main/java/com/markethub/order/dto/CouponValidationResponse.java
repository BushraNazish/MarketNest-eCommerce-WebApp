package com.markethub.order.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CouponValidationResponse {
    private boolean valid;
    private String message;
    private String couponCode;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal discountAmount;
    private BigDecimal newTotal;
}
