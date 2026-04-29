package org.example.gadgetmarket.controller;

import lombok.RequiredArgsConstructor;
import org.example.gadgetmarket.dto.CreateUserRequest;
import org.example.gadgetmarket.model.AppUser;
import org.example.gadgetmarket.model.VerificationStatus;
import org.example.gadgetmarket.repository.AppUserRepository;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class HelloController {
    private final AppUserRepository appUserRepository;

    @PostMapping("/register")
    public AppUser register(@Valid @RequestBody CreateUserRequest request) {
        AppUser user = new AppUser();
        user.setEmail(request.email());
        user.setPasswordHash("{noop}" + request.password());
        user.setDisplayName(request.displayName());
        user.setRole(request.role());
        return appUserRepository.save(user);
    }

    @PostMapping("/{id}/verify-email")
    public AppUser verifyEmail(@PathVariable Long id) {
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setVerificationStatus(VerificationStatus.VERIFIED);
        return appUserRepository.save(user);
    }

    @GetMapping
    public List<AppUser> users() {
        return appUserRepository.findAll();
    }
}