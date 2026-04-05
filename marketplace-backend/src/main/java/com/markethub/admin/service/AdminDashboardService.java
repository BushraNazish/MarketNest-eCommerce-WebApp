package com.markethub.admin.service;

import com.markethub.admin.dto.AdminDashboardStatsDto;
import com.markethub.admin.dto.CommissionResponseDto;
import com.markethub.admin.dto.CustomerResponseDto;
import com.markethub.auth.entity.UserRole;
import com.markethub.auth.repository.UserRepository;
import com.markethub.order.dto.OrderResponse;
import com.markethub.order.repository.OrderRepository;
import com.markethub.order.repository.SubOrderRepository;
import com.markethub.product.dto.ProductDto;
import com.markethub.product.repository.ProductRepository;
import com.markethub.vendor.entity.VendorStatus;
import com.markethub.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {
    private final OrderRepository orderRepository;
    private final SubOrderRepository subOrderRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public AdminDashboardStatsDto getDashboardStats() {
        BigDecimal totalSales = orderRepository.calculateTotalSales();
        if (totalSales == null) {
            totalSales = BigDecimal.ZERO;
        }

        long totalOrders = orderRepository.count();
        long totalCustomers = userRepository.countByRole(UserRole.CUSTOMER);
        long activeVendors = vendorRepository.countByStatus(VendorStatus.APPROVED);
        long totalProducts = productRepository.count();

        BigDecimal totalCommission = subOrderRepository.calculateTotalCommission();
        if (totalCommission == null) {
            totalCommission = BigDecimal.ZERO;
        }

        return AdminDashboardStatsDto.builder()
                .totalSales(totalSales)
                .totalOrders(totalOrders)
                .totalCustomers(totalCustomers)
                .activeVendors(activeVendors)
                .totalProducts(totalProducts)
                .totalCommission(totalCommission)
                .build();
    }

    @Transactional(readOnly = true)
    public List<CustomerResponseDto> getAllCustomers() {
        return userRepository.findAllByRole(UserRole.CUSTOMER).stream()
                .map(user -> CustomerResponseDto.builder()
                        .id(user.getId())
                        .name(user.getFirstName() + " " + user.getLastName())
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .registeredAt(user.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
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

    @Transactional(readOnly = true)
    public List<CommissionResponseDto> getAllCommissions() {
        return subOrderRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(subOrder -> subOrder.getCommissionAmount() != null && subOrder.getCommissionAmount().compareTo(BigDecimal.ZERO) > 0)
                .map(subOrder -> {
                    String productNames = subOrder.getItems().stream()
                            .map(item -> item.getProductName())
                            .collect(Collectors.joining(", "));
                    return CommissionResponseDto.builder()
                            .orderNumber(subOrder.getOrder().getOrderNumber())
                            .subOrderNumber(subOrder.getSubOrderNumber())
                            .vendorName(subOrder.getVendor() != null ? subOrder.getVendor().getStoreName() : "System")
                            .products(productNames)
                            .orderTotal(subOrder.getTotalAmount())
                            .commissionRate(subOrder.getCommissionRate())
                            .commissionAmount(subOrder.getCommissionAmount())
                            .date(subOrder.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto.Response> getAllProducts() {
        return productRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")).stream()
                .map(product -> ProductDto.Response.builder()
                        .id(product.getId())
                        .name(product.getName())
                        .slug(product.getSlug())
                        .basePrice(product.getBasePrice())
                        .salePrice(product.getSalePrice())
                        .status(product.getStatus())
                        .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                        .vendorName(product.getVendor() != null ? product.getVendor().getStoreName() : null)
                        .createdAt(product.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getRecentOrders() {
        return orderRepository.findTop10ByOrderByCreatedAtDesc().stream()
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
}
