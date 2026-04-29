package org.example.gadgetmarket.repository;

import org.example.gadgetmarket.model.Category;
import org.example.gadgetmarket.model.Listing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ListingRepository extends JpaRepository<Listing, Long> {
    List<Listing> findByCategory(Category category);

    List<Listing> findByTitleContainingIgnoreCase(String query);
}
