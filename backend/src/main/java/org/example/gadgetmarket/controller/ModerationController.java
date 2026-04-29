package org.example.gadgetmarket.controller;

import lombok.RequiredArgsConstructor;
import org.example.gadgetmarket.model.Listing;
import org.example.gadgetmarket.model.ModerationTask;
import org.example.gadgetmarket.repository.ListingRepository;
import org.example.gadgetmarket.repository.ModerationTaskRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/moderation")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ModerationController {
    private final ListingRepository listingRepository;
    private final ModerationTaskRepository moderationTaskRepository;

    @PostMapping("/listings/{listingId}/photo-check")
    public ModerationTask moderatePhoto(@PathVariable Long listingId,
                                        @RequestParam(defaultValue = "false") boolean forbiddenContent,
                                        @RequestParam(defaultValue = "true") boolean imageQualityOk,
                                        @RequestParam(defaultValue = "true") boolean categoryMatch) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        ModerationTask task = new ModerationTask();
        task.setListing(listing);
        task.setForbiddenContent(forbiddenContent);
        task.setImageQualityOk(imageQualityOk);
        task.setCategoryMatch(categoryMatch);
        task.setBlocked(forbiddenContent || !imageQualityOk || !categoryMatch);
        listing.setApproved(!task.isBlocked());
        listingRepository.save(listing);
        return moderationTaskRepository.save(task);
    }

    @GetMapping("/tasks")
    public List<ModerationTask> tasks() {
        return moderationTaskRepository.findAll();
    }
}
