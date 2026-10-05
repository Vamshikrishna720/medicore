package com.medicore.auth.dto;

import com.medicore.auth.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTOs as Java records (immutable, concise — ES6-destructuring-like ergonomics in Java).
 */
public final class AuthDtos {

    private AuthDtos() {
    }

    public record RegisterRequest(
            @NotBlank @Email @Size(max = 120) String email,
            @NotBlank @Size(min = 8, max = 72) String password,
            @NotNull Role role) {
    }

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password) {
    }

    public record AuthResponse(
            Long userId,
            String email,
            String role,
            String token,
            String tokenType) {
    }

    public record UserResponse(
            Long id,
            String email,
            String role,
            boolean active,
            String createdAt) {
    }

    public record StatusUpdateRequest(
            @NotNull Boolean active) {
    }
}
