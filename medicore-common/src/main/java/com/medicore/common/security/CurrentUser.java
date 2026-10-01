package com.medicore.common.security;

/**
 * ThreadLocal-based identity holder (multithreading-aware: each pooled worker
 * thread sees only its own request's identity; always cleared in the filter's finally).
 */
public final class CurrentUser {

    private static final ThreadLocal<UserPrincipal> CONTEXT = new ThreadLocal<>();

    private CurrentUser() {
    }

    public static void set(UserPrincipal principal) {
        CONTEXT.set(principal);
    }

    public static UserPrincipal get() {
        return CONTEXT.get();
    }

    public static Long requireUserId() {
        UserPrincipal principal = CONTEXT.get();
        if (principal == null) {
            throw new com.medicore.common.exception.UnauthorizedException("Authentication required");
        }
        return principal.userId();
    }

    public static String requireRole() {
        UserPrincipal principal = CONTEXT.get();
        if (principal == null) {
            throw new com.medicore.common.exception.UnauthorizedException("Authentication required");
        }
        return principal.role();
    }

    public static boolean hasRole(String role) {
        UserPrincipal principal = CONTEXT.get();
        return principal != null && role.equals(principal.role());
    }

    public static void clear() {
        CONTEXT.remove();
    }
}
