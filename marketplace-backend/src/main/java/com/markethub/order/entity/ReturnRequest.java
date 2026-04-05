package com.markethub.order.entity;

import com.markethub.auth.entity.User;
import com.markethub.order.enums.ReturnStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "return_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_order_id")
    private SubOrder subOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "return_number", unique = true, nullable = false)
    private String returnNumber;

    @Column(columnDefinition = "jsonb", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    private String items; // Stores list of {order_item_id, quantity, reason} as JSON string to simplicity

    @Column(nullable = false)
    private String reason;

    @Column(name = "reason_details", columnDefinition = "TEXT")
    private String reasonDetails;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", columnDefinition = "return_status")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Builder.Default
    private ReturnStatus status = ReturnStatus.REQUESTED;

    @Column(name = "refund_amount")
    private BigDecimal refundAmount;

    @Column(name = "refund_status")
    private String refundStatus;

    @Column(name = "refund_id")
    private String refundId;

    @Column(name = "pickup_address", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> pickupAddress;

    @Column(name = "pickup_scheduled_at")
    private LocalDateTime pickupScheduledAt;

    @Column(name = "picked_up_at")
    private LocalDateTime pickedUpAt;

    @Column(name = "received_at")
    private LocalDateTime receivedAt;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
