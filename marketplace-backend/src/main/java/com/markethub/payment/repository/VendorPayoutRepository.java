package com.markethub.payment.repository;

import com.markethub.payment.entity.VendorPayout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VendorPayoutRepository extends JpaRepository<VendorPayout, UUID> {
    List<VendorPayout> findByVendorId(UUID vendorId);
}
