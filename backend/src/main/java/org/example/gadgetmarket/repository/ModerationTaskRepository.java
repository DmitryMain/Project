package org.example.gadgetmarket.repository;

import org.example.gadgetmarket.model.ModerationTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ModerationTaskRepository extends JpaRepository<ModerationTask, Long> {
    @Query("SELECT t.listing.id FROM ModerationTask t")
    List<Long> findAllModeratedListingIds();
}
