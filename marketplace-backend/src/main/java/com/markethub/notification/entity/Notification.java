package com.markethub.notification.entity;

import com.markethub.auth.entity.User;
import com.markethub.notification.enums.NotificationChannel;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "template_code", length = 100)
    private String templateCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", columnDefinition = "notification_channel", nullable = false)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private NotificationChannel channel;

    @Column(nullable = false)
    private String recipient;

    @Column(length = 500)
    private String subject;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String body;

    @Column(length = 20)
    @Builder.Default
    private String status = "PENDING"; // 'PENDING', 'SENT', 'DELIVERED', 'FAILED'

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String metadata;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
