package com.medicore.auth.controller;

import com.medicore.auth.dto.AuthDtos.AuthResponse;
import com.medicore.auth.dto.AuthDtos.LoginRequest;
import com.medicore.auth.dto.AuthDtos.RegisterRequest;
import com.medicore.auth.dto.AuthDtos.StatusUpdateRequest;
import com.medicore.auth.dto.AuthDtos.UserResponse;
import com.medicore.auth.service.AuthService;
import com.medicore.common.dto.ApiResponse;
import com.medicore.common.dto.PageResponse;
import com.medicore.common.security.CurrentUser;
import com.medicore.common.security.JwtAuthenticationFilter;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Auth endpoints. Identity for protected endpoints comes from the JWT-filtered
 * SecurityContext-independent CurrentUser (set by JwtAuthenticationFilter).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Registration successful", authService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Login successful", authService.login(request)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(
            @RequestAttribute(value = "userId", required = false) Long attrUserId,
            @RequestHeader(value = JwtAuthenticationFilter.HEADER_USER_ID, required = false) String headerUserId) {
        Long userId = resolveUserId(attrUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok(authService.getById(userId)));
    }

    /** Self-deactivation (soft delete) — the account can be restored by an admin. */
    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deactivateMe(
            @RequestAttribute(value = "userId", required = false) Long attrUserId,
            @RequestHeader(value = JwtAuthenticationFilter.HEADER_USER_ID, required = false) String headerUserId) {
        Long userId = resolveUserId(attrUserId, headerUserId);
        authService.deactivate(userId);
        return ResponseEntity.ok(ApiResponse.ok("Account deactivated", null));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> listUsers(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var result = authService.listUsers(search, page, Math.min(size, 100));
        return ResponseEntity.ok(ApiResponse.ok(new PageResponse<>(
                result.getContent(), result.getNumber(), result.getSize(),
                result.getTotalElements(), result.getTotalPages())));
    }

    /** ADMIN-only activation/deactivation of any account. */
    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse<UserResponse>> setStatus(
            @PathVariable Long userId,
            @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                request.active() ? "Account activated" : "Account deactivated",
                authService.setStatus(userId, request.active())));
    }

    private Long resolveUserId(Long attrUserId, String headerUserId) {
        if (attrUserId != null) return attrUserId;
        if (CurrentUser.get() != null) return CurrentUser.get().userId();
        if (headerUserId != null) return Long.parseLong(headerUserId);
        throw new com.medicore.common.exception.UnauthorizedException("Authentication required");
    }
}
