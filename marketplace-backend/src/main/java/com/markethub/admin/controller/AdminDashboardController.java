package com.markethub.admin.controller;

import com.markethub.admin.dto.AdminDashboardStatsDto;
import com.markethub.admin.dto.CommissionResponseDto;
import com.markethub.admin.dto.CustomerResponseDto;
import com.markethub.admin.service.AdminDashboardService;
import com.markethub.order.dto.OrderResponse;
import com.markethub.product.dto.ProductDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import com.markethub.vendor.service.VendorService;
import com.markethub.vendor.dto.VendorDto;
import com.markethub.vendor.entity.VendorStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Operations", description = "Admin API endpoints")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {
    
    private final AdminDashboardService adminDashboardService;
    private final VendorService vendorService;

    @Operation(summary = "Get admin dashboard statistics")
    @GetMapping("/dashboard/stats")
    public ResponseEntity<AdminDashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(adminDashboardService.getDashboardStats());
    }

    @Operation(summary = "Get all customers")
    @GetMapping("/customers")
    public ResponseEntity<List<CustomerResponseDto>> getAllCustomers() {
        return ResponseEntity.ok(adminDashboardService.getAllCustomers());
    }

    @Operation(summary = "Get all orders")
    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(adminDashboardService.getAllOrders());
    }

    @Operation(summary = "Get all products")
    @GetMapping("/products")
    public ResponseEntity<List<ProductDto.Response>> getAllProducts() {
        return ResponseEntity.ok(adminDashboardService.getAllProducts());
    }

    @Operation(summary = "Get all commissions")
    @GetMapping("/commissions")
    public ResponseEntity<List<CommissionResponseDto>> getAllCommissions() {
        return ResponseEntity.ok(adminDashboardService.getAllCommissions());
    }

    @Operation(summary = "Get recent orders")
    @GetMapping("/dashboard/recent-orders")
    public ResponseEntity<List<OrderResponse>> getRecentOrders() {
        return ResponseEntity.ok(adminDashboardService.getRecentOrders());
    }

    @Operation(summary = "Get all vendors")
    @GetMapping("/vendors")
    public ResponseEntity<List<VendorDto.Response>> getAllVendors() {
        return ResponseEntity.ok(vendorService.getAllVendors());
    }

    @Operation(summary = "Approve or update vendor status")
    @PutMapping("/vendors/{vendorId}/status")
    public ResponseEntity<VendorDto.Response> updateVendorStatus(
            @PathVariable java.util.UUID vendorId,
            @RequestBody Map<String, String> payload) {
        VendorStatus status = VendorStatus.valueOf(payload.get("status"));
        return ResponseEntity.ok(vendorService.updateVendorStatus(vendorId, status));
    }
}
