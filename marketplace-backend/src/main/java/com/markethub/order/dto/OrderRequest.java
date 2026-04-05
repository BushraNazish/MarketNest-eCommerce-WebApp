package com.markethub.order.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class OrderRequest {

    @JsonProperty("shipping_address")
    private AddressDTO shippingAddress;

    @JsonProperty("billing_address")
    private AddressDTO billingAddress;

    @JsonProperty("shipping_address_id")
    private UUID shippingAddressId;

    @JsonProperty("billing_address_id")
    private UUID billingAddressId;

    @JsonProperty("payment_method")
    @NotNull(message = "Payment method is required")
    private String paymentMethod;

    @JsonProperty("coupon_code")
    private String couponCode;

    private String notes;
}
