package org.example.gadgetmarket.controller;

import lombok.extern.slf4j.Slf4j;
import org.example.gadgetmarket.dto.CreateListingRequest;
import org.example.gadgetmarket.model.AppUser;
import org.example.gadgetmarket.model.Category;
import org.example.gadgetmarket.model.Listing;
import org.example.gadgetmarket.model.ListingPhoto;
import org.example.gadgetmarket.repository.AppUserRepository;
import org.example.gadgetmarket.repository.ListingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/catalog")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@Slf4j
public class CatalogController {
    private final ListingRepository listingRepository;
    private final AppUserRepository appUserRepository;

    public CatalogController(ListingRepository listingRepository, AppUserRepository appUserRepository) {
        this.listingRepository = listingRepository;
        this.appUserRepository = appUserRepository;
    }

    @PreAuthorize("hasRole('STAFF')")
    @PostMapping("/listings")
    public ResponseEntity<Listing> createListing(@RequestBody CreateListingRequest request) throws IOException {
        log.info("Creating listing: sellerEmail={}, title={}, photos={}", 
                request.getSellerEmail(), request.getTitle(), request.getPhotos() != null ? request.getPhotos().size() : 0);

        AppUser seller = appUserRepository.findByEmail(request.getSellerEmail())
                .orElseThrow(() -> new IllegalArgumentException("Seller not found: " + request.getSellerEmail()));

        AppUser createdBy = appUserRepository.findById(request.getCreatedBy())
                .orElseThrow(() -> new IllegalArgumentException("Staff user not found"));

        String uploadDir = System.getProperty("user.dir") + "/gadgetMarket/uploads";
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Listing listing = new Listing();
        listing.setSeller(seller);
        listing.setCreatedBy(createdBy);
        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setCategory(request.getCategory());

        List<String> photos = request.getPhotos() != null ? request.getPhotos() : List.of();
        if (photos.size() > 5) {
            throw new IllegalArgumentException("Максимум 5 фотографий на товар");
        }
        for (int i = 0; i < photos.size(); i++) {
            String photoData = photos.get(i);
            log.info("Processing photo {}: length={}", i, photoData.length());
            
            String base64Data = photoData.contains(",") ? photoData.split(",")[1] : photoData;
            byte[] bytes = Base64.getDecoder().decode(base64Data);

            String ext = "jpg";
            if (photoData.contains("png")) ext = "png";
            else if (photoData.contains("webp")) ext = "webp";
            else if (photoData.contains("gif")) ext = "gif";

            String fileName = UUID.randomUUID() + "_" + i + "." + ext;
            Path filePath = uploadPath.resolve(fileName);
            Files.write(filePath, bytes);
            log.info("Saved photo: {}", fileName);

            ListingPhoto listingPhoto = new ListingPhoto();
            listingPhoto.setListing(listing);
            listingPhoto.setPhotoPath("/uploads/" + fileName);
            listingPhoto.setSortOrder(i);
            listing.getPhotos().add(listingPhoto);
        }

        Listing saved = listingRepository.save(listing);
        log.info("Listing saved with id={}", saved.getId());
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/listings")
    public List<Listing> search(@RequestParam(required = false) String q,
                                @RequestParam(required = false) Category category) {
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
