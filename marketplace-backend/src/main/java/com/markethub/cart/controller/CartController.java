package com.markethub.cart.controller;

import com.markethub.auth.entity.User;
import com.markethub.auth.repository.UserRepository;
import com.markethub.cart.dto.CartDto;
import com.markethub.cart.service.CartService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<CartDto.Response> getCart() {
        return ResponseEntity.ok(cartService.getCart(getCurrentUser()));
    }

    @PostMapping("/items")
    public ResponseEntity<CartDto.Response> addItem(@RequestBody CartDto.AddItemRequest request) {
        return ResponseEntity.ok(cartService.addToCart(getCurrentUser(), request));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartDto.Response> updateItem(@PathVariable Long itemId, @RequestBody CartDto.UpdateItemRequest request) {
        return ResponseEntity.ok(cartService.updateItemQuantity(getCurrentUser(), itemId, request.getQuantity()));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartDto.Response> removeItem(@PathVariable Long itemId) {
        return ResponseEntity.ok(cartService.removeItem(getCurrentUser(), itemId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        cartService.clearCart(getCurrentUser());
        return ResponseEntity.noContent().build();
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
