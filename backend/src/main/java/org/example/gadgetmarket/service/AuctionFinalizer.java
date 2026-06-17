package org.example.gadgetmarket.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.gadgetmarket.model.AppUser;
import org.example.gadgetmarket.model.Auction;
import org.example.gadgetmarket.model.Listing;
import org.example.gadgetmarket.repository.AuctionRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuctionFinalizer {
    private final AuctionRepository auctionRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final EmailService emailService;


    @Scheduled(fixedDelayString = "${app.auctions.finalizer.delay-ms:5000}")
    @Transactional
    public void finalizeEndedAuctions() {
        List<Auction> ended = auctionRepository.findByFinishedFalseAndEndAtLessThanEqual(Instant.now());
        if (ended.isEmpty()) return;

        log.info("Finalizing {} ended auctions", ended.size());
        ended.forEach(a -> a.setFinished(true));
        auctionRepository.saveAll(ended);

        for (Auction auction : ended) {
            log.info("Auction {} finalized at {}", auction.getId(), Instant.now());
            messagingTemplate.convertAndSend("/topic/auctions/" + auction.getId(), auction);

            Map<String, Object> event = new HashMap<>();
            event.put("type", "AUCTION_FINISHED");
            event.put("auctionId", auction.getId());
            event.put("auctionTitle", auction.getListing().getTitle());
            messagingTemplate.convertAndSend("/topic/events", (Object) event);

            AppUser winner = auction.getLeader();
            Listing listing = auction.getListing();
            AppUser seller = listing.getSeller();

            if (winner != null) {
                double finalPrice = auction.getCurrentPrice().doubleValue();
                emailService.sendAuctionWinnerNotification(
                        winner.getEmail(),
                        winner.getDisplayName(),
                        listing.getTitle(),
                        finalPrice
                );

                emailService.sendSellerNotification(
                        seller.getEmail(),
                        seller.getDisplayName(),
                        listing.getTitle(),
                        finalPrice,
                        winner.getDisplayName()
                );

                log.info("Emails sent for auction {}: winner={}, seller={}",
                        auction.getId(), winner.getEmail(), seller.getEmail());
            } else {
                log.info("Auction {} ended without a winner", auction.getId());
            }
        }
    }
}
