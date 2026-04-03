package com.markethub.vendor.repository;

import com.markethub.vendor.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface VendorRepository extends JpaRepository<Vendor, UUID> {
    Optional<Vendor> findByUserId(UUID userId);
    boolean existsByStoreSlug(String storeSlug);
    Optional<Vendor> findByStoreSlug(String storeSlug);
}
