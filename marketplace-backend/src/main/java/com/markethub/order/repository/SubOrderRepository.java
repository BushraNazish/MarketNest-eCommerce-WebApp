package com.markethub.order.repository;

import com.markethub.order.entity.SubOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubOrderRepository extends JpaRepository<SubOrder, UUID> {
    Optional<SubOrder> findBySubOrderNumber(String subOrderNumber);
    List<SubOrder> findByVendorId(UUID vendorId);
    List<SubOrder> findByOrderId(UUID orderId);

    long countByVendorId(UUID vendorId);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM SubOrder s WHERE s.vendor.id = :vendorId AND s.status != 'CANCELLED'")
    BigDecimal calculateTotalSalesByVendor(UUID vendorId);
    
    @Query("SELECT COALESCE(SUM(s.commissionAmount), 0) FROM SubOrder s WHERE s.status != 'CANCELLED'")
    BigDecimal calculateTotalCommission();

    List<SubOrder> findAllByOrderByCreatedAtDesc();
}
