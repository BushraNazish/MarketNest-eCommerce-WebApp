package com.markethub.admin.entity;

import com.markethub.auth.entity.User;
import com.markethub.product.entity.CategoryType; // using Top-level type equivalent if exists, but we can just use Enum array or String[]
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "discount_type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private DiscountType discountType; // PERCENTAGE or FIXED

    @Column(name = "discount_value", nullable = false, precision = 12, scale = 2)
    private BigDecimal discountValue;

    @Column(name = "min_order_value", precision = 12, scale = 2)
    private BigDecimal minOrderValue;

    @Column(name = "max_discount", precision = 12, scale = 2)
    private BigDecimal maxDiscount;

    @Column(name = "starts_at", nullable = false)
    private LocalDateTime startsAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "total_usage_limit")
    private Integer totalUsageLimit;

    @Column(name = "per_user_limit")
    private Integer perUserLimit;

    @Column(name = "current_usage")
    private Integer currentUsage;

    @Column(name = "is_active")
    private Boolean isActive;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    public enum DiscountType {
        PERCENTAGE, FIXED
    }
}
