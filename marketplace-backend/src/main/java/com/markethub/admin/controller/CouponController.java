package com.markethub.admin.controller;

import com.markethub.admin.dto.CouponDto;
import com.markethub.admin.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/coupons")
@RequiredArgsConstructor
@Tag(name = "Coupons", description = "Admin Coupons Management API endpoints")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class CouponController {

    private final CouponService couponService;

    @Operation(summary = "Get all coupons")
    @GetMapping
    public ResponseEntity<List<CouponDto.Response>> getAllCoupons() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    @Operation(summary = "Create a new coupon")
    @PostMapping
    public ResponseEntity<CouponDto.Response> createCoupon(@Valid @RequestBody CouponDto.CreateRequest request) {
        return new ResponseEntity<>(couponService.createCoupon(request), HttpStatus.CREATED);
    }

    @Operation(summary = "Delete a coupon")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCoupon(@PathVariable UUID id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.noContent().build();
    }
}
