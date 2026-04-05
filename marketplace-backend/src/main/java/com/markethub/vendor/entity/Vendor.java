package com.markethub.vendor.entity;

import com.markethub.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vendors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false, unique = true)
    private User user;

    @Column(name = "business_name", nullable = false)
    private String businessName;

    @Column(name = "store_name", nullable = false)
    private String storeName;

    @Column(name = "store_slug", nullable = false, unique = true)
    private String storeSlug;

    @Column(name = "store_description", columnDefinition = "TEXT")
    private String storeDescription;

    @Column(name = "store_logo_url")
    private String storeLogoUrl;

    @Column(name = "store_banner_url")
    private String storeBannerUrl;

    @Column(name = "business_email")
    private String businessEmail;

    @Column(name = "business_phone")
    private String businessPhone;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(columnDefinition = "vendor_status")
    @Builder.Default
    private VendorStatus status = VendorStatus.PENDING;

    @Column(name = "rating_average", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal ratingAverage = BigDecimal.ZERO;

    @Column(name = "rating_count")
    @Builder.Default
    private Integer ratingCount = 0;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
