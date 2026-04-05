package com.markethub.order.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.markethub.auth.entity.User;
import com.markethub.cart.entity.Cart;
import com.markethub.cart.entity.CartItem;
import com.markethub.cart.repository.CartRepository;
import com.markethub.inventory.repository.InventoryRepository;
import com.markethub.order.dto.AddressDTO;
import com.markethub.order.dto.OrderRequest;
import com.markethub.order.dto.OrderResponse;
import com.markethub.order.dto.SubOrderResponse;
import com.markethub.order.dto.OrderItemResponse;
import com.markethub.order.dto.OrderStatusHistoryResponse;
import com.markethub.order.dto.ReturnRequestResponse;
import com.markethub.order.entity.Order;
import com.markethub.order.entity.OrderItem;
import com.markethub.order.entity.SubOrder;
import com.markethub.order.enums.OrderStatus;
import com.markethub.order.enums.PaymentStatus;
import com.markethub.order.repository.OrderItemRepository;
import com.markethub.order.repository.OrderRepository;
import com.markethub.order.repository.SubOrderRepository;
import com.markethub.order.repository.OrderStatusHistoryRepository;
import com.markethub.order.repository.ReturnRequestRepository;
import com.markethub.order.entity.OrderStatusHistory;
import com.markethub.order.entity.ReturnRequest;
import com.markethub.order.enums.ReturnStatus;
import com.markethub.order.service.OrderService;
import com.markethub.payment.entity.PaymentTransaction;
import com.markethub.payment.enums.TransactionStatus;
import com.markethub.payment.repository.PaymentTransactionRepository;
import com.markethub.payment.service.PaymentService;
import com.markethub.notification.service.NotificationService;
import com.markethub.vendor.entity.Vendor;
import com.markethub.vendor.repository.VendorRepository;
import com.markethub.admin.repository.SystemConfigRepository;
import com.markethub.admin.entity.SystemConfig;
import com.markethub.admin.repository.CouponRepository;
import com.markethub.admin.entity.Coupon;
import com.markethub.order.dto.CouponValidationResponse;
import com.markethub.admin.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final SubOrderRepository subOrderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final ReturnRequestRepository returnRequestRepository;
    private final CartRepository cartRepository;
    private final InventoryRepository inventoryRepository;
    private final PaymentService paymentService;
    private final NotificationService notificationService;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final ObjectMapper objectMapper;
    private final VendorRepository vendorRepository;
    private final SystemConfigRepository systemConfigRepository;
    private final CouponService couponService;
    private final CouponRepository couponRepository;

    @Value("${razorpay.key-id}")
    private String razorpayKeyId;

    @Override
    @Transactional
    public OrderResponse createOrder(User user, OrderRequest request) {
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Logic to validate inventory would go here based on inventoryRepository

        Order order = new Order();
        order.setUser(user);
        order.setOrderNumber(generateOrderNumber());
        order.setSubtotal(cart.getTotalAmount());
        
        BigDecimal grandTotal = cart.getTotalAmount();
        
        if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
            CouponValidationResponse cvr = couponService.validateCoupon(request.getCouponCode(), grandTotal);
            if (cvr.isValid()) {
                grandTotal = cvr.getNewTotal();
                order.setCouponDiscount(cvr.getDiscountAmount());
                order.setCouponCode(cvr.getCouponCode());
                
                Coupon couponEntity = couponRepository.findByCode(request.getCouponCode().toUpperCase()).orElse(null);
                if (couponEntity != null) {
                    couponEntity.setCurrentUsage(couponEntity.getCurrentUsage() + 1);
                    couponRepository.save(couponEntity);
                }
            } else {
                throw new RuntimeException("Invalid coupon: " + cvr.getMessage());
            }
        }
        
        order.setGrandTotal(grandTotal); 
        
        if (request.getShippingAddress() != null) {
            order.setShippingAddress(convertAddressToMap(request.getShippingAddress()));
        }
        if (request.getBillingAddress() != null) {
            order.setBillingAddress(convertAddressToMap(request.getBillingAddress()));
        }
        
        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setPlacedAt(LocalDateTime.now());
        
        order = orderRepository.save(order);
        
        // Fetch Platform Fee Concept
        BigDecimal platformFeePercentage = BigDecimal.ZERO;
        SystemConfig feeConfig = systemConfigRepository.findByConfigKey("PLATFORM_FEE_PERCENTAGE").orElse(null);
        if (feeConfig != null) {
            try {
                platformFeePercentage = new BigDecimal(feeConfig.getConfigValue());
            } catch (Exception e) {}
        }

        Map<Vendor, List<CartItem>> itemsByVendor = cart.getItems().stream()
                .collect(Collectors.groupingBy(item -> item.getProduct().getVendor()));

        List<SubOrder> subOrders = new ArrayList<>();
        List<OrderItem> orderItems = new ArrayList<>();

        for (Map.Entry<Vendor, List<CartItem>> entry : itemsByVendor.entrySet()) {
            Vendor vendor = entry.getKey();
            List<CartItem> vendorItems = entry.getValue();

            BigDecimal vendorTotal = vendorItems.stream()
                    .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            SubOrder subOrder = new SubOrder();
            subOrder.setOrder(order);
            subOrder.setVendor(vendor);
            subOrder.setSubOrderNumber(order.getOrderNumber() + "-" + UUID.randomUUID().toString().substring(0, 4));
            subOrder.setSubtotal(vendorTotal);
            subOrder.setTotalAmount(vendorTotal);
            subOrder.setStatus(OrderStatus.PENDING);
            
            BigDecimal commissionAmount = vendorTotal.multiply(platformFeePercentage.divide(new BigDecimal(100)));
            BigDecimal vendorEarning = vendorTotal.subtract(commissionAmount);
            
            subOrder.setCommissionRate(platformFeePercentage);
            subOrder.setCommissionAmount(commissionAmount);
            subOrder.setVendorEarning(vendorEarning);
            
            subOrder = subOrderRepository.save(subOrder);
            subOrders.add(subOrder);

            for (CartItem item : vendorItems) {
                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setSubOrder(subOrder);
                orderItem.setProduct(item.getProduct());
                orderItem.setVendor(vendor);
                orderItem.setQuantity(item.getQuantity());
                orderItem.setUnitPrice(item.getPrice());
                orderItem.setSubtotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                orderItem.setTotalAmount(orderItem.getSubtotal());
                orderItem.setProductName(item.getProduct().getName());
                // orderItem.setVariant(item.getVariant());
                
                orderItems.add(orderItem);
            }
        }
        orderItemRepository.saveAll(orderItems);

        String razorpayOrderId = null;
        if ("ONLINE".equalsIgnoreCase(request.getPaymentMethod()) || "CARD".equalsIgnoreCase(request.getPaymentMethod())) {
            try {
                razorpayOrderId = paymentService.createRazorpayOrder(order.getGrandTotal(), "INR", order.getOrderNumber());
                paymentService.createTransaction(order, razorpayOrderId);
            } catch (Exception e) {
                throw new RuntimeException("Error creating payment order: " + e.getMessage(), e);
            }
        }

        // Clear cart logic usually here or after payment success
        // cartService.clearCart(user); // If COD, clear here. If Online, clear on verify.

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .grandTotal(order.getGrandTotal())
                .currency(order.getCurrency())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .placedAt(order.getPlacedAt())
                .razorpayOrderId(razorpayOrderId)
                .razorpayKeyId(razorpayKeyId)
                .build();
    }

    @Override
    @Transactional
    public void verifyPayment(String razorpayOrderId, String razorpayPaymentId, String signature) {
        try {
            boolean isValid = paymentService.verifySignature(razorpayOrderId, razorpayPaymentId, signature);
            if (isValid) {
                paymentService.updateTransactionStatus(razorpayOrderId, razorpayPaymentId, "PAID", signature);
                
                PaymentTransaction transaction = paymentTransactionRepository.findByGatewayOrderId(razorpayOrderId)
                        .orElseThrow(() -> new RuntimeException("Transaction not found"));
                
                Order order = transaction.getOrder();
                order.setPaymentStatus(PaymentStatus.PAID);
                order.setStatus(OrderStatus.CONFIRMED);
                order.setConfirmedAt(LocalDateTime.now());
                orderRepository.save(order);
                
                // Clear cart
                cartRepository.findByUserId(order.getUser().getId()).ifPresent(cart -> {
                    cart.getItems().clear();
                    cart.calculateTotal();
                    cartRepository.save(cart);
                });
                
                // Send Order Confirmation Notification
                notificationService.sendOrderConfirmation(order);
            } else {
                paymentService.updateTransactionStatus(razorpayOrderId, razorpayPaymentId, "FAILED", signature);
                throw new RuntimeException("Invalid payment signature");
            }
        } catch (Exception e) {
            throw new RuntimeException("Payment verification failed", e);
        }
    }

    @Override
    public OrderResponse getOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        List<SubOrder> subOrders = subOrderRepository.findByOrderId(order.getId());
        
        List<SubOrderResponse> subOrderResponses = subOrders.stream().map(so -> 
            SubOrderResponse.builder()
                .id(so.getId())
                .subOrderNumber(so.getSubOrderNumber())
                .totalAmount(so.getTotalAmount())
                .status(so.getStatus())
                .trackingNumber(so.getTrackingNumber())
                .trackingUrl(so.getTrackingUrl())
                .carrier(so.getCarrier())
                .vendorId(so.getVendor() != null ? so.getVendor().getId() : null)
                .items(so.getItems().stream().map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                        .productName(item.getProductName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalAmount(item.getTotalAmount())
                        .build()).collect(Collectors.toList()))
                .build()
        ).collect(Collectors.toList());

        // Map to response
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .grandTotal(order.getGrandTotal())
                .currency(order.getCurrency())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .placedAt(order.getPlacedAt())
                .subOrders(subOrderResponses)
                .build();
    }

    @Override
    public List<OrderResponse> getCustomerOrders(User user) {
        List<Order> orders = orderRepository.findByUserId(user.getId());
        
        return orders.stream()
                .sorted((o1, o2) -> o2.getPlacedAt().compareTo(o1.getPlacedAt()))
                .map(order -> OrderResponse.builder()
                        .id(order.getId())
                        .orderNumber(order.getOrderNumber())
                        .grandTotal(order.getGrandTotal())
                        .currency(order.getCurrency())
                        .status(order.getStatus())
                        .paymentStatus(order.getPaymentStatus())
                        .placedAt(order.getPlacedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<SubOrderResponse> getVendorOrders(User user) {
        Vendor vendor = vendorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Shop not found for user"));

        List<SubOrder> subOrders = subOrderRepository.findByVendorId(vendor.getId());

        return subOrders.stream()
                .sorted((so1, so2) -> so2.getOrder().getPlacedAt().compareTo(so1.getOrder().getPlacedAt()))
                .map(so -> SubOrderResponse.builder()
                        .id(so.getId())
                        .subOrderNumber(so.getSubOrderNumber())
                        .totalAmount(so.getTotalAmount())
                        .status(so.getStatus())
                        .trackingNumber(so.getTrackingNumber())
                        .trackingUrl(so.getTrackingUrl())
                        .carrier(so.getCarrier())
                        .vendorId(so.getVendor() != null ? so.getVendor().getId() : null)
                        .items(so.getItems().stream().map(item -> OrderItemResponse.builder()
                                .id(item.getId())
                                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                                .productName(item.getProductName())
                                .quantity(item.getQuantity())
                                .unitPrice(item.getUnitPrice())
                                .totalAmount(item.getTotalAmount())
                                .build()).collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<ReturnRequestResponse> getVendorReturnRequests(User user) {
        Vendor vendor = vendorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Shop not found for user"));

        List<ReturnRequest> returnRequests = returnRequestRepository.findBySubOrderVendorId(vendor.getId());

        return returnRequests.stream()
                .sorted((r1, r2) -> r2.getCreatedAt().compareTo(r1.getCreatedAt()))
                .map(req -> ReturnRequestResponse.builder()
                        .id(req.getId())
                        .returnNumber(req.getReturnNumber())
                        .orderNumber(req.getOrder() != null ? req.getOrder().getOrderNumber() : (req.getSubOrder() != null ? req.getSubOrder().getOrder().getOrderNumber() : null))
                        .subOrderNumber(req.getSubOrder() != null ? req.getSubOrder().getSubOrderNumber() : null)
                        .items(req.getItems())
                        .reason(req.getReason())
                        .reasonDetails(req.getReasonDetails())
                        .status(req.getStatus())
                        .adminNotes(req.getAdminNotes())
                        .createdAt(req.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderStatusHistoryResponse> getOrderHistory(UUID orderId) {
        List<OrderStatusHistory> histories = orderStatusHistoryRepository.findByOrderIdOrderByCreatedAtDesc(orderId);
        return mapToHistoryResponse(histories);
    }

    @Override
    public List<OrderStatusHistoryResponse> getSubOrderHistory(UUID subOrderId) {
        List<OrderStatusHistory> histories = orderStatusHistoryRepository.findBySubOrderIdOrderByCreatedAtDesc(subOrderId);
        return mapToHistoryResponse(histories);
    }

    private List<OrderStatusHistoryResponse> mapToHistoryResponse(List<OrderStatusHistory> histories) {
        return histories.stream().map(h -> OrderStatusHistoryResponse.builder()
                .id(h.getId())
                .fromStatus(h.getFromStatus())
                .toStatus(h.getToStatus())
                .notes(h.getNotes())
                .createdAt(h.getCreatedAt())
                .build()
        ).collect(Collectors.toList());
    }

    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis(); 
    }

    private Map<String, Object> convertAddressToMap(AddressDTO address) {
        return objectMapper.convertValue(address, Map.class);
    }

    @Override
    @Transactional
    public void updateOrderStatus(UUID orderId, OrderStatus newStatus, String notes) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() == newStatus) {
            return;
        }

        OrderStatus oldStatus = order.getStatus();
        order.setStatus(newStatus);

        if (newStatus == OrderStatus.COMPLETED || newStatus == OrderStatus.DELIVERED) {
            order.setCompletedAt(LocalDateTime.now());
        } else if (newStatus == OrderStatus.CANCELLED) {
            order.setCancelledAt(LocalDateTime.now());
            order.setCancellationReason(notes);
        }

        orderRepository.save(order);

        User currentUser = getCurrentUserOrNull();

        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setFromStatus(oldStatus);
        history.setToStatus(newStatus);
        history.setNotes(notes);
        history.setChangedBy(currentUser);
        
        orderStatusHistoryRepository.save(history);
        
        if (newStatus == OrderStatus.CANCELLED) {
            notificationService.sendOrderCancelled(order);
        }
    }

    @Override
    @Transactional
    public void updateSubOrderStatus(UUID subOrderId, OrderStatus newStatus, String trackingNumber, String trackingUrl, String carrier, String notes) {
        SubOrder subOrder = subOrderRepository.findById(subOrderId)
                .orElseThrow(() -> new RuntimeException("SubOrder not found"));

        if (subOrder.getStatus() == newStatus && trackingNumber == null) {
            return; // No status change and no new tracking info
        }

        OrderStatus oldStatus = subOrder.getStatus();
        subOrder.setStatus(newStatus);

        if (trackingNumber != null) subOrder.setTrackingNumber(trackingNumber);
        if (trackingUrl != null) subOrder.setTrackingUrl(trackingUrl);
        if (carrier != null) subOrder.setCarrier(carrier);
        if (notes != null) subOrder.setVendorNotes(notes);

        if (newStatus == OrderStatus.SHIPPED) {
            subOrder.setShippedAt(LocalDateTime.now());
        } else if (newStatus == OrderStatus.DELIVERED) {
            subOrder.setDeliveredAt(LocalDateTime.now());
        }

        subOrderRepository.save(subOrder);

        User currentUser = getCurrentUserOrNull();

        OrderStatusHistory history = new OrderStatusHistory();
        history.setSubOrder(subOrder);
        history.setOrder(subOrder.getOrder()); // Link the parent order as well for easy querying
        history.setFromStatus(oldStatus);
        history.setToStatus(newStatus);
        history.setNotes(notes);
        history.setChangedBy(currentUser);

        orderStatusHistoryRepository.save(history);
        
        // Notifications based on SubOrder status
        if (newStatus == OrderStatus.SHIPPED) {
            notificationService.sendOrderShipped(subOrder);
        } else if (newStatus == OrderStatus.DELIVERED) {
            notificationService.sendOrderDelivered(subOrder);
        }
        
        // Optional: Update parent order status if all sub-orders are delivered/shipped
        checkAndUpdateParentOrderStatus(subOrder.getOrder());
    }

    private void checkAndUpdateParentOrderStatus(Order order) {
        List<SubOrder> subOrders = subOrderRepository.findByOrderId(order.getId()); // Need this method in SubOrderRepo
        
        boolean allDelivered = subOrders.stream().allMatch(so -> so.getStatus() == OrderStatus.DELIVERED);
        boolean allShipped = subOrders.stream().allMatch(so -> so.getStatus() == OrderStatus.SHIPPED || so.getStatus() == OrderStatus.DELIVERED);
        boolean anyProcessing = subOrders.stream().anyMatch(so -> so.getStatus() == OrderStatus.PROCESSING || so.getStatus() == OrderStatus.SHIPPED);

        OrderStatus newStatus = order.getStatus();
        
        if (allDelivered) {
            newStatus = OrderStatus.DELIVERED;
        } else if (allShipped) {
            newStatus = OrderStatus.SHIPPED;
        } else if (anyProcessing && order.getStatus() == OrderStatus.CONFIRMED) {
            newStatus = OrderStatus.PROCESSING;
        }
        
        if (newStatus != order.getStatus()) {
            updateOrderStatus(order.getId(), newStatus, "System auto-update based on sub-orders");
        }
    }

    @Override
    @Transactional
    public void initiateReturnRequest(User user, UUID orderId, UUID subOrderId, String itemsJson, String reason, String reasonDetails) {
        Order order = null;
        SubOrder subOrder = null;

        if (orderId != null) {
            order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));
            if (!order.getUser().getId().equals(user.getId())) {
                throw new RuntimeException("Unauthorized");
            }
        } else if (subOrderId != null) {
            subOrder = subOrderRepository.findById(subOrderId)
                    .orElseThrow(() -> new RuntimeException("SubOrder not found"));
            order = subOrder.getOrder();
            if (!order.getUser().getId().equals(user.getId())) {
                throw new RuntimeException("Unauthorized");
            }
        } else {
            throw new RuntimeException("Either orderId or subOrderId must be provided");
        }

        ReturnRequest returnRequest = new ReturnRequest();
        returnRequest.setReturnNumber("RET-" + System.currentTimeMillis());
        returnRequest.setOrder(order);
        returnRequest.setSubOrder(subOrder);
        returnRequest.setUser(user);
        returnRequest.setItems(itemsJson);
        returnRequest.setReason(reason);
        returnRequest.setReasonDetails(reasonDetails);
        returnRequest.setStatus(ReturnStatus.REQUESTED);

        returnRequestRepository.save(returnRequest);
        
        OrderStatus currentStatus = subOrder != null ? subOrder.getStatus() : order.getStatus();
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setSubOrder(subOrder);
        history.setToStatus(currentStatus);
        history.setFromStatus(currentStatus);
        history.setChangedBy(user);
        history.setNotes("Return Requested: " + reason);
        orderStatusHistoryRepository.save(history);

        notificationService.sendReturnRequested(returnRequest);
    }

    @Override
    @Transactional
    public void processReturnRequest(UUID returnRequestId, String statusStr, String adminNotes) {
        ReturnRequest request = returnRequestRepository.findById(returnRequestId)
                .orElseThrow(() -> new RuntimeException("Return request not found"));

        ReturnStatus newStatus = ReturnStatus.valueOf(statusStr);
        request.setStatus(newStatus);
        
        if (adminNotes != null) {
            request.setAdminNotes(adminNotes);
        }

        if (newStatus == ReturnStatus.APPROVED) {
            // Initiate refund logic via payment service
            // paymentService.initiateRefund(...)
            request.setRefundStatus("INITIATED");
        } else if (newStatus == ReturnStatus.RECEIVED) {
            request.setReceivedAt(LocalDateTime.now());
            // Update inventory here if items are restockable
        } else if (newStatus == ReturnStatus.REFUNDED) {
            request.setRefundStatus("COMPLETED");
            if (request.getSubOrder() != null) {
                updateSubOrderStatus(request.getSubOrder().getId(), OrderStatus.RETURNED, null, null, null, "Items refunded");
            } else if (request.getOrder() != null) {
                updateOrderStatus(request.getOrder().getId(), OrderStatus.RETURNED, "Items refunded");
            }
        }

        returnRequestRepository.save(request);
        
        Order order = request.getOrder();
        SubOrder subOrder = request.getSubOrder();
        OrderStatus currentStatus = subOrder != null ? subOrder.getStatus() : order != null ? order.getStatus() : OrderStatus.DELIVERED;
        
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setSubOrder(subOrder);
        history.setToStatus(currentStatus);
        history.setFromStatus(currentStatus);
        history.setChangedBy(getCurrentUserOrNull());
        history.setNotes("Return Status Updated: " + newStatus.name() + (adminNotes != null && !adminNotes.isEmpty() ? " - " + adminNotes : ""));
        orderStatusHistoryRepository.save(history);
        
        // Send state transition notification for Return Request
        notificationService.sendReturnStatusUpdate(request);
    }
    
    private User getCurrentUserOrNull() {
        try {
            var authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && !authentication.getPrincipal().equals("anonymousUser")) {
                // In a real app we might fetch from DB using the principal explicitly
                // For now, returning null or a proxy if the setup allows it. 
                // We'll just return null for brevity if we don't have the user repo here
                return null; 
            }
        } catch (Exception ignored) {}
        return null;
    }
}
