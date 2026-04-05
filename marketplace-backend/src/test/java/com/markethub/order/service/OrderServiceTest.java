package com.markethub.order.service;

import com.markethub.cart.entity.Cart;
import com.markethub.cart.entity.CartItem;
import com.markethub.cart.repository.CartRepository;
import com.markethub.order.dto.OrderRequest;
import com.markethub.order.dto.OrderResponse;
import com.markethub.order.service.impl.OrderServiceImpl;
import com.markethub.product.entity.Product;
import com.markethub.product.entity.ProductStatus;
import com.markethub.vendor.entity.Vendor;
import com.markethub.auth.entity.User;
import com.markethub.payment.service.PaymentService;
import com.markethub.payment.repository.PaymentTransactionRepository;
import com.markethub.order.repository.OrderRepository;
import com.markethub.order.repository.SubOrderRepository;
import com.markethub.order.repository.OrderItemRepository;
import com.markethub.order.repository.OrderStatusHistoryRepository;
import com.markethub.order.repository.ReturnRequestRepository;
import com.markethub.inventory.repository.InventoryRepository;
import com.markethub.notification.service.NotificationService;
import com.markethub.vendor.repository.VendorRepository;
import com.markethub.admin.repository.SystemConfigRepository;
import com.markethub.admin.repository.CouponRepository;
import com.markethub.admin.service.CouponService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private SubOrderRepository subOrderRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private CartRepository cartRepository;
    @Mock
    private InventoryRepository inventoryRepository;
    @Mock
    private PaymentService paymentService;
    @Mock
    private PaymentTransactionRepository paymentTransactionRepository;
    @Mock
    private ObjectMapper objectMapper;
    @Mock
    private OrderStatusHistoryRepository orderStatusHistoryRepository;
    @Mock
    private ReturnRequestRepository returnRequestRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private VendorRepository vendorRepository;
    @Mock
    private SystemConfigRepository systemConfigRepository;
    @Mock
    private CouponService couponService;
    @Mock
    private CouponRepository couponRepository;

    @InjectMocks
    private OrderServiceImpl orderService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // Inject fake Razorpay key
        ReflectionTestUtils.setField(orderService, "razorpayKeyId", "rzp_test_12345");
    }

    @Test
    void createOrder_shouldPropagateRazorpayKey() throws Exception {
        // Arrange
        User user = new User();
        user.setId(UUID.randomUUID());

        Vendor vendor = new Vendor();
        vendor.setId(UUID.randomUUID());

        Product product = Product.builder()
                .id(UUID.randomUUID())
                .name("Test Product")
                .vendor(vendor)
                .basePrice(BigDecimal.valueOf(100))
                .status(ProductStatus.ACTIVE)
                .build();

        CartItem item = CartItem.builder()
                .product(product)
                .quantity(2)
                .price(BigDecimal.valueOf(100))
                .build();

        Cart cart = Cart.builder()
                .user(user)
                .items(new ArrayList<>(Collections.singletonList(item)))
                .totalAmount(BigDecimal.valueOf(200))
                .build();

        when(cartRepository.findByUserId(user.getId())).thenReturn(Optional.of(cart));
        when(orderRepository.save(any())).thenAnswer(i -> {
            com.markethub.order.entity.Order o = i.getArgument(0);
            o.setId(UUID.randomUUID());
            return o;
        });
        when(subOrderRepository.save(any())).thenAnswer(i -> i.getArgument(0)); // Return what is passed
        when(paymentService.createRazorpayOrder(any(), any(), any())).thenReturn("order_razorpay_abc");

        OrderRequest request = new OrderRequest();
        request.setPaymentMethod("ONLINE");

        // Act
        OrderResponse response = orderService.createOrder(user, request);

        // Assert
        assertNotNull(response);
        assertEquals("rzp_test_12345", response.getRazorpayKeyId()); // Verify key is passed
        assertEquals("order_razorpay_abc", response.getRazorpayOrderId());
        assertEquals(BigDecimal.valueOf(200), response.getGrandTotal());
        
        verify(paymentService).createRazorpayOrder(eq(BigDecimal.valueOf(200)), eq("INR"), any());
    }
}
