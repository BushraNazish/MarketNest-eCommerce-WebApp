package com.markethub.wishlist.controller;

import com.markethub.auth.entity.User;
import com.markethub.auth.repository.UserRepository;
import com.markethub.wishlist.dto.WishlistDto;
import com.markethub.wishlist.service.WishlistService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class WishlistController {

    private final WishlistService wishlistService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<WishlistDto.Response> getWishlist() {
        return ResponseEntity.ok(wishlistService.getWishlist(getCurrentUser()));
    }

    @PostMapping("/items/{productId}")
    public ResponseEntity<WishlistDto.Response> addItem(@PathVariable UUID productId) {
        return ResponseEntity.ok(wishlistService.addToWishlist(getCurrentUser(), productId));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<WishlistDto.Response> removeItem(@PathVariable UUID productId) {
        return ResponseEntity.ok(wishlistService.removeFromWishlist(getCurrentUser(), productId));
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
