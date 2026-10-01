package com.medicore.patient.controller;

import com.medicore.common.dto.ApiResponse;
import com.medicore.common.dto.PageResponse;
import com.medicore.common.exception.AccessDeniedException;
import com.medicore.common.security.CurrentUser;
import com.medicore.patient.dto.PatientDtos.PatientRequest;
import com.medicore.patient.dto.PatientDtos.PatientResponse;
import com.medicore.patient.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping("/me")
    public ResponseEntity<ApiResponse<PatientResponse>> createMine(@Valid @RequestBody PatientRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Profile created", patientService.createMyProfile(request)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<PatientResponse>> getMine() {
        return ResponseEntity.ok(ApiResponse.ok(patientService.getMyProfile()));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<PatientResponse>> updateMine(@Valid @RequestBody PatientRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Profile updated", patientService.updateMyProfile(request)));
    }

    /** ADMIN-only: soft-deactivate or restore a patient profile. */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<PatientResponse>> setStatus(@PathVariable Long id,
                                                                  @RequestParam boolean active) {
        if (!CurrentUser.hasRole("ADMIN")) {
            throw new AccessDeniedException("Only admins can change patient status");
        }
        return ResponseEntity.ok(ApiResponse.ok(
                active ? "Patient activated" : "Patient deactivated",
                patientService.setStatus(id, active)));
    }
}
