package com.markethub.cart.repository;

import com.markethub.cart.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUserId(UUID userId);
}
