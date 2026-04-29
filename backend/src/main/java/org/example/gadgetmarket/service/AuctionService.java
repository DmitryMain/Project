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
import java.util.List;

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
        if (auction.isFinished() || auction.getEndAt().isBefore(Instant.now())) {
            throw new IllegalStateException("Auction is finished");
        }
        BigDecimal minimumAccepted = auction.getCurrentPrice().add(auction.getMinStep());
        if (request.amount().compareTo(minimumAccepted) < 0) {
            throw new IllegalArgumentException("Bid must be >= current + min step");
        }

        AppUser bidder = appUserRepository.findById(request.bidderId())
                .orElseThrow(() -> new IllegalArgumentException("Bidder not found"));

        Bid bid = new Bid();
        bid.setAuction(auction);
        bid.setBidder(bidder);
        bid.setAmount(request.amount());
        bid.setAutoBidLimit(request.autoBidLimit());
        bid = bidRepository.save(bid);

        auction.setCurrentPrice(request.amount());
        auction.setLeader(bidder);
        auctionRepository.save(auction);

        messagingTemplate.convertAndSend("/topic/auctions/" + auctionId, auction);
        return bid;
    }

    public List<Bid> history(Long auctionId) {
        return bidRepository.findByAuctionIdOrderByCreatedAtDesc(auctionId);
    }
}
