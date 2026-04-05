package com.markethub.payment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentVerificationRequest {
    @JsonProperty("razorpay_order_id")
    @NotNull(message = "razorpay_order_id is required")
    private String razorpayOrderId;

    @JsonProperty("razorpay_payment_id")
    @NotNull(message = "razorpay_payment_id is required")
    private String razorpayPaymentId;

    @JsonProperty("razorpay_signature")
    @NotNull(message = "razorpay_signature is required")
    private String razorpaySignature;
}
