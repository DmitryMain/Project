package org.example.gadgetmarket.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class NotificationController {
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping("/email")
    public Map<String, String> email(@RequestParam String to, @RequestParam String subject) {
        return Map.of("status", "queued", "to", to, "subject", subject);
    }

    @MessageMapping("/events")
    public void publish(@Payload Map<String, Object> payload) {
        messagingTemplate.convertAndSend("/topic/events", (Object) payload);
    }
}
