package com.medicore.notification.service;

import com.medicore.notification.entity.Notification;
import com.medicore.notification.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Separate bean so @Async actually proxies (self-invocation from
 * NotificationService.ingest would have run synchronously).
 * Simulated email gateway — production would call SES/SendGrid.
 */
@Component
public class NotificationDispatcher {

    private static final Logger log = LoggerFactory.getLogger(NotificationDispatcher.class);

    private final NotificationRepository notificationRepository;

    public NotificationDispatcher(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Async("medicoreNotificationExecutor")
    public void dispatchAsync(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            try {
                Thread.sleep(150); // simulate SMTP latency
                notification.setStatus(Notification.Status.SENT);
                notification.setSentAt(java.time.LocalDateTime.now());
                log.info("Notification {} sent to user {}", notification.getId(), notification.getRecipientUserId());
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                notification.setStatus(Notification.Status.FAILED);
                notification.setFailureReason("Interrupted");
            } catch (Exception ex) {
                notification.setStatus(Notification.Status.FAILED);
                notification.setFailureReason(ex.getMessage());
            }
            notificationRepository.save(notification);
        });
    }
}
