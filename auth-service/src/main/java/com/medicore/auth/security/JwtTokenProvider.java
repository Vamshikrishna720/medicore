package com.medicore.auth.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Issues signed JWTs for authenticated users (jjwt 0.12.x fluent API).
 * Claims: sub=email, userId, role. HS256 with a configurable secret.
 */
@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long ttlMillis;

    public JwtTokenProvider(@Value("${medicore.jwt.secret}") String secret,
                            @Value("${medicore.jwt.ttl-minutes:60}") long ttlMinutes) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.ttlMillis = ttlMinutes * 60_000;
    }

    public String generateToken(Long userId, String email, String role) {
        Date now = new Date();
        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("role", role)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + ttlMillis))
                .signWith(key)
                .compact();
    }
}
