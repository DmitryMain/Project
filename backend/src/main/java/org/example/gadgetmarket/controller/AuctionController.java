package org.example.gadgetmarket.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.gadgetmarket.dto.BidRequest;
import org.example.gadgetmarket.dto.CreateAuctionRequest;
import org.example.gadgetmarket.model.Auction;
import org.example.gadgetmarket.model.Bid;
import org.example.gadgetmarket.model.Listing;
import org.example.gadgetmarket.repository.AuctionRepository;
import org.example.gadgetmarket.repository.ListingRepository;
import org.example.gadgetmarket.service.AuctionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auctions")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class AuctionController {
    private final AuctionRepository auctionRepository;
    private final ListingRepository listingRepository;
    private final AuctionService auctionService;

    @PostMapping
    public ResponseEntity<?> createAuction(@Valid @RequestBody CreateAuctionRequest request) {
        Listing listing = listingRepository.findById(request.listingId())
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));

        Auction auction = new Auction();
        auction.setListing(listing);
        auction.setCurrentPrice(request.startPrice());
        auction.setMinStep(request.minStep());
        auction.setEndAt(Instant.now().plusSeconds((long) request.durationMinutes() * 60L));

        return ResponseEntity.ok(auctionRepository.save(auction));
    }

    @GetMapping
    public List<Auction> all() {
        return auctionRepository.findAll();
    }

    @PostMapping("/{auctionId}/bids")
    public Bid bid(@PathVariable Long auctionId, @Valid @RequestBody BidRequest request) {
        return auctionService.placeBid(auctionId, request);
    }

    @GetMapping("/{auctionId}/bids")
    public List<Bid> history(@PathVariable Long auctionId) {
        return auctionService.history(auctionId);
    }
}