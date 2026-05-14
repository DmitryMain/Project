package org.example.gadgetmarket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.example.gadgetmarket.model.Category;
import org.springframework.web.multipart.MultipartFile;

public record CreateListingRequest(
        @NotNull Long sellerId,
        @NotBlank String title,
        @NotBlank String description,
        @NotNull Category category,
        MultipartFile photo
) {
}