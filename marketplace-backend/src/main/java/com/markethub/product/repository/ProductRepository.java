package com.markethub.product.repository;

import com.markethub.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<Product> {
    Page<Product> findByVendorId(UUID vendorId, Pageable pageable);
    Optional<Product> findBySlug(String slug);
    boolean existsBySlug(String slug);
    long countByVendorId(UUID vendorId);
}
