package com.medicore.common.security;

import com.medicore.common.exception.UnauthorizedException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Once-per-request JWT validation for downstream services.
 * Verifies the Bearer token cryptographically, then:
 *  - populates CurrentUser (ThreadLocal) for controller/service code
 *  - populates Spring's SecurityContext so @PreAuthorize/.authenticated() chains work
 *  - cross-checks gateway-forwarded X-User-Id header (defense in depth)
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    public static final String HEADER_USER_ID = "X-User-Id";
    public static final String HEADER_USER_EMAIL = "X-User-Email";
    public static final String HEADER_USER_ROLE = "X-User-Role";

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String header = request.getHeader("Authorization");
            String token = (header != null && header.startsWith("Bearer ")) ? header.substring(7) : null;

            if (token != null && jwtService.isTokenValid(token)) {
                Long userId = jwtService.extractUserId(token);
                String role = jwtService.extractRole(token);
                UserPrincipal principal = new UserPrincipal(userId, jwtService.extractUsername(token), role);

                CurrentUser.set(principal);

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        principal, token,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role)));
                SecurityContextHolder.getContext().setAuthentication(authentication);

                // Cross-check forwarded headers when present (defense in depth)
                String headerUserId = request.getHeader(HEADER_USER_ID);
                if (headerUserId != null && !String.valueOf(userId).equals(headerUserId)) {
                    throw new UnauthorizedException("Token identity mismatch");
                }
            }
            filterChain.doFilter(request, response);
        } finally {
            CurrentUser.clear();
            SecurityContextHolder.clearContext(); // no thread-local leakage across pooled threads
        }
    }
}
