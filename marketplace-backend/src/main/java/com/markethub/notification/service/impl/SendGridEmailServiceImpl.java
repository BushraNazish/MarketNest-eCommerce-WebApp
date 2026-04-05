package com.markethub.notification.service.impl;

import com.markethub.notification.service.EmailService;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@Slf4j
public class SendGridEmailServiceImpl implements EmailService {

    @Value("${sendgrid.api-key:dummy}")
    private String apiKey;

    @Value("${sendgrid.from-email:noreply@markethub.com}")
    private String fromEmailConfig;

    @Value("${sendgrid.from-name:MarketHub}")
    private String fromName;

    @Override
    public void sendEmail(String to, String subject, String body) {
        if ("dummy".equals(apiKey) || apiKey.isEmpty()) {
            log.info("SendGrid API Key not set. Simulating email to {}. Subject: {}", to, subject);
            return;
        }

        Email from = new Email(fromEmailConfig, fromName);
        Email toEmail = new Email(to);
        Content content = new Content("text/html", body);
        Mail mail = new Mail(from, subject, toEmail, content);

        SendGrid sg = new SendGrid(apiKey);
        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);
            log.info("SendGrid Email sent to {} with status {}", to, response.getStatusCode());
        } catch (IOException ex) {
            log.error("Failed to send email via SendGrid to {}", to, ex);
        }
    }
}
