package com.markethub.order.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.markethub.admin.repository.CouponRepository;
import com.markethub.admin.repository.SystemConfigRepository;
import com.markethub.admin.service.CouponService;
import com.markethub.auth.entity.User;
import com.markethub.cart.entity.Cart;
import com.markethub.cart.entity.CartItem;
import com.markethub.cart.repository.CartRepository;
import com.markethub.inventory.repository.InventoryRepository;
import com.markethub.notification.service.NotificationService;
import com.markethub.order.dto.OrderRequest;
import com.markethub.order.dto.OrderResponse;
import com.markethub.order.entity.Order;
import com.markethub.order.repository.OrderItemRepository;
import com.markethub.order.repository.OrderRepository;
import com.markethub.order.repository.OrderStatusHistoryRepository;
import com.markethub.order.repository.ReturnRequestRepository;
import com.markethub.order.repository.SubOrderRepository;
import com.markethub.payment.repository.PaymentTransactionRepository;
import com.markethub.payment.service.PaymentService;
import com.markethub.product.entity.Product;
import com.markethub.vendor.entity.Vendor;
import com.markethub.vendor.repository.VendorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderServiceImplTest {

    @Mock private OrderRepository orderRepository;
    @Mock private SubOrderRepository subOrderRepository;
    @Mock private OrderItemRepository orderItemRepository;
    @Mock private OrderStatusHistoryRepository orderStatusHistoryRepository;
    @Mock private ReturnRequestRepository returnRequestRepository;
    @Mock private CartRepository cartRepository;
    @Mock private InventoryRepository inventoryRepository;
    @Mock private PaymentService paymentService;
    @Mock private NotificationService notificationService;
    @Mock private PaymentTransactionRepository paymentTransactionRepository;
    @Mock private ObjectMapper objectMapper;
    @Mock private VendorRepository vendorRepository;
    @Mock private SystemConfigRepository systemConfigRepository;
    @Mock private CouponService couponService;
    @Mock private CouponRepository couponRepository;

    @InjectMocks
    private OrderServiceImpl orderService;

    private User testUser;
    private Cart testCart;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(orderService, "razorpayKeyId", "test_key_id");

        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@example.com");

        testCart = new Cart();
        testCart.setId(1L);
        testCart.setUser(testUser);
        
        Vendor vendor = new Vendor();
        vendor.setId(UUID.randomUUID());

        Product product = new Product();
        product.setId(UUID.randomUUID());
        product.setName("Test Product");
        product.setVendor(vendor);

        CartItem item = new CartItem();
        item.setId(1L);
        item.setProduct(product);
        item.setQuantity(2);
        item.setPrice(new BigDecimal("100.00"));
        
        List<CartItem> items = new ArrayList<>();
        items.add(item);
        testCart.setItems(items);
    }

    @Test
    void createOrder_Success_COD() throws Exception {
        // Arrange
        OrderRequest request = new OrderRequest();
        request.setPaymentMethod("COD");

        when(cartRepository.findByUserId(testUser.getId())).thenReturn(Optional.of(testCart));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(UUID.randomUUID());
            return o;
        });

        // Act
        OrderResponse response = orderService.createOrder(testUser, request);

        // Assert
        assertNotNull(response);
        assertEquals(com.markethub.order.enums.PaymentStatus.PENDING, response.getPaymentStatus()); // Actually PaymentStatus usually PENDING initially for COD initially, but let's check basic assert
        verify(orderRepository).save(any(Order.class));
        verify(subOrderRepository).save(any());
        verify(orderItemRepository).saveAll(any());
        // For COD, paymentService should not be called for razorpay
        verify(paymentService, never()).createRazorpayOrder(any(), any(), any());
    }

    @Test
    void createOrder_EmptyCart_ThrowsException() {
        // Arrange
        testCart.setItems(new ArrayList<>());
        when(cartRepository.findByUserId(testUser.getId())).thenReturn(Optional.of(testCart));
        OrderRequest request = new OrderRequest();

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            orderService.createOrder(testUser, request);
        });
        assertEquals("Cart is empty", exception.getMessage());
    }
}
