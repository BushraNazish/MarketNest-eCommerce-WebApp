package com.markethub.notification.service;

public interface SmsService {
    void sendSms(String to, String message);
}
