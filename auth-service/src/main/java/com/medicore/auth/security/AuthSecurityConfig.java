package com.medicore.auth.security;

import com.medicore.common.security.InternalTokenFilter;
import com.medicore.common.security.JwtAuthenticationFilter;
import com.medicore.common.security.JwtService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * auth-service security chain. The JWT filter runs INSIDE the security chain
 * (addFilterBefore) so the SecurityContext it populates is the one Spring
 * Security's authorization actually evaluates — registering it only as a plain
 * servlet filter would be silently reset by SecurityContextHolderFilter.
 */
@Configuration
@EnableWebSecurity
public class AuthSecurityConfig {

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   JwtService jwtService,
                                                   InternalTokenFilter internalTokenFilter) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // register/login are public; /internal/** is guarded by InternalTokenFilter;
                        // everything else requires a valid JWT
                        .requestMatchers("/api/auth/register", "/api/auth/login", "/actuator/health").permitAll()
                        .requestMatchers("/internal/**").permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(internalTokenFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(new JwtAuthenticationFilter(jwtService), InternalTokenFilter.class);
        return http.build();
    }
}
