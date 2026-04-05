package com.markethub.notification.service;

import com.markethub.auth.entity.User;
import com.markethub.notification.enums.NotificationChannel;
import com.markethub.order.entity.Order;
import com.markethub.order.entity.SubOrder;
import com.markethub.order.entity.ReturnRequest;

public interface NotificationService {
    void sendOrderConfirmation(Order order);
    void sendOrderShipped(SubOrder subOrder);
    void sendOrderDelivered(SubOrder subOrder);
    void sendOrderCancelled(Order order);
    void sendReturnRequested(ReturnRequest request);
    void sendReturnStatusUpdate(ReturnRequest request);
    void sendNotification(User user, String templateCode, NotificationChannel channel, String recipient, Object dataModel);
}
