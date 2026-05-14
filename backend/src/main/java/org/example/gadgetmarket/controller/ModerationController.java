package org.example.gadgetmarket.controller;

import lombok.RequiredArgsConstructor;
import org.example.gadgetmarket.model.Listing;
import org.example.gadgetmarket.model.ModerationTask;
import org.example.gadgetmarket.repository.ListingRepository;
import org.example.gadgetmarket.repository.ModerationTaskRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/moderation")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ModerationController {
    private final ListingRepository listingRepository;
    private final ModerationTaskRepository moderationTaskRepository;

    @PostMapping("/listings/{listingId}/approve")
    public ResponseEntity<?> approveListing(@PathVariable Long listingId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));

        listing.setApproved(true);
        listingRepository.save(listing);

        // Create a moderation task marking it as approved
        ModerationTask task = new ModerationTask();
        task.setListing(listing);
        task.setForbiddenContent(false);
        task.setImageQualityOk(true);
        task.setCategoryMatch(true);
        task.setBlocked(false);
        moderationTaskRepository.save(task);

        return ResponseEntity.ok(Map.of("message", "Лот одобрен", "listingId", listingId));
    }

    @PostMapping("/listings/{listingId}/reject")
    public ResponseEntity<?> rejectListing(@PathVariable Long listingId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));

        // Optionally mark as not approved (or you can delete)
        listing.setApproved(false);
        listingRepository.save(listing);

        ModerationTask task = new ModerationTask();
        task.setListing(listing);
        task.setForbiddenContent(true);
        task.setImageQualityOk(false);
        task.setCategoryMatch(false);
        task.setBlocked(true);
        moderationTaskRepository.save(task);

        return ResponseEntity.ok(Map.of("message", "Лот отклонён", "listingId", listingId));
    }

    @GetMapping("/listings/pending")
    public List<Listing> pendingListings() {
        List<Long> moderatedIds = moderationTaskRepository.findAllModeratedListingIds();
        return listingRepository.findByApproved(false).stream()
                .filter(l -> !moderatedIds.contains(l.getId()))
                .collect(Collectors.toList());
    }

    @GetMapping("/tasks")
    public List<ModerationTask> tasks() {
        return moderationTaskRepository.findAll();
    }
}