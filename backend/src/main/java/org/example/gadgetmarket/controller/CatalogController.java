package org.example.gadgetmarket.controller;

import org.example.gadgetmarket.model.AppUser;
import org.example.gadgetmarket.model.Category;
import org.example.gadgetmarket.model.Listing;
import org.example.gadgetmarket.repository.AppUserRepository;
import org.example.gadgetmarket.repository.ListingRepository;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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

    @PostMapping(value = "/listings", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Listing createListing(
            @RequestParam("sellerId") Long sellerId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") Category category,
            @RequestParam("photo") MultipartFile photo) throws IOException {

        AppUser seller = appUserRepository.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("Seller not found"));

        // Save photo file to absolute path
        String uploadDir = System.getProperty("user.dir") + "/uploads";
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = UUID.randomUUID() + "_" + photo.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        photo.transferTo(filePath.toFile());

        Listing listing = new Listing();
        listing.setSeller(seller);
        listing.setTitle(title);
        listing.setDescription(description);
        listing.setCategory(category);
        listing.setPhotoPath("/uploads/" + fileName);
        return listingRepository.save(listing);
    }

    @GetMapping("/listings")
    public List<Listing> search(@RequestParam(required = false) String q,
                                @RequestParam(required = false) Category category) {
        // Only return approved listings to buyers
        if (q != null && !q.isBlank()) {
            return listingRepository.findByTitleContainingIgnoreCase(q).stream()
                    .filter(Listing::isApproved)
                    .collect(Collectors.toList());
        }
        if (category != null) {
            return listingRepository.findByCategory(category).stream()
                    .filter(Listing::isApproved)
                    .collect(Collectors.toList());
        }
        return listingRepository.findByApprovedTrue();
    }
}