package org.example.gadgetmarket.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:no-reply@gadgetmarket.local}")
    private String from;

    public void sendAuctionWinnerNotification(String toEmail, String displayName,
                                               String listingTitle, Double finalPrice) {
        String subject = "🎉 Вы выиграли аукцион!";
        String body = String.format("""
                Здравствуйте, %s!
                
                Поздравляем! Вы выиграли аукцион на товар "%s".
                Цена: %.2f ₽
                
                Пожалуйста, свяжитесь с продавцом для оформления покупки.
                
                С уважением,
                Команда GadgetMarket
                """, displayName, listingTitle, finalPrice);

        sendEmail(toEmail, subject, body);
    }

    public void sendSellerNotification(String toEmail, String displayName,
                                        String listingTitle, Double finalPrice, String winnerName) {
        String subject = "💰 Ваш аукцион завершён!";
        String body = String.format("""
                Здравствуйте, %s!
                
                Ваш аукцион на товар "%s" завершён.
                Победитель: %s
                Цена: %.2f ₽
                
                Пожалуйста, свяжитесь с покупателем для оформления продажи.
                
                С уважением,
                Команда GadgetMarket
                """, displayName, listingTitle, winnerName, finalPrice);

        sendEmail(toEmail, subject, body);
    }

    private void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        try {
            mailSender.send(message);
            log.info("Email sent to {}: subject='{}'", to, subject);
        } catch (MailException e) {
            log.warn("Failed to send email to {}: {}. Email content logged below.", to, e.getMessage());
            log.info("EMAIL -> To: {}, Subject: {}, Body:\n{}", to, subject, text);
        } catch (Exception e) {
            log.error("Unexpected error sending email to {}: {}", to, e.getMessage());
            log.info("EMAIL -> To: {}, Subject: {}, Body:\n{}", to, subject, text);
        }
    }
}