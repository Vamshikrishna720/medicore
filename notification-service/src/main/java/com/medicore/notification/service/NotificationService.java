package com.medicore.notification.service;

import com.medicore.common.dto.PageResponse;
import com.medicore.common.security.CurrentUser;
import com.medicore.notification.dto.NotificationDtos.NotificationRequest;
import com.medicore.notification.dto.NotificationDtos.NotificationResponse;
import com.medicore.notification.entity.Notification;
import com.medicore.notification.repository.NotificationRepository;
import com.medicore.notification.service.NotificationDispatcher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final NotificationDispatcher dispatcher;

    public NotificationService(NotificationRepository notificationRepository, NotificationDispatcher dispatcher) {
        this.notificationRepository = notificationRepository;
        this.dispatcher = dispatcher;
    }

    /**
     * Internal ingest (called by appointment-service over Feign).
     * Persists as QUEUED, then hands off to the async sender.
     */
    @Transactional
    public NotificationResponse ingest(NotificationRequest request) {
        Notification notification = new Notification();
        notification.setRecipientUserId(request.recipientUserId());
        notification.setType(request.type());
        notification.setMessage(request.message());
        Notification saved = notificationRepository.save(notification);

        dispatcher.dispatchAsync(saved.getId()); // cross-bean call → real @Async proxy
        return NotificationResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> myNotifications(int page, int size) {
        Long userId = CurrentUser.requireUserId();
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> result =
                notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId, pageable);
        List<NotificationResponse> content = result.getContent().stream()
                .map(NotificationResponse::from)
                .toList();
        return new PageResponse<>(content, result.getNumber(), result.getSize(),
                result.getTotalElements(), result.getTotalPages());
    }
}
