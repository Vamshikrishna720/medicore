package com.medicore.doctor.controller;

import com.medicore.common.dto.ApiResponse;
import com.medicore.doctor.dto.DoctorDtos.DoctorResponse;
import com.medicore.doctor.service.DoctorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/**
 * Service-to-service endpoints for appointment-service (Feign).
 * Secured by InternalTokenFilter (/internal/**); kept out of DoctorController
 * so public/doctor-facing routes stay cleanly separated.
 */
@RestController
public class DoctorInternalController {

    private final DoctorService doctorService;

    public DoctorInternalController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping("/internal/doctors/{id}")
    public ResponseEntity<ApiResponse<DoctorResponse>> internalGet(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.internalById(id)));
    }

    @GetMapping("/internal/doctors/by-user/{userId}")
    public ResponseEntity<ApiResponse<DoctorResponse>> internalByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.internalByUserId(userId)));
    }
}
