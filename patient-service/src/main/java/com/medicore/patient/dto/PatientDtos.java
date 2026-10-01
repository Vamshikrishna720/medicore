package com.medicore.patient.dto;

import com.medicore.patient.entity.Patient;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public final class PatientDtos {

    private PatientDtos() {
    }

    public record PatientRequest(
            @NotBlank @Size(max = 100) String fullName,
            LocalDate dateOfBirth,
            Patient.Gender gender,
            @Size(max = 15) String phone,
            @Size(max = 255) String address,
            @Size(max = 40) String bloodGroup,
            @Size(max = 500) String allergies,
            @Size(max = 500) String chronicConditions) {
    }

    public record PatientResponse(
            Long id,
            Long userId,
            String fullName,
            LocalDate dateOfBirth,
            Patient.Gender gender,
            String phone,
            String address,
            String bloodGroup,
            String allergies,
            String chronicConditions,
            boolean active,
            String createdAt) {

        public static PatientResponse from(Patient p) {
            return new PatientResponse(
                    p.getId(), p.getUserId(), p.getFullName(), p.getDateOfBirth(), p.getGender(),
                    p.getPhone(), p.getAddress(), p.getBloodGroup(), p.getAllergies(),
                    p.getChronicConditions(), p.isActive(),
                    p.getCreatedAt() == null ? null : p.getCreatedAt().toString());
        }
    }
}
