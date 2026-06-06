package com.astral.express.pccms.schedule.controller;

import com.astral.express.pccms.common.dto.ApiResponse;
import com.astral.express.pccms.common.dto.PageResponse;
import com.astral.express.pccms.schedule.dto.request.WorkScheduleRequest;
import com.astral.express.pccms.schedule.dto.response.WorkScheduleResponse;
import com.astral.express.pccms.schedule.service.WorkScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/admin/work-schedules")
@RequiredArgsConstructor
public class WorkScheduleController {
    private final WorkScheduleService workScheduleService;

    @GetMapping
    public ApiResponse<PageResponse<WorkScheduleResponse>> searchSchedules(
            @RequestParam LocalDate fromDate,
            @RequestParam LocalDate toDate,
            @PageableDefault(size = 20, sort = "workDate", direction = Sort.Direction.ASC) Pageable pageable) {
        return ApiResponse.success(workScheduleService.searchSchedules(fromDate, toDate, pageable));
    }

    @PostMapping
    public ApiResponse<WorkScheduleResponse> createSchedule(@Valid @RequestBody WorkScheduleRequest request) {
        return ApiResponse.success(workScheduleService.createSchedule(request));
    }

    @PutMapping("/{scheduleId}")
    public ApiResponse<WorkScheduleResponse> updateSchedule(
            @PathVariable UUID scheduleId,
            @Valid @RequestBody WorkScheduleRequest request) {
        return ApiResponse.success(workScheduleService.updateSchedule(scheduleId, request));
    }

    @DeleteMapping("/{scheduleId}")
    public ApiResponse<WorkScheduleResponse> cancelSchedule(@PathVariable UUID scheduleId) {
        return ApiResponse.success(workScheduleService.cancelSchedule(scheduleId));
    }
}
