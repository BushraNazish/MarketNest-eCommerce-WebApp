package com.markethub.notification.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.markethub.auth.entity.User;
import com.markethub.notification.entity.Notification;
import com.markethub.notification.enums.NotificationChannel;
import com.markethub.notification.repository.NotificationRepository;
import com.markethub.notification.repository.NotificationTemplateRepository;
import com.markethub.notification.service.EmailService;
import com.markethub.notification.service.SmsService;
import com.markethub.order.entity.Order;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceImplTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private NotificationTemplateRepository templateRepository;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private EmailService emailService;

    @Mock
    private SmsService smsService;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private User testUser;
    private Order testOrder;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@example.com");
        testUser.setFirstName("John");

        testOrder = new Order();
        testOrder.setOrderNumber("ORD-123");
        testOrder.setUser(testUser);
        testOrder.setGrandTotal(new BigDecimal("100.00"));
    }

    @Test
    void testSendOrderConfirmation_Success() throws Exception {
        when(templateRepository.findByCode("ORDER_CONFIRMED")).thenReturn(Optional.empty());
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArguments()[0]);

        notificationService.sendOrderConfirmation(testOrder);

        ArgumentCaptor<String> toCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> subjectCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> bodyCaptor = ArgumentCaptor.forClass(String.class);

        verify(emailService, times(1)).sendEmail(toCaptor.capture(), subjectCaptor.capture(), bodyCaptor.capture());
        
        assertEquals("test@example.com", toCaptor.getValue());
        assertEquals("ORDER_CONFIRMED", subjectCaptor.getValue());

        ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(2)).save(notificationCaptor.capture());

        Notification savedNotification = notificationCaptor.getValue();
        assertEquals("test@example.com", savedNotification.getRecipient());
        assertEquals("SENT", savedNotification.getStatus());
        assertEquals(NotificationChannel.EMAIL, savedNotification.getChannel());
        assertNotNull(savedNotification.getSentAt());
    }
}
