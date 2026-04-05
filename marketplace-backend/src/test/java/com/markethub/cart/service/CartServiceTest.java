package com.markethub.cart.service;

import com.markethub.auth.entity.User;
import com.markethub.cart.dto.CartDto;
import com.markethub.cart.entity.Cart;
import com.markethub.cart.entity.CartItem;
import com.markethub.cart.repository.CartRepository;
import com.markethub.product.entity.Product;
import com.markethub.product.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private CartService cartService;

    private User user;
    private Product product;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(UUID.randomUUID());

        product = new Product();
        product.setId(UUID.randomUUID());
        product.setBasePrice(new BigDecimal("100.00"));
        product.setName("Test Product");
    }

    @Test
    void testAddToCart() {
        Cart cart = Cart.builder()
                .user(user)
                .totalAmount(BigDecimal.ZERO)
                .build();

        when(cartRepository.findByUserId(user.getId())).thenReturn(Optional.of(cart));
        when(productRepository.findById(product.getId())).thenReturn(Optional.of(product));
        when(cartRepository.save(any(Cart.class))).thenAnswer(i -> i.getArguments()[0]);

        CartDto.AddItemRequest req = new CartDto.AddItemRequest(product.getId(), 2);
        CartDto.Response res = cartService.addToCart(user, req);

        assertEquals(1, res.getItems().size());
        assertEquals(new BigDecimal("200.00"), res.getTotalAmount());
        assertEquals(2, res.getItems().get(0).getQuantity());
    }
}
