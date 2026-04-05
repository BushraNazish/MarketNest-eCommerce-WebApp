package com.markethub.cart.service;

import com.markethub.auth.entity.User;
import com.markethub.cart.dto.CartDto;
import com.markethub.cart.entity.Cart;
import com.markethub.cart.entity.CartItem;
import com.markethub.cart.repository.CartRepository;
import com.markethub.product.entity.Product;
import com.markethub.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    @Transactional
    public CartDto.Response getCart(User user) {
        Cart cart = getOrCreateCart(user);
        return mapToDto(cart);
    }

    @Transactional
    public CartDto.Response addToCart(User user, CartDto.AddItemRequest request) {
        Cart cart = getOrCreateCart(user);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .price(product.getSalePrice() != null ? product.getSalePrice() : product.getBasePrice()) // Use Sale Price if available
                    .build();
            cart.addItem(newItem);
        }
        
        cart.calculateTotal();
        Cart savedCart = cartRepository.save(cart);
        return mapToDto(savedCart);
    }

    @Transactional
    public CartDto.Response updateItemQuantity(User user, Long itemId, int quantity) {
        Cart cart = getOrCreateCart(user);
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));
        
        if (quantity <= 0) {
            cart.removeItem(item);
        } else {
            item.setQuantity(quantity);
        }
        
        cart.calculateTotal();
        Cart savedCart = cartRepository.save(cart);
        return mapToDto(savedCart);
    }

    @Transactional
    public CartDto.Response removeItem(User user, Long itemId) {
        Cart cart = getOrCreateCart(user);
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));
        
        cart.removeItem(item);
        cart.calculateTotal();
        Cart savedCart = cartRepository.save(cart);
        return mapToDto(savedCart);
    }

    @Transactional
    public void clearCart(User user) {
        Cart cart = getOrCreateCart(user);
        cart.getItems().clear();
        cart.setTotalAmount(BigDecimal.ZERO);
        cartRepository.save(cart);
    }

    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .user(user)
                            .totalAmount(BigDecimal.ZERO)
                            .build();
                    return cartRepository.save(newCart);
                });
    }

    private CartDto.Response mapToDto(Cart cart) {
        return CartDto.Response.builder()
                .id(cart.getId())
                .totalAmount(cart.getTotalAmount())
                .items(cart.getItems().stream().map(this::mapItemToDto).collect(Collectors.toList()))
                .build();
    }
    
    private CartDto.CartItemDto mapItemToDto(CartItem item) {
        String imageUrl = item.getProduct().getImages().stream()
                .filter(img -> img.isPrimary())
                .findFirst()
                .map(img -> img.getImageUrl())
                .orElse(item.getProduct().getImages().isEmpty() ? null : item.getProduct().getImages().get(0).getImageUrl());

        return CartDto.CartItemDto.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productImageUrl(imageUrl)
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .subtotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .build();
    }
}
