package com.markethub.order.service;

import com.markethub.auth.entity.User;
import com.markethub.order.dto.OrderRequest;
import com.markethub.order.dto.OrderResponse;
import com.markethub.order.dto.SubOrderResponse;
import com.markethub.order.enums.OrderStatus;

import java.util.List;
import java.util.UUID;

public interface OrderService {
    OrderResponse createOrder(User user, OrderRequest request);
    void verifyPayment(String razorpayOrderId, String razorpayPaymentId, String signature);
    OrderResponse getOrder(UUID orderId);
    List<OrderResponse> getCustomerOrders(User user);
    void updateOrderStatus(UUID orderId, OrderStatus newStatus, String notes);
    void updateSubOrderStatus(UUID subOrderId, OrderStatus newStatus, String trackingNumber, String trackingUrl, String carrier, String notes);
    
    // History
    List<com.markethub.order.dto.OrderStatusHistoryResponse> getOrderHistory(UUID orderId);
    List<com.markethub.order.dto.OrderStatusHistoryResponse> getSubOrderHistory(UUID subOrderId);
    
    // Vendor 
    List<SubOrderResponse> getVendorOrders(User user);
    List<com.markethub.order.dto.ReturnRequestResponse> getVendorReturnRequests(User user);

    // Returns
    void initiateReturnRequest(User user, UUID orderId, UUID subOrderId, String itemsJson, String reason, String reasonDetails);
    void processReturnRequest(UUID returnRequestId, String status, String adminNotes);
}
