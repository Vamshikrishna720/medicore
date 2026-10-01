package com.medicore.common.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests (JUnit 5) for the shared JWT service.
 */
class JwtServiceTest {

    private static final String SECRET = "medicore-test-secret-key-that-is-long-enough-1234567890";
    private static final long TTL_MS = 60_000;

    private JwtService jwtService;
    private SecretKey signingKey;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET, 0);
        signingKey = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }

    private String buildToken(Long userId, String email, String role, long ttlMillis) {
        Date now = new Date();
        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("role", role)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + ttlMillis))
                .signWith(signingKey)
                .compact();
    }

    @Test
    @DisplayName("extracts userId, email and role from a signed token")
    void extractsClaims() {
        String token = buildToken(42L, "dr.house@medicore.com", "DOCTOR", TTL_MS);

        assertEquals(42L, jwtService.extractUserId(token));
        assertEquals("dr.house@medicore.com", jwtService.extractUsername(token));
        assertEquals("DOCTOR", jwtService.extractRole(token));
    }

    @Test
    @DisplayName("accepts a valid, unexpired token")
    void acceptsValidToken() {
        assertTrue(jwtService.isTokenValid(buildToken(1L, "a@b.c", "PATIENT", TTL_MS)));
    }

    @Test
    @DisplayName("rejects an expired token")
    void rejectsExpiredToken() {
        assertFalse(jwtService.isTokenValid(buildToken(1L, "a@b.c", "PATIENT", -1_000)));
    }

    @Test
    @DisplayName("rejects tokens signed with a different key")
    void rejectsForgedToken() {
        String forged = buildToken(1L, "a@b.c", "ADMIN", TTL_MS).substring(0, 0)
                + "not.a.jwt";
        assertFalse(jwtService.isTokenValid(forged));
    }

    @Test
    @DisplayName("rejects a token from a tampered payload")
    void rejectsTamperedToken() {
        String token = buildToken(1L, "a@b.c", "PATIENT", TTL_MS);
        String[] parts = token.split("\\.");
        String tampered = parts[0] + "." + parts[1] + "x." + parts[2];
        assertFalse(jwtService.isTokenValid(tampered));
    }
}
