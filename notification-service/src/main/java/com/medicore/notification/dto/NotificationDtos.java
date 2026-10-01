package com.medicore.notification.dto;

import com.medicore.notification.entity.Notification;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class NotificationDtos {

    private NotificationDtos() {
    }

    public record NotificationRequest(
            @NotNull Long recipientUserId,
            Long patientId,
            @NotBlank @Size(max = 40) String type,
            @NotBlank @Size(max = 500) String message) {
    }

    public record NotificationResponse(
            Long id,
            Long recipientUserId,
            String type,
            String message,
            Notification.Status status,
            String createdAt) {

        public static NotificationResponse from(Notification n) {
            return new NotificationResponse(
                    n.getId(), n.getRecipientUserId(), n.getType(), n.getMessage(),
                    n.getStatus(), n.getCreatedAt() == null ? null : n.getCreatedAt().toString());
        }
    }
}
