package com.medicore.patient.controller;

import com.medicore.common.dto.ApiResponse;
import com.medicore.common.dto.PageResponse;
import com.medicore.patient.dto.PatientDtos.PatientResponse;
import com.medicore.patient.service.PatientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * ADMIN listing and internal Feign lookup endpoints.
 */
@RestController
public class PatientAdminController {

    private final PatientService patientService;

    public PatientAdminController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping("/api/patients")
    public ResponseEntity<ApiResponse<PageResponse<PatientResponse>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.listActive(page, Math.min(size, 100))));
    }

    @GetMapping("/api/patients/{id}")
    public ResponseEntity<ApiResponse<PatientResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.getById(id)));
    }

    @GetMapping("/internal/patients/by-user/{userId}")
    public ResponseEntity<ApiResponse<PatientResponse>> internalByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(patientService.internalByUserId(userId)));
    }
}
