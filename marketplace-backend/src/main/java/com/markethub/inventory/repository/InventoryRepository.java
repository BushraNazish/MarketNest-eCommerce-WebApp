package com.markethub.inventory.repository;

import com.markethub.inventory.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, UUID> {
    List<Inventory> findByProductId(UUID productId);
    List<Inventory> findByVariantId(UUID variantId);
}
