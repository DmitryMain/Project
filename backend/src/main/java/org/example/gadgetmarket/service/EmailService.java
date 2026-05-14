package org.example.gadgetmarket.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Email notification service.
 * 
 * Currently logs all email notifications to the console.
 * 
 * To send real emails:
 * 1. Add spring-boot-starter-mail dependency to pom.xml
 * 2. Configure spring.mail.* properties in application.properties
 * 3. Replace this implementation with a JavaMailSender-based one
 */
@Service
@Slf4j
public class EmailService {

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

        logEmail(toEmail, subject, body);
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

        logEmail(toEmail, subject, body);
    }

    private void logEmail(String to, String subject, String body) {
        log.info("""
                                
                ╔══════════════════════════════════════════════════╗
                ║                EMAIL NOTIFICATION               ║
                ╠══════════════════════════════════════════════════╣
                ║ To:      {}
                ║ Subject: {}
                ║──────────────────────────────────────────────────║
                ║ {}
                ╚══════════════════════════════════════════════════╝""",
                to, subject, body);
    }
}