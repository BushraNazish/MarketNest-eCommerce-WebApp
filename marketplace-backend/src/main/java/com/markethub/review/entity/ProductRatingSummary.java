package com.markethub.review.entity;

import com.markethub.product.entity.Product;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "product_rating_summary")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRatingSummary {

    @Id
    private UUID productId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "average_rating")
    @Builder.Default
    private BigDecimal averageRating = BigDecimal.ZERO;

    @Column(name = "total_reviews")
    @Builder.Default
    private Integer totalReviews = 0;

    @Column(name = "rating_1_count")
    @Builder.Default
    private Integer rating1Count = 0;

    @Column(name = "rating_2_count")
    @Builder.Default
    private Integer rating2Count = 0;

    @Column(name = "rating_3_count")
    @Builder.Default
    private Integer rating3Count = 0;

    @Column(name = "rating_4_count")
    @Builder.Default
    private Integer rating4Count = 0;

    @Column(name = "rating_5_count")
    @Builder.Default
    private Integer rating5Count = 0;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
