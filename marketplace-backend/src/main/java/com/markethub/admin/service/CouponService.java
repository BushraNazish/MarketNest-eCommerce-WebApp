package com.markethub.admin.service;

import com.markethub.admin.dto.CouponDto;
import com.markethub.admin.entity.Coupon;
import com.markethub.admin.repository.CouponRepository;
import com.markethub.auth.entity.User;
import com.markethub.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.markethub.order.dto.CouponValidationResponse;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CouponDto.Response> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CouponDto.Response createCoupon(CouponDto.CreateRequest request) {
        if (couponRepository.findByCode(request.getCode()).isPresent()) {
            throw new RuntimeException("Coupon code already exists");
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Coupon coupon = Coupon.builder()
                .code(request.getCode().toUpperCase())
                .description(request.getDescription())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minOrderValue(request.getMinOrderValue())
                .maxDiscount(request.getMaxDiscount())
                .startsAt(request.getStartsAt())
                .expiresAt(request.getExpiresAt())
                .totalUsageLimit(request.getTotalUsageLimit())
                .perUserLimit(request.getPerUserLimit())
                .currentUsage(0)
                .isActive(request.getIsActive())
                .createdBy(user)
                .build();

        Coupon saved = couponRepository.save(coupon);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteCoupon(UUID id) {
        if (!couponRepository.existsById(id)) {
            throw new RuntimeException("Coupon not found");
        }
        couponRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public CouponValidationResponse validateCoupon(String code, BigDecimal orderAmount) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase()).orElse(null);

        if (coupon == null || !coupon.getIsActive()) {
            return CouponValidationResponse.builder().valid(false).message("Invalid or inactive coupon code").build();
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStartsAt() != null && now.isBefore(coupon.getStartsAt())) {
            return CouponValidationResponse.builder().valid(false).message("Coupon is not yet active").build();
        }

        if (coupon.getExpiresAt() != null && now.isAfter(coupon.getExpiresAt())) {
            return CouponValidationResponse.builder().valid(false).message("Coupon has expired").build();
        }

        if (coupon.getTotalUsageLimit() != null && coupon.getCurrentUsage() >= coupon.getTotalUsageLimit()) {
            return CouponValidationResponse.builder().valid(false).message("Coupon usage limit reached").build();
        }

        if (coupon.getMinOrderValue() != null && orderAmount.compareTo(coupon.getMinOrderValue()) < 0) {
            return CouponValidationResponse.builder().valid(false).message("Minimum order value not met").build();
        }

        BigDecimal discountAmount;
        if ("FIXED".equals(coupon.getDiscountType().name())) {
            discountAmount = coupon.getDiscountValue();
        } else {
            // PERCENTAGE
            discountAmount = orderAmount.multiply(coupon.getDiscountValue().divide(new BigDecimal(100)));
            if (coupon.getMaxDiscount() != null && discountAmount.compareTo(coupon.getMaxDiscount()) > 0) {
                discountAmount = coupon.getMaxDiscount();
            }
        }

        if (discountAmount.compareTo(orderAmount) > 0) {
            discountAmount = orderAmount; 
        }

        BigDecimal newTotal = orderAmount.subtract(discountAmount);

        return CouponValidationResponse.builder()
                .valid(true)
                .message("Coupon applied successfully")
                .couponCode(coupon.getCode())
                .discountType(coupon.getDiscountType().name())
                .discountValue(coupon.getDiscountValue())
                .discountAmount(discountAmount)
                .newTotal(newTotal)
                .build();
    }

    private CouponDto.Response mapToResponse(Coupon coupon) {
        return CouponDto.Response.builder()
                .id(coupon.getId().toString())
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .minOrderValue(coupon.getMinOrderValue())
                .maxDiscount(coupon.getMaxDiscount())
                .startsAt(coupon.getStartsAt())
                .expiresAt(coupon.getExpiresAt())
                .totalUsageLimit(coupon.getTotalUsageLimit())
                .perUserLimit(coupon.getPerUserLimit())
                .currentUsage(coupon.getCurrentUsage())
                .isActive(coupon.getIsActive())
                .build();
    }
}
