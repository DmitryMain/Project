package org.example.gadgetmarket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.example.gadgetmarket.model.Category;

import java.util.List;

@Data
public class CreateListingRequest {
    @NotBlank
    private String sellerEmail;

    @NotNull
    private Long createdBy;

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotNull
    private Category category;

    private List<String> photos;
}
