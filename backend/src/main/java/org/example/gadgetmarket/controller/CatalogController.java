package org.example.gadgetmarket.controller;

import jakarta.validation.Valid;
import org.example.gadgetmarket.dto.CreateListingRequest;
import org.example.gadgetmarket.model.AppUser;
import org.example.gadgetmarket.model.Category;
import org.example.gadgetmarket.model.Listing;
import org.example.gadgetmarket.repository.AppUserRepository;
import org.example.gadgetmarket.repository.ListingRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalog")
@CrossOrigin(origins = "http://localhost:3000")
public class CatalogController {
    private final ListingRepository listingRepository;
    private final AppUserRepository appUserRepository;

    public CatalogController(ListingRepository listingRepository, AppUserRepository appUserRepository) {
        this.listingRepository = listingRepository;
        this.appUserRepository = appUserRepository;
    }

    @PostMapping("/listings")
    public Listing createListing(@Valid @RequestBody CreateListingRequest request) {
        AppUser seller = appUserRepository.findById(request.sellerId())
                .orElseThrow(() -> new IllegalArgumentException("Seller not found"));
        Listing listing = new Listing();
        listing.setSeller(seller);
        listing.setTitle(request.title());
        listing.setDescription(request.description());
        listing.setCategory(request.category());
        listing.setPhotoUrl(request.photoUrl());
        return listingRepository.save(listing);
    }

    @GetMapping("/listings")
    public List<Listing> search(@RequestParam(required = false) String q,
                                @RequestParam(required = false) Category category) {
        if (q != null && !q.isBlank()) {
            return listingRepository.findByTitleContainingIgnoreCase(q);
        }
        if (category != null) {
            return listingRepository.findByCategory(category);
        }
        return listingRepository.findAll();
    }
}
