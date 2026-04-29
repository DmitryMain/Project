package org.example.gadgetmarket.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.example.gadgetmarket.model.UserRole;

public record CreateUserRequest(
        @Email String email,
        @NotBlank String password,
        @NotBlank String displayName,
        UserRole role
) {
}
