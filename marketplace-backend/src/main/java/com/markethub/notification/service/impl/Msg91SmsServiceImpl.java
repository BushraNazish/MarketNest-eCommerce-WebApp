package com.markethub.notification.service.impl;

import com.markethub.notification.service.SmsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class Msg91SmsServiceImpl implements SmsService {

    @Value("${msg91.auth-key:dummy}")
    private String authKey;

    @Value("${msg91.sender-id:MKTHUB}")
    private String senderId;

    @Value("${msg91.route:4}")
    private String route;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public void sendSms(String to, String message) {
        if ("dummy".equals(authKey) || authKey.isEmpty()) {
            log.info("MSG91 Auth Key not set. Simulating SMS to {}. Message: {}", to, message);
            return;
        }

        try {
            String url = "https://control.msg91.com/api/v4/sms";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("authkey", authKey);

            Map<String, Object> body = new HashMap<>();
            body.put("sender", senderId);
            body.put("route", route);
            // Example simplified payload format, actual format depends on precise MSG91 iteration
            // We use simple DLT template/message structure.
            
            Map<String, Object> smsData = new HashMap<>();
            smsData.put("message", message);
            smsData.put("to", new String[]{to});
            
            body.put("sms", new Object[]{smsData});

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            
            restTemplate.exchange(url, HttpMethod.POST, request, String.class);
            log.info("MSG91 SMS sent to {}", to);
        } catch (Exception ex) {
            log.error("Failed to send SMS via MSG91 to {}", to, ex);
        }
    }
}
