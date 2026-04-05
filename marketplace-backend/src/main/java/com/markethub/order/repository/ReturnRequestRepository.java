package com.markethub.order.repository;

import com.markethub.order.entity.ReturnRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, UUID> {
    Optional<ReturnRequest> findByReturnNumber(String returnNumber);
    List<ReturnRequest> findByUserId(UUID userId);
    List<ReturnRequest> findByOrderId(UUID orderId);
    List<ReturnRequest> findBySubOrderVendorId(UUID vendorId);
}
