package com.medicore.doctor.dto;

import com.medicore.doctor.entity.Doctor;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalTime;

public final class DoctorDtos {

    private DoctorDtos() {
    }

    public record DoctorRequest(
            @NotBlank @Size(max = 100) String fullName,
            @NotBlank @Size(max = 80) String specialization,
            @Size(max = 300) String bio,
            @NotNull @DecimalMin("0.00") @Digits(integer = 6, fraction = 2) BigDecimal consultationFee,
            @Min(0) @Max(60) int experienceYears,
            @Size(max = 15) String phone,
            @NotNull LocalTime availableFrom,
            @NotNull LocalTime availableTo) {
    }

    public record DoctorResponse(
            Long id,
            Long userId,
            String fullName,
            String specialization,
            String bio,
            BigDecimal consultationFee,
            int experienceYears,
            String phone,
            String availableFrom,
            String availableTo,
            boolean available,
            boolean active) {

        public static DoctorResponse from(Doctor d) {
            return new DoctorResponse(
                    d.getId(), d.getUserId(), d.getFullName(), d.getSpecialization(), d.getBio(),
                    d.getConsultationFee(), d.getExperienceYears(), d.getPhone(),
                    d.getAvailableFrom() == null ? null : d.getAvailableFrom().toString(),
                    d.getAvailableTo() == null ? null : d.getAvailableTo().toString(),
                    d.isAvailable(), d.isActive());
        }
    }
}
