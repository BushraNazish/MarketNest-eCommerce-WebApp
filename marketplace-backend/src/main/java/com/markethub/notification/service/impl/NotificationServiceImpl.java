package com.markethub.notification.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.markethub.auth.entity.User;
import com.markethub.notification.entity.Notification;
import com.markethub.notification.entity.NotificationTemplate;
import com.markethub.notification.enums.NotificationChannel;
import com.markethub.notification.repository.NotificationRepository;
import com.markethub.notification.repository.NotificationTemplateRepository;
import com.markethub.notification.service.NotificationService;
import com.markethub.notification.service.EmailService;
import com.markethub.notification.service.SmsService;
import com.markethub.order.entity.Order;
import com.markethub.order.entity.SubOrder;
import com.markethub.order.entity.ReturnRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationTemplateRepository templateRepository;
    private final ObjectMapper objectMapper;
    private final EmailService emailService;
    private final SmsService smsService;

    @Override
    @Async
    public void sendOrderConfirmation(Order order) {
        Map<String, Object> dataModel = new HashMap<>();
        dataModel.put("orderNumber", order.getOrderNumber());
        dataModel.put("customerName", order.getUser().getFirstName());
        dataModel.put("totalAmount", order.getGrandTotal());

        sendNotification(order.getUser(), "ORDER_CONFIRMED", NotificationChannel.EMAIL, order.getUser().getEmail(), dataModel);
    }

    @Override
    @Async
    public void sendOrderShipped(SubOrder subOrder) {
        Map<String, Object> dataModel = new HashMap<>();
        dataModel.put("orderNumber", subOrder.getOrder().getOrderNumber());
        dataModel.put("subOrderNumber", subOrder.getSubOrderNumber());
        dataModel.put("trackingNumber", subOrder.getTrackingNumber());
        dataModel.put("carrier", subOrder.getCarrier());

        sendNotification(subOrder.getOrder().getUser(), "ORDER_SHIPPED", NotificationChannel.EMAIL, subOrder.getOrder().getUser().getEmail(), dataModel);
    }

    @Override
    @Async
    public void sendOrderDelivered(SubOrder subOrder) {
        Map<String, Object> dataModel = new HashMap<>();
        dataModel.put("orderNumber", subOrder.getOrder().getOrderNumber());
        dataModel.put("subOrderNumber", subOrder.getSubOrderNumber());
        sendNotification(subOrder.getOrder().getUser(), "ORDER_DELIVERED", NotificationChannel.EMAIL, subOrder.getOrder().getUser().getEmail(), dataModel);
    }

    @Override
    @Async
    public void sendOrderCancelled(Order order) {
        Map<String, Object> dataModel = new HashMap<>();
        dataModel.put("orderNumber", order.getOrderNumber());
        dataModel.put("reason", order.getCancellationReason());
        sendNotification(order.getUser(), "ORDER_CANCELLED", NotificationChannel.EMAIL, order.getUser().getEmail(), dataModel);
    }

    @Override
    @Async
    public void sendReturnRequested(ReturnRequest request) {
        Map<String, Object> dataModel = new HashMap<>();
        dataModel.put("returnNumber", request.getReturnNumber());
        dataModel.put("orderNumber", request.getOrder().getOrderNumber());
        sendNotification(request.getUser(), "RETURN_REQUESTED", NotificationChannel.EMAIL, request.getUser().getEmail(), dataModel);
    }

    @Override
    @Async
    public void sendReturnStatusUpdate(ReturnRequest request) {
        Map<String, Object> dataModel = new HashMap<>();
        dataModel.put("returnNumber", request.getReturnNumber());
        dataModel.put("status", request.getStatus().name());
        sendNotification(request.getUser(), "RETURN_STATUS_UPDATED", NotificationChannel.EMAIL, request.getUser().getEmail(), dataModel);
    }

    @Override
    @Async
    public void sendNotification(User user, String templateCode, NotificationChannel channel, String recipient, Object dataModel) {
        try {
            NotificationTemplate template = templateRepository.findByCode(templateCode).orElse(null);
            
            String subject = templateCode;
            String body = "You have a new notification regarding " + templateCode;

            if (template != null) {
                subject = template.getEmailSubject() != null ? template.getEmailSubject() : subject;
                body = template.getEmailBody() != null ? template.getEmailBody() : body;
                
                // Extremely simple templating engine for demonstration
                // In production, use Thymeleaf, FreeMarker, or similar
                if (dataModel instanceof Map) {
                    Map<String, Object> map = (Map<String, Object>) dataModel;
                    for (Map.Entry<String, Object> entry : map.entrySet()) {
                        String key = "\\$\\{" + entry.getKey() + "\\}";
                        String value = entry.getValue() != null ? entry.getValue().toString() : "";
                        subject = subject.replaceAll(key, value);
                        body = body.replaceAll(key, value);
                    }
                }
            }

            Notification notification = new Notification();
            notification.setUser(user);
            notification.setTemplateCode(templateCode);
            notification.setChannel(channel);
            notification.setRecipient(recipient);
            notification.setSubject(subject);
            notification.setBody(body);
            notification.setStatus("PENDING");
            
            if (dataModel != null) {
                notification.setMetadata(objectMapper.writeValueAsString(dataModel));
            }

            notification = notificationRepository.save(notification);

            // Actually sending via Sendgrid or MSG91
            log.info("Sending {} to {}: {}", channel, recipient, subject);
            
            if (channel == NotificationChannel.EMAIL) {
                emailService.sendEmail(recipient, subject, body);
            } else if (channel == NotificationChannel.SMS) {
                smsService.sendSms(recipient, body);
            }
            
            // If successful
            notification.setStatus("SENT");
            notification.setSentAt(LocalDateTime.now());
            notificationRepository.save(notification);
            
        } catch (Exception e) {
            log.error("Failed to send notification", e);
            // In a real system, you might set status to FAILED and implement retry
        }
    }
}
