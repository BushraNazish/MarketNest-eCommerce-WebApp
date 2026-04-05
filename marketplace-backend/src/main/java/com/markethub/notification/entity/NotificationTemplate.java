package com.markethub.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false, length = 100)
    private String code; // e.g., 'ORDER_CONFIRMED', 'ORDER_SHIPPED'

    @Column(nullable = false)
    private String name;

    @Column(name = "email_subject", length = 500)
    private String emailSubject;

    @Column(name = "email_body", columnDefinition = "TEXT")
    private String emailBody;

    @Column(name = "sms_body", length = 500)
    private String smsBody;

    @Column(name = "push_title")
    private String pushTitle;

    @Column(name = "push_body", length = 500)
    private String pushBody;

    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String variables; // e.g. ["orderNumber", "customerName", "trackingLink"]

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
