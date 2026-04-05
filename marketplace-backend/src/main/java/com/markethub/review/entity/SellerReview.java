package com.markethub.review.entity;

import com.markethub.auth.entity.User;
import com.markethub.order.entity.SubOrder;
import com.markethub.review.enums.ReviewStatus;
import com.markethub.vendor.entity.Vendor;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "seller_reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerReview {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_order_id")
    private SubOrder subOrder;

    @Column(nullable = false)
    private Integer rating;

    @Column(name = "communication_rating")
    private Integer communicationRating;

    @Column(name = "shipping_rating")
    private Integer shippingRating;

    @Column(name = "packaging_rating")
    private Integer packagingRating;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private ReviewStatus status = ReviewStatus.APPROVED;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
