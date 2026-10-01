package com.medicore.auth.config;

import com.medicore.auth.entity.Role;
import com.medicore.auth.entity.User;
import com.medicore.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Seeds a default admin and one demo doctor so the system is usable immediately.
 * Passwords below are BCrypt hashes of the plain values documented in the README.
 */
@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedUsers(UserRepository userRepository, BCryptPasswordEncoder encoder) {
        return args -> {
            if (userRepository.count() > 0) {
                return;
            }
            User admin = new User();
            admin.setEmail("admin@medicore.com");
            admin.setPassword(encoder.encode("Admin@123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);

            User doctor = new User();
            doctor.setEmail("doctor@medicore.com");
            doctor.setPassword(encoder.encode("Doctor@123"));
            doctor.setRole(Role.DOCTOR);
            userRepository.save(doctor);

            User patient = new User();
            patient.setEmail("patient@medicore.com");
            patient.setPassword(encoder.encode("Patient@123"));
            patient.setRole(Role.PATIENT);
            userRepository.save(patient);
        };
    }
}
