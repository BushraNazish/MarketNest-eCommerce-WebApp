package com.markethub.payment.service.impl;

import com.markethub.order.entity.Order;
import com.markethub.payment.entity.PaymentTransaction;
import com.markethub.payment.enums.TransactionStatus;
import com.markethub.payment.repository.PaymentTransactionRepository;
import com.markethub.payment.service.PaymentService;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private RazorpayClient razorpayClient;

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    @Override
    public String createRazorpayOrder(BigDecimal amount, String currency, String receipt) throws Exception {
        JSONObject options = new JSONObject();
        // Amount is in paise (subunit), so multiply by 100
        options.put("amount", amount.multiply(BigDecimal.valueOf(100)).intValue());
        options.put("currency", currency);
        options.put("receipt", receipt); // Usually our local order number

        com.razorpay.Order order = razorpayClient.orders.create(options);
        return order.get("id");
    }

    @Override
    public boolean verifySignature(String orderId, String paymentId, String signature) throws Exception {
        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", orderId);
        options.put("razorpay_payment_id", paymentId);
        options.put("razorpay_signature", signature);

        return Utils.verifyPaymentSignature(options, keySecret);
    }

    @Override
    @Transactional
    public PaymentTransaction createTransaction(Order order, String gatewayOrderId) {
        PaymentTransaction transaction = PaymentTransaction.builder()
                .order(order)
                .gateway("RAZORPAY")
                .gatewayOrderId(gatewayOrderId)
                .amount(order.getGrandTotal())
                .currency(order.getCurrency())
                .status(TransactionStatus.CREATED)
                .build();
        return paymentTransactionRepository.save(transaction);
    }

    @Override
    @Transactional
    public void updateTransactionStatus(String gatewayOrderId, String paymentId, String status, String signature) {
        Optional<PaymentTransaction> transactionOpt = paymentTransactionRepository.findByGatewayOrderId(gatewayOrderId);
        if (transactionOpt.isPresent()) {
            PaymentTransaction transaction = transactionOpt.get();
            transaction.setGatewayPaymentId(paymentId);
            transaction.setGatewaySignature(signature);
            if ("PAID".equalsIgnoreCase(status)) {
                transaction.setStatus(TransactionStatus.CAPTURED);
            } else if ("FAILED".equalsIgnoreCase(status)) {
                transaction.setStatus(TransactionStatus.FAILED);
            }
            paymentTransactionRepository.save(transaction);
        }
    }
}
