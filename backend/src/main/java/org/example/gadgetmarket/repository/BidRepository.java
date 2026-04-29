package org.example.gadgetmarket.repository;

import org.example.gadgetmarket.model.Bid;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByAuctionIdOrderByCreatedAtDesc(Long auctionId);
}
