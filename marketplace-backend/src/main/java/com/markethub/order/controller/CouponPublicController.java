package com.markethub.order.controller;

import com.markethub.admin.service.CouponService;
import com.markethub.order.dto.CouponValidationResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
@Tag(name = "Public Coupons", description = "Public Coupon validation API endpoints")
@SecurityRequirement(name = "bearerAuth")
public class CouponPublicController {

    private final CouponService couponService;

    @Operation(summary = "Validate a coupon code")
    @GetMapping("/validate")
    public ResponseEntity<CouponValidationResponse> validateCoupon(
            @RequestParam String code,
            @RequestParam BigDecimal orderAmount) {
        return ResponseEntity.ok(couponService.validateCoupon(code, orderAmount));
    }
}
