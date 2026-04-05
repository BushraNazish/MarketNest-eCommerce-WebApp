package com.markethub.order.controller;

import com.markethub.auth.entity.User;
import com.markethub.auth.repository.UserRepository;
import com.markethub.order.dto.OrderRequest;
import com.markethub.order.dto.OrderResponse;
import com.markethub.order.dto.OrderStatusHistoryResponse;
import com.markethub.order.service.OrderService;
import com.markethub.payment.dto.PaymentVerificationRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import com.markethub.order.enums.OrderStatus;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    @PostMapping("/checkout")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Create order from cart")
    public ResponseEntity<OrderResponse> checkout(@Valid @RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(getCurrentUser(), request));
    }

    @PostMapping("/verify-payment")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Verify Razorpay payment signature")
    public ResponseEntity<String> verifyPayment(@Valid @RequestBody PaymentVerificationRequest request) {
        orderService.verifyPayment(request.getRazorpayOrderId(), request.getRazorpayPaymentId(), request.getRazorpaySignature());
        return ResponseEntity.ok("Payment verified successfully");
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getOrder(id));
    }

    @GetMapping("/my-orders")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get current user's order history")
    public ResponseEntity<List<OrderResponse>> getMyOrders() {
        return ResponseEntity.ok(orderService.getCustomerOrders(getCurrentUser()));
    }
    
    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get tracking history of an order")
    public ResponseEntity<List<OrderStatusHistoryResponse>> getOrderHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getOrderHistory(id));
    }

    @GetMapping("/sub/{subId}/history")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'SELLER', 'ADMIN')")
    @Operation(summary = "Get tracking history of a sub-order")
    public ResponseEntity<List<OrderStatusHistoryResponse>> getSubOrderHistory(@PathVariable UUID subId) {
        return ResponseEntity.ok(orderService.getSubOrderHistory(subId));
    }
    
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update order status (Admin)")
    public ResponseEntity<String> updateOrderStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        
        OrderStatus status = OrderStatus.valueOf(request.get("status"));
        String notes = request.get("notes");
        orderService.updateOrderStatus(id, status, notes);
        return ResponseEntity.ok("Order status updated");
    }

    @PostMapping("/returns/initiate")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Initiate return request")
    public ResponseEntity<String> initiateReturnRequest(
            @RequestBody Map<String, String> request) {
        
        UUID orderId = request.containsKey("orderId") ? UUID.fromString(request.get("orderId")) : null;
        UUID subOrderId = request.containsKey("subOrderId") ? UUID.fromString(request.get("subOrderId")) : null;
        String itemsJson = request.get("itemsJson");
        String reason = request.get("reason");
        String reasonDetails = request.get("reasonDetails");
        
        orderService.initiateReturnRequest(getCurrentUser(), orderId, subOrderId, itemsJson, reason, reasonDetails);
        return ResponseEntity.ok("Return request initiated");
    }

    @PutMapping("/returns/{returnRequestId}/process")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Operation(summary = "Process return request")
    public ResponseEntity<String> processReturnRequest(
            @PathVariable UUID returnRequestId,
            @RequestBody Map<String, String> request) {
        
        String status = request.get("status");
        String adminNotes = request.get("adminNotes");
        
        orderService.processReturnRequest(returnRequestId, status, adminNotes);
        return ResponseEntity.ok("Return request processed");
    }

    private User getCurrentUser() {
        // Assuming the principal is the email or we can cast it if we use CustomUserDetails
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
