package com.medicore.notification.controller;

import com.medicore.common.dto.ApiResponse;
import com.medicore.common.dto.PageResponse;
import com.medicore.notification.dto.NotificationDtos.NotificationRequest;
import com.medicore.notification.dto.NotificationDtos.NotificationResponse;
import com.medicore.notification.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /** Internal ingest — guarded by InternalTokenFilter (/internal/**). */
    @PostMapping("/internal/notifications")
    public ResponseEntity<ApiResponse<NotificationResponse>> ingest(
            @Valid @RequestBody NotificationRequest request) {
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(ApiResponse.ok("Notification queued", notificationService.ingest(request)));
    }

    @GetMapping("/api/notifications")
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> myNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.myNotifications(page, Math.min(size, 50))));
    }
}
