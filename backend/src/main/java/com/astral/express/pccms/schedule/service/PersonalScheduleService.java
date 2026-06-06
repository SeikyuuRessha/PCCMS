package com.astral.express.pccms.schedule.service;

import com.astral.express.pccms.common.dto.PageResponse;
import com.astral.express.pccms.schedule.dto.response.WorkScheduleResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.UUID;

public interface PersonalScheduleService {
    PageResponse<WorkScheduleResponse> getMySchedules(LocalDate fromDate, LocalDate toDate, Pageable pageable);

    PageResponse<WorkScheduleResponse> getStaffSchedules(
            UUID staffId,
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable);
}
