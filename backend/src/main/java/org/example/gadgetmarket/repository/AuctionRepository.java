package org.example.gadgetmarket.repository;

import org.example.gadgetmarket.model.Auction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;

public interface AuctionRepository extends JpaRepository<Auction, Long> {
    java.util.List<Auction> findByFinishedFalseAndEndAtLessThanEqual(Instant now);
}
