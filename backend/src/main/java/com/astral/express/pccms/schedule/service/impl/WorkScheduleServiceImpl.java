package com.astral.express.pccms.schedule.service.impl;

import com.astral.express.pccms.common.dto.PageResponse;
import com.astral.express.pccms.common.exception.BusinessException;
import com.astral.express.pccms.common.exception.ErrorCode;
import com.astral.express.pccms.schedule.dto.request.WorkScheduleRequest;
import com.astral.express.pccms.schedule.dto.response.WorkScheduleResponse;
import com.astral.express.pccms.schedule.entity.ExamRoom;
import com.astral.express.pccms.schedule.entity.GroomingStation;
import com.astral.express.pccms.schedule.entity.ScheduleStatus;
import com.astral.express.pccms.schedule.entity.Shift;
import com.astral.express.pccms.schedule.entity.WorkSchedule;
import com.astral.express.pccms.schedule.repository.ExamRoomRepository;
import com.astral.express.pccms.schedule.repository.GroomingStationRepository;
import com.astral.express.pccms.schedule.repository.ShiftRepository;
import com.astral.express.pccms.schedule.repository.WorkScheduleRepository;
import com.astral.express.pccms.schedule.service.WorkScheduleService;
import com.astral.express.pccms.user.entity.Roles;
import com.astral.express.pccms.user.entity.Users;
import com.astral.express.pccms.user.repository.RoleRepository;
import com.astral.express.pccms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkScheduleServiceImpl implements WorkScheduleService {
    private final WorkScheduleRepository workScheduleRepository;
    private final ShiftRepository shiftRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ExamRoomRepository examRoomRepository;
    private final GroomingStationRepository groomingStationRepository;

    @Override
    @PreAuthorize("hasAuthority('SCHEDULE_MANAGE')")
    public PageResponse<WorkScheduleResponse> searchSchedules(LocalDate fromDate, LocalDate toDate, Pageable pageable) {
        validateDateRange(fromDate, toDate);
        Page<WorkSchedule> schedules = workScheduleRepository.findByWorkDateBetween(fromDate, toDate, pageable);
        return PageResponse.of(schedules.map(ScheduleMapperSupport::toWorkScheduleResponse));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('SCHEDULE_MANAGE')")
    public WorkScheduleResponse createSchedule(WorkScheduleRequest request) {
        validateCapacity(request.capacity());
        Users staff = findUser(request.staffId());
        Shift shift = findActiveShift(request.shiftId());
        Roles role = findRole(request.roleId());
        if (workScheduleRepository.existsByStaffIdAndWorkDateAndShiftId(
                request.staffId(), request.workDate(), request.shiftId())) {
            throw new BusinessException(ErrorCode.ERR_VALIDATION_FAILED);
        }

        WorkSchedule schedule = new WorkSchedule();
        applyRequest(schedule, request, staff, shift, role);
        return ScheduleMapperSupport.toWorkScheduleResponse(workScheduleRepository.save(schedule));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('SCHEDULE_MANAGE')")
    public WorkScheduleResponse updateSchedule(UUID scheduleId, WorkScheduleRequest request) {
        validateCapacity(request.capacity());
        WorkSchedule schedule = findSchedule(scheduleId);
        Users staff = findUser(request.staffId());
        Shift shift = findActiveShift(request.shiftId());
        Roles role = findRole(request.roleId());
        if (workScheduleRepository.existsByStaffIdAndWorkDateAndShiftIdAndIdNot(
                request.staffId(), request.workDate(), request.shiftId(), scheduleId)) {
            throw new BusinessException(ErrorCode.ERR_VALIDATION_FAILED);
        }

        applyRequest(schedule, request, staff, shift, role);
        return ScheduleMapperSupport.toWorkScheduleResponse(workScheduleRepository.save(schedule));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('SCHEDULE_MANAGE')")
    public WorkScheduleResponse cancelSchedule(UUID scheduleId) {
        WorkSchedule schedule = findSchedule(scheduleId);
        schedule.setStatusCode(ScheduleStatus.CANCELLED);
        return ScheduleMapperSupport.toWorkScheduleResponse(workScheduleRepository.save(schedule));
    }

    private void applyRequest(WorkSchedule schedule, WorkScheduleRequest request, Users staff, Shift shift, Roles role) {
        schedule.setStaff(staff);
        schedule.setWorkDate(request.workDate());
        schedule.setShift(shift);
        schedule.setExamRoom(findExamRoom(request.examRoomId()));
        schedule.setStation(findStation(request.stationId()));
        schedule.setRole(role);
        schedule.setCapacity(request.capacity());
        schedule.setStatusCode(request.statusCode());
        schedule.setNote(request.note());
    }

    private WorkSchedule findSchedule(UUID scheduleId) {
        return workScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_404_NOT_FOUND));
    }

    private Users findUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_404_NOT_FOUND));
    }

    private Shift findActiveShift(UUID shiftId) {
        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_404_NOT_FOUND));
        if (!Boolean.TRUE.equals(shift.getIsActive())) {
            throw new BusinessException(ErrorCode.ERR_VALIDATION_FAILED);
        }
        return shift;
    }

    private Roles findRole(UUID roleId) {
        return roleRepository.findById(roleId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_404_NOT_FOUND));
    }

    private ExamRoom findExamRoom(UUID examRoomId) {
        if (examRoomId == null) {
            return null;
        }
        return examRoomRepository.findById(examRoomId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_404_NOT_FOUND));
    }

    private GroomingStation findStation(UUID stationId) {
        if (stationId == null) {
            return null;
        }
        return groomingStationRepository.findById(stationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_404_NOT_FOUND));
    }

    private void validateCapacity(Integer capacity) {
        if (capacity == null || capacity <= 0) {
            throw new BusinessException(ErrorCode.ERR_VALIDATION_FAILED);
        }
    }

    private void validateDateRange(LocalDate fromDate, LocalDate toDate) {
        if (fromDate == null || toDate == null || fromDate.isAfter(toDate)) {
            throw new BusinessException(ErrorCode.ERR_VALIDATION_FAILED);
        }
    }
}
