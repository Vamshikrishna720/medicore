package com.medicore.doctor.controller;

import com.medicore.common.dto.ApiResponse;
import com.medicore.common.dto.PageResponse;
import com.medicore.common.security.CurrentUser;
import com.medicore.doctor.dto.DoctorDtos.DoctorRequest;
import com.medicore.doctor.dto.DoctorDtos.DoctorResponse;
import com.medicore.doctor.service.DoctorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    // ---------- public (whitelisted at gateway) ----------

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<DoctorResponse>>> list(
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) Integer minExperience,
            @RequestParam(required = false) BigDecimal maxFee,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                doctorService.search(specialization, minExperience, maxFee, page, Math.min(size, 50))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.getById(id)));
    }

    @GetMapping("/specializations")
    public ResponseEntity<ApiResponse<List<String>>> specializations() {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.specializations()));
    }

    // ---------- doctor-only (/me) ----------

    @PostMapping("/me")
    public ResponseEntity<ApiResponse<DoctorResponse>> createMine(@Valid @RequestBody DoctorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Profile created", doctorService.createMyProfile(request)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<DoctorResponse>> getMine() {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.getMyProfile()));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<DoctorResponse>> updateMine(@Valid @RequestBody DoctorRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Profile updated", doctorService.updateMyProfile(request)));
    }

    @PatchMapping("/me/availability")
    public ResponseEntity<ApiResponse<DoctorResponse>> setAvailability(@RequestParam boolean available) {
        return ResponseEntity.ok(ApiResponse.ok(
                available ? "You are now on duty" : "You are now off duty",
                doctorService.setAvailability(CurrentUser.requireUserId(), available)));
    }
}
