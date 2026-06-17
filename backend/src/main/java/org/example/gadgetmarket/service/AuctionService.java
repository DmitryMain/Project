package org.example.gadgetmarket.service;

import lombok.RequiredArgsConstructor;
import org.example.gadgetmarket.dto.BidRequest;
import org.example.gadgetmarket.model.AppUser;
import org.example.gadgetmarket.model.Auction;
import org.example.gadgetmarket.model.Bid;
import org.example.gadgetmarket.repository.AppUserRepository;
import org.example.gadgetmarket.repository.AuctionRepository;
import org.example.gadgetmarket.repository.BidRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuctionService {
    private final AuctionRepository auctionRepository;
    private final AppUserRepository appUserRepository;
    private final BidRepository bidRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public Bid placeBid(Long auctionId, BidRequest request) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new IllegalArgumentException("Auction not found"));
        
        if (!auction.getListing().isApproved()) {
            throw new IllegalStateException("Лот ещё не прошёл модерацию. Ставки невозможны до одобрения администратором.");
        }
        
        if (auction.isFinished() || auction.getEndAt().isBefore(Instant.now())) {
            throw new IllegalStateException("Auction is finished");
        }

        // Нельзя перебить свою ставку — лидер не может повысить ставку сам на себя
        AppUser bidder = appUserRepository.findById(request.bidderId())
                .orElseThrow(() -> new IllegalArgumentException("Bidder not found"));

        if (auction.getLeader() != null && auction.getLeader().getId().equals(bidder.getId())) {
            throw new IllegalArgumentException("Вы уже лидер аукциона. Ждите ставок других участников.");
        }

        BigDecimal minimumAccepted = auction.getCurrentPrice().add(auction.getMinStep());
        if (request.amount().compareTo(minimumAccepted) < 0) {
            throw new IllegalArgumentException("Bid must be >= current + min step");
        }

        // Продление таймера: если осталось меньше 30 секунд — увеличить до 30
        Instant now = Instant.now();
        Instant endAt = auction.getEndAt();
        Instant newEndAt = endAt;
        if (endAt.isAfter(now) && endAt.minusSeconds(30).isBefore(now)) {
            newEndAt = now.plusSeconds(30);
            auction.setEndAt(newEndAt);
        }

        Bid bid = new Bid();
        bid.setAuction(auction);
        bid.setBidder(bidder);
        bid.setAmount(request.amount());
        bid.setAutoBidLimit(request.autoBidLimit());
        bid = bidRepository.save(bid);

        AppUser previousLeader = auction.getLeader();

        auction.setCurrentPrice(request.amount());
        auction.setLeader(bidder);
        auctionRepository.save(auction);

        messagingTemplate.convertAndSend("/topic/auctions/" + auctionId, auction);

        if (previousLeader != null && !previousLeader.getId().equals(bidder.getId())) {
            Map<String, Object> outbidEvent = new HashMap<>();
            outbidEvent.put("type", "OUTBID");
            outbidEvent.put("auctionId", auction.getId());
            outbidEvent.put("auctionTitle", auction.getListing().getTitle());
            outbidEvent.put("newPrice", request.amount());
            messagingTemplate.convertAndSend("/topic/events", (Object) outbidEvent);
        }

        return bid;
    }

    public List<Bid> history(Long auctionId) {
        return bidRepository.findByAuctionIdOrderByCreatedAtDesc(auctionId);
    }
}
