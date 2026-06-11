package com.astral.express.pccms.schedule.dto.response;

import com.astral.express.pccms.schedule.entity.ShiftRequestStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ShiftChangeRequestResponse(
        UUID id,
        UUID scheduleId,
        UUID requestedBy,
        UUID targetStaffId,
        String reason,
        ShiftRequestStatus statusCode,
        UUID resolvedBy,
        OffsetDateTime resolvedAt,
        OffsetDateTime createdAt
) {
}
