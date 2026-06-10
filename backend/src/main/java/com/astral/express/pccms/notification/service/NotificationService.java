package com.astral.express.pccms.notification.service;

import com.astral.express.pccms.common.dto.PageResponse;
import com.astral.express.pccms.notification.dto.response.NotificationResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface NotificationService {
    NotificationResponse createNotification(
            UUID recipientUserId,
            String sourceType,
            UUID sourceId,
            String notificationType,
            String title,
            String body);

    PageResponse<NotificationResponse> listMyNotifications(Pageable pageable);

    NotificationResponse markRead(UUID notificationId);

    NotificationResponse archive(UUID notificationId);
}
