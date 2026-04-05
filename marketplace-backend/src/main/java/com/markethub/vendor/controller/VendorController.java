package com.markethub.vendor.controller;

import com.markethub.vendor.dto.VendorDto;
import com.markethub.vendor.service.VendorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;
import java.util.UUID;
import com.markethub.order.enums.OrderStatus;
import com.markethub.order.dto.SubOrderResponse;
import com.markethub.order.dto.ReturnRequestResponse;
import com.markethub.order.service.OrderService;
import com.markethub.auth.entity.User;
import com.markethub.auth.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@RestController
@RequestMapping("/api/v1/vendor")
@RequiredArgsConstructor
public class VendorController {

    private final VendorService vendorService;
    private final OrderService orderService;
    private final UserRepository userRepository;

    @PostMapping("/shops")
    public ResponseEntity<VendorDto.Response> createShop(@RequestBody @Valid VendorDto.CreateRequest request) {
        return ResponseEntity.ok(vendorService.createShop(request));
    }

    @GetMapping("/shops/my-shop")
    public ResponseEntity<VendorDto.Response> getMyShop() {
        return ResponseEntity.ok(vendorService.getCurrentUserShop());
    }

    @GetMapping("/{vendorId}/public")
    public ResponseEntity<VendorDto.Response> getPublicVendorProfile(@PathVariable UUID vendorId) {
        return ResponseEntity.ok(vendorService.getVendorProfile(vendorId));
    }

    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<com.markethub.vendor.dto.VendorDashboardStatsDto> getVendorDashboardStats() {
        return ResponseEntity.ok(vendorService.getVendorDashboardStats());
    }

    @PutMapping("/orders/{subOrderId}/status")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<String> updateSubOrderStatus(
            @PathVariable UUID subOrderId,
            @RequestBody Map<String, String> request) {

        OrderStatus status = OrderStatus.valueOf(request.get("status"));
        String trackingNumber = request.get("trackingNumber");
        String trackingUrl = request.get("trackingUrl");
        String carrier = request.get("carrier");
        String notes = request.get("notes");

        orderService.updateSubOrderStatus(subOrderId, status, trackingNumber, trackingUrl, carrier, notes);
        
        return ResponseEntity.ok("SubOrder status updated");
    }

    @GetMapping("/orders")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<List<SubOrderResponse>> getSubOrders() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return ResponseEntity.ok(orderService.getVendorOrders(user));
    }

    @GetMapping("/returns")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<List<ReturnRequestResponse>> getVendorReturns() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return ResponseEntity.ok(orderService.getVendorReturnRequests(user));
    }
}
