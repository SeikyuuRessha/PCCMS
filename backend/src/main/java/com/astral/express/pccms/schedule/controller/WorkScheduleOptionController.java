package com.astral.express.pccms.schedule.controller;

import com.astral.express.pccms.common.dto.ApiResponse;
import com.astral.express.pccms.schedule.dto.response.ExamRoomOptionResponse;
import com.astral.express.pccms.schedule.dto.response.GroomingStationOptionResponse;
import com.astral.express.pccms.schedule.dto.response.RoleOptionResponse;
import com.astral.express.pccms.schedule.dto.response.ShiftOptionResponse;
import com.astral.express.pccms.schedule.dto.response.StaffOptionResponse;
import com.astral.express.pccms.schedule.service.WorkScheduleOptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/work-schedules/options")
@RequiredArgsConstructor
public class WorkScheduleOptionController {
    private final WorkScheduleOptionService workScheduleOptionService;

    @GetMapping("/staff")
    public ApiResponse<List<StaffOptionResponse>> getStaffOptions() {
        return ApiResponse.success(workScheduleOptionService.getStaffOptions());
    }

    @GetMapping("/shifts")
    public ApiResponse<List<ShiftOptionResponse>> getShiftOptions() {
        return ApiResponse.success(workScheduleOptionService.getShiftOptions());
    }

    @GetMapping("/roles")
    public ApiResponse<List<RoleOptionResponse>> getRoleOptions() {
        return ApiResponse.success(workScheduleOptionService.getRoleOptions());
    }

    @GetMapping("/exam-rooms")
    public ApiResponse<List<ExamRoomOptionResponse>> getExamRoomOptions() {
        return ApiResponse.success(workScheduleOptionService.getExamRoomOptions());
    }

    @GetMapping("/grooming-stations")
    public ApiResponse<List<GroomingStationOptionResponse>> getGroomingStationOptions() {
        return ApiResponse.success(workScheduleOptionService.getGroomingStationOptions());
    }
}
