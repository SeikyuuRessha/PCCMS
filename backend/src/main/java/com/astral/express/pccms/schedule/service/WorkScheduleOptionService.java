package com.astral.express.pccms.schedule.service;

import com.astral.express.pccms.schedule.dto.response.ExamRoomOptionResponse;
import com.astral.express.pccms.schedule.dto.response.GroomingStationOptionResponse;
import com.astral.express.pccms.schedule.dto.response.RoleOptionResponse;
import com.astral.express.pccms.schedule.dto.response.ShiftOptionResponse;
import com.astral.express.pccms.schedule.dto.response.StaffOptionResponse;

import java.util.List;

public interface WorkScheduleOptionService {
    List<StaffOptionResponse> getStaffOptions();

    List<ShiftOptionResponse> getShiftOptions();

    List<RoleOptionResponse> getRoleOptions();

    List<ExamRoomOptionResponse> getExamRoomOptions();

    List<GroomingStationOptionResponse> getGroomingStationOptions();
}
