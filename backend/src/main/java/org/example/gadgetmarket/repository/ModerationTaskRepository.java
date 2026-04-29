package org.example.gadgetmarket.repository;

import org.example.gadgetmarket.model.ModerationTask;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ModerationTaskRepository extends JpaRepository<ModerationTask, Long> {
}
