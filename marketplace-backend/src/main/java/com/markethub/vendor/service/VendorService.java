package com.markethub.vendor.service;

import com.markethub.auth.entity.User;
import com.markethub.auth.entity.UserRole;
import com.markethub.auth.repository.UserRepository;
import com.markethub.vendor.dto.VendorDto;
import com.markethub.vendor.entity.Vendor;
import com.markethub.vendor.entity.VendorStatus;
import com.markethub.vendor.repository.VendorRepository;
import com.markethub.order.repository.SubOrderRepository;
import com.markethub.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VendorService {

    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final SubOrderRepository subOrderRepository;
    private final ProductRepository productRepository;

    @Transactional
    public VendorDto.Response createShop(VendorDto.CreateRequest request) {
        // Get current authenticated user
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (vendorRepository.findByUserId(user.getId()).isPresent()) {
            throw new RuntimeException("User already has a shop");
        }

        if (vendorRepository.existsByStoreSlug(request.getStoreSlug())) {
            throw new RuntimeException("Shop URL (slug) is already taken");
        }

        // Create Vendor
        Vendor vendor = Vendor.builder()
                .user(user)
                .businessName(request.getBusinessName())
                .storeName(request.getStoreName())
                .storeSlug(request.getStoreSlug())
                .storeDescription(request.getStoreDescription())
                .businessEmail(request.getBusinessEmail())
                .businessPhone(request.getBusinessPhone())
                .status(VendorStatus.PENDING) // Default to Pending
                .build();

        Vendor savedVendor = vendorRepository.saveAndFlush(vendor);

        // Auto-upgrade user role to SELLER if not already
        if (user.getRole() == UserRole.CUSTOMER) {
            user.setRole(UserRole.SELLER);
            userRepository.save(user);
        }

        return mapToResponse(savedVendor);
    }

    @Transactional(readOnly = true)
    public VendorDto.Response getCurrentUserShop() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Vendor vendor = vendorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No shop found for this user"));

        return mapToResponse(vendor);
    }

    @Transactional(readOnly = true)
    public VendorDto.Response getVendorProfile(java.util.UUID vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        if (vendor.getStatus() != VendorStatus.APPROVED && vendor.getStatus() != VendorStatus.PENDING) {
            throw new RuntimeException("Vendor profile is not available");
        }

        return mapToResponse(vendor);
    }

    @Transactional(readOnly = true)
    public com.markethub.vendor.dto.VendorDashboardStatsDto getVendorDashboardStats() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Vendor vendor = vendorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No shop found for this user"));

        BigDecimal totalSales = subOrderRepository.calculateTotalSalesByVendor(vendor.getId());
        if (totalSales == null) {
            totalSales = BigDecimal.ZERO;
        }

        long totalOrders = subOrderRepository.countByVendorId(vendor.getId());
        long totalProducts = productRepository.countByVendorId(vendor.getId());

        return com.markethub.vendor.dto.VendorDashboardStatsDto.builder()
                .totalSales(totalSales)
                .totalOrders(totalOrders)
                .totalProducts(totalProducts)
                .build();
    }

    @Transactional(readOnly = true)
    public java.util.List<VendorDto.Response> getAllVendors() {
        return vendorRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public VendorDto.Response updateVendorStatus(java.util.UUID vendorId, VendorStatus status) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        vendor.setStatus(status);
        vendor = vendorRepository.save(vendor);
        return mapToResponse(vendor);
    }

    private VendorDto.Response mapToResponse(Vendor vendor) {
        return VendorDto.Response.builder()
                .id(vendor.getId().toString())
                .businessName(vendor.getBusinessName())
                .storeName(vendor.getStoreName())
                .storeSlug(vendor.getStoreSlug())
                .storeDescription(vendor.getStoreDescription())
                .storeLogoUrl(vendor.getStoreLogoUrl())
                .storeBannerUrl(vendor.getStoreBannerUrl())
                .status(vendor.getStatus())
                .ratingAverage(vendor.getRatingAverage())
                .ratingCount(vendor.getRatingCount())
                .createdAt(vendor.getCreatedAt() != null ? vendor.getCreatedAt().toString() : LocalDateTime.now().toString())
                .build();
    }
}
