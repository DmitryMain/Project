package org.example.gadgetmarket.service;

import lombok.RequiredArgsConstructor;
import org.example.gadgetmarket.model.Auction;
import org.example.gadgetmarket.repository.AuctionRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class AuctionFinalizer {
    private final AuctionRepository auctionRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // MVP: раз в секунду проверяем, какие аукционы пора завершать.
    @Scheduled(fixedDelay = 1000)
    public void finalizeEndedAuctions() {
        List<Auction> ended = auctionRepository.findByFinishedFalseAndEndAtLessThanEqual(Instant.now());
        if (ended.isEmpty()) return;

        for (Auction auction : ended) {
            auction.setFinished(true);
            auctionRepository.save(auction);

            // Отправляем два события: на общий событийный канал и на канал конкретного аукциона.
            messagingTemplate.convertAndSend("/topic/auctions/" + auction.getId(), auction);

            Map<String, Object> event = new HashMap<>();
            event.put("type", "AUCTION_FINISHED");
            event.put("auctionId", auction.getId());
            messagingTemplate.convertAndSend("/topic/events", (Object) event);
        }
    }
}

