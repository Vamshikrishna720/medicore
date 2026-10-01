package com.medicore.auth.controller;

import com.medicore.auth.dto.AuthDtos.UserResponse;
import com.medicore.auth.service.AuthService;
import com.medicore.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/**
 * Service-to-service endpoints (secured by InternalTokenFilter on /internal/**).
 * Kept separate from AuthController so Spring Security's permitAll rules stay simple.
 */
@RestController
public class AuthInternalController {

    private final AuthService authService;

    public AuthInternalController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/internal/users/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> internalStatus(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(authService.internalStatus(userId)));
    }
}
