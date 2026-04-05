package com.markethub.payment.service;

import com.markethub.order.entity.Order;
import com.markethub.payment.entity.PaymentTransaction;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public interface PaymentService {
    String createRazorpayOrder(BigDecimal amount, String currency, String receipt) throws Exception;
    boolean verifySignature(String orderId, String paymentId, String signature) throws Exception;
    PaymentTransaction createTransaction(Order order, String gatewayOrderId);
    void updateTransactionStatus(String gatewayOrderId, String paymentId, String status, String signature);
}
