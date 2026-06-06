package com.astral.express.pccms.schedule.service.impl;

import com.astral.express.pccms.schedule.dto.response.ShiftChangeRequestResponse;
import com.astral.express.pccms.schedule.dto.response.WorkScheduleResponse;
import com.astral.express.pccms.schedule.entity.ExamRoom;
import com.astral.express.pccms.schedule.entity.GroomingStation;
import com.astral.express.pccms.schedule.entity.Shift;
import com.astral.express.pccms.schedule.entity.ShiftChangeRequest;
import com.astral.express.pccms.schedule.entity.WorkSchedule;
import com.astral.express.pccms.user.entity.Roles;
import com.astral.express.pccms.user.entity.Users;

import java.util.UUID;

final class ScheduleMapperSupport {
    private ScheduleMapperSupport() {
    }

    static WorkScheduleResponse toWorkScheduleResponse(WorkSchedule schedule) {
        Users staff = schedule.getStaff();
        Shift shift = schedule.getShift();
        Roles role = schedule.getRole();
        ExamRoom examRoom = schedule.getExamRoom();
        GroomingStation station = schedule.getStation();
        return new WorkScheduleResponse(
                schedule.getId(),
                id(staff),
                staff == null ? null : staff.getFullName(),
                schedule.getWorkDate(),
                shift == null ? null : shift.getId(),
                shift == null ? null : shift.getCode(),
                shift == null ? null : shift.getName(),
                shift == null ? null : shift.getStartTime(),
                shift == null ? null : shift.getEndTime(),
                examRoom == null ? null : examRoom.getId(),
                examRoom == null ? null : examRoom.getRoomCode(),
                examRoom == null ? null : examRoom.getName(),
                station == null ? null : station.getId(),
                station == null ? null : station.getStationCode(),
                station == null ? null : station.getName(),
                role == null ? null : role.getId(),
                role == null ? null : role.getCode(),
                schedule.getCapacity(),
                schedule.getStatusCode(),
                schedule.getNote()
        );
    }

    static ShiftChangeRequestResponse toShiftChangeRequestResponse(ShiftChangeRequest request) {
        return new ShiftChangeRequestResponse(
                request.getId(),
                request.getSchedule() == null ? null : request.getSchedule().getId(),
                id(request.getRequestedBy()),
                id(request.getTargetStaff()),
                request.getReason(),
                request.getStatusCode(),
                id(request.getResolvedBy()),
                request.getResolvedAt(),
                request.getCreatedAt()
        );
    }

    private static UUID id(Users user) {
        return user == null ? null : user.getId();
    }
}
