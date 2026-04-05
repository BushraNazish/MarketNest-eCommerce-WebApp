package com.markethub.wishlist.service;

import com.markethub.auth.entity.User;
import com.markethub.product.entity.Product;
import com.markethub.product.repository.ProductRepository;
import com.markethub.wishlist.dto.WishlistDto;
import com.markethub.wishlist.entity.Wishlist;
import com.markethub.wishlist.entity.WishlistItem;
import com.markethub.wishlist.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;

    @Transactional
    public WishlistDto.Response getWishlist(User user) {
        Wishlist wishlist = getOrCreateWishlist(user);
        return mapToDto(wishlist);
    }

    @Transactional
    public WishlistDto.Response addToWishlist(User user, UUID productId) {
        Wishlist wishlist = getOrCreateWishlist(user);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        boolean exists = wishlist.getItems().stream()
                .anyMatch(item -> item.getProduct().getId().equals(product.getId()));

        if (!exists) {
            WishlistItem newItem = WishlistItem.builder()
                    .wishlist(wishlist)
                    .product(product)
                    .build();
            wishlist.getItems().add(newItem);
            wishlistRepository.save(wishlist);
        }
        
        return mapToDto(wishlist);
    }

    @Transactional
    public WishlistDto.Response removeFromWishlist(User user, UUID productId) {
        Wishlist wishlist = getOrCreateWishlist(user);
        
        Optional<WishlistItem> itemToRemove = wishlist.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();
        
        itemToRemove.ifPresent(item -> {
            wishlist.getItems().remove(item);
            wishlistRepository.save(wishlist);
        });
        
        return mapToDto(wishlist);
    }

    private Wishlist getOrCreateWishlist(User user) {
        return wishlistRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Wishlist newWishlist = Wishlist.builder()
                            .user(user)
                            .build();
                    return wishlistRepository.save(newWishlist);
                });
    }

    private WishlistDto.Response mapToDto(Wishlist wishlist) {
        return WishlistDto.Response.builder()
                .id(wishlist.getId())
                .items(wishlist.getItems().stream().map(this::mapItemToDto).collect(Collectors.toList()))
                .build();
    }
    
    private WishlistDto.WishlistItemDto mapItemToDto(WishlistItem item) {
        String imageUrl = item.getProduct().getImages().stream()
                .filter(img -> img.isPrimary())
                .findFirst()
                .map(img -> img.getImageUrl())
                .orElse(item.getProduct().getImages().isEmpty() ? null : item.getProduct().getImages().get(0).getImageUrl());

        return WishlistDto.WishlistItemDto.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productImageUrl(imageUrl)
                .price(item.getProduct().getSalePrice() != null ? item.getProduct().getSalePrice() : item.getProduct().getBasePrice())
                .build();
    }
}
