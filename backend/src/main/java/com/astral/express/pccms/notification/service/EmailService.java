package com.astral.express.pccms.notification.service;

public interface EmailService {
    void sendAccountCreatedEmail(String toEmail, String temporaryPassword);

    void sendTemporaryPasswordEmail(String toEmail, String temporaryPassword);

    void sendOtpEmail(String toEmail, String purpose, String otp);
}
