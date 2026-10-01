package com.medicore.common.security;

/**
 * Immutable identity of the authenticated caller (Java record — concise immutable data carrier).
 */
public record UserPrincipal(Long userId, String email, String role) {
}
