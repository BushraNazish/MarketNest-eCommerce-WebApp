package com.markethub.order.repository;

import com.markethub.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByUserId(UUID userId);

    @Query("SELECT COALESCE(SUM(o.grandTotal), 0) FROM Order o WHERE o.status != 'CANCELLED'")
    BigDecimal calculateTotalSales();

    List<Order> findTop10ByOrderByCreatedAtDesc();
    List<Order> findAllByOrderByCreatedAtDesc();
}
