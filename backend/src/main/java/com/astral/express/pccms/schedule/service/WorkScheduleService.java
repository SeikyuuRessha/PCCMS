package com.astral.express.pccms.schedule.service;

import com.astral.express.pccms.common.dto.PageResponse;
import com.astral.express.pccms.schedule.dto.request.WorkScheduleRequest;
import com.astral.express.pccms.schedule.dto.response.WorkScheduleResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.UUID;

public interface WorkScheduleService {
    PageResponse<WorkScheduleResponse> searchSchedules(LocalDate fromDate, LocalDate toDate, Pageable pageable);

    WorkScheduleResponse createSchedule(WorkScheduleRequest request);

    WorkScheduleResponse updateSchedule(UUID scheduleId, WorkScheduleRequest request);

    WorkScheduleResponse cancelSchedule(UUID scheduleId);
}
