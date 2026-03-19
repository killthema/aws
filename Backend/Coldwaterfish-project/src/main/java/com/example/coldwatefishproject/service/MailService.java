package com.example.coldwatefishproject.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value; // [추가]
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    // [작동]: application.properties에 설정한 이메일 주소를 자동으로 가져옵니다.
    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendEmail(String toEmail, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);

        // [수정]: 하드코딩된 주소 대신 설정된 주소를 사용합니다.
        message.setFrom(fromEmail);

        try {
            mailSender.send(message);
            System.out.println("이메일 발송 성공: " + toEmail);
        } catch (Exception e) {
            System.err.println(" 이메일 발송 실패: " + e.getMessage());
        }
    }
}