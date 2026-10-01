package com.medicore.auth.service;

import com.medicore.auth.dto.AuthDtos.AuthResponse;
import com.medicore.auth.dto.AuthDtos.LoginRequest;
import com.medicore.auth.dto.AuthDtos.RegisterRequest;
import com.medicore.auth.dto.AuthDtos.UserResponse;
import com.medicore.auth.entity.Role;
import com.medicore.auth.entity.User;
import com.medicore.auth.repository.UserRepository;
import com.medicore.auth.security.JwtTokenProvider;
import com.medicore.common.exception.BadRequestException;
import com.medicore.common.exception.UnauthorizedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests with JUnit 5 + Mockito (no Spring context — fast, isolated).
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private User activeUser;

    @BeforeEach
    void setUp() {
        activeUser = new User();
        activeUser.setId(1L);
        activeUser.setEmail("patient@medicore.com");
        activeUser.setPassword("$2a$10$hash");
        activeUser.setRole(Role.PATIENT);
        activeUser.setActive(true);
    }

    @Test
    @DisplayName("register: hashes password with BCrypt and saves")
    void registerHashesPassword() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode("Patient@123")).thenReturn("$2a$10$encoded");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        authService.register(new RegisterRequest("patient@medicore.com", "Patient@123", Role.PATIENT));

        verify(userRepository).save(argThat(u -> "$2a$10$encoded".equals(u.getPassword())));
    }

    @Test
    @DisplayName("register: rejects duplicate email")
    void registerRejectsDuplicateEmail() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThrows(BadRequestException.class,
                () -> authService.register(new RegisterRequest("patient@medicore.com", "Patient@123", Role.PATIENT)));

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("register: rejects self-registered ADMIN")
    void registerRejectsAdminRole() {
        assertThrows(BadRequestException.class,
                () -> authService.register(new RegisterRequest("evil@medicore.com", "Password@1", Role.ADMIN)));
    }

    @Test
    @DisplayName("login: issues JWT for valid credentials")
    void loginIssuesToken() {
        when(userRepository.findByEmail("patient@medicore.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("Patient@123", "$2a$10$hash")).thenReturn(true);
        when(tokenProvider.generateToken(1L, "patient@medicore.com", "PATIENT")).thenReturn("jwt-token");

        AuthResponse response = authService.login(new LoginRequest("patient@medicore.com", "Patient@123"));

        assertEquals("jwt-token", response.token());
        assertEquals("PATIENT", response.role());
    }

    @Test
    @DisplayName("login: rejects wrong password")
    void loginRejectsWrongPassword() {
        when(userRepository.findByEmail("patient@medicore.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("wrong", "$2a$10$hash")).thenReturn(false);

        assertThrows(UnauthorizedException.class,
                () -> authService.login(new LoginRequest("patient@medicore.com", "wrong")));
    }

    @Test
    @DisplayName("login: rejects deactivated account even with correct password")
    void loginRejectsDeactivatedAccount() {
        activeUser.setActive(false);
        when(userRepository.findByEmail("patient@medicore.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("Patient@123", "$2a$10$hash")).thenReturn(true);

        assertThrows(UnauthorizedException.class,
                () -> authService.login(new LoginRequest("patient@medicore.com", "Patient@123")));
    }

    @Test
    @DisplayName("setStatus: deactivation sets flag and timestamp")
    void setStatusDeactivates() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(activeUser));

        UserResponse response = authService.setStatus(1L, false);

        assertFalse(response.active());
        assertFalse(activeUser.isActive());
        assertNotNull(activeUser.getDeactivatedAt());
    }

    @Test
    @DisplayName("setStatus: reactivation clears the deactivation timestamp")
    void setStatusReactivates() {
        activeUser.setActive(false);
        activeUser.setDeactivatedAt(java.time.LocalDateTime.now());
        when(userRepository.findById(1L)).thenReturn(Optional.of(activeUser));

        authService.setStatus(1L, true);

        assertTrue(activeUser.isActive());
        assertNull(activeUser.getDeactivatedAt());
    }

    @Test
    @DisplayName("listUsers: paginates and maps to response DTOs")
    void listUsersPaginates() {
        Page<User> page = new PageImpl<>(List.of(activeUser), PageRequest.of(0, 10), 1);
        when(userRepository.findAll(any(Pageable.class))).thenReturn(page);

        Page<UserResponse> result = authService.listUsers(null, 0, 10);

        assertEquals(1, result.getTotalElements());
        assertEquals("patient@medicore.com", result.getContent().get(0).email());
    }
}
