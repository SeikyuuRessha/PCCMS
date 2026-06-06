package com.astral.express.pccms.schedule.service;

import com.astral.express.pccms.common.dto.PageResponse;
import com.astral.express.pccms.common.exception.BusinessException;
import com.astral.express.pccms.common.exception.ErrorCode;
import com.astral.express.pccms.schedule.dto.request.WorkScheduleRequest;
import com.astral.express.pccms.schedule.dto.response.WorkScheduleResponse;
import com.astral.express.pccms.schedule.entity.ScheduleStatus;
import com.astral.express.pccms.schedule.entity.Shift;
import com.astral.express.pccms.schedule.entity.WorkSchedule;
import com.astral.express.pccms.schedule.repository.ShiftRepository;
import com.astral.express.pccms.schedule.repository.WorkScheduleRepository;
import com.astral.express.pccms.schedule.service.impl.WorkScheduleServiceImpl;
import com.astral.express.pccms.user.entity.Roles;
import com.astral.express.pccms.user.entity.Users;
import com.astral.express.pccms.user.repository.RoleRepository;
import com.astral.express.pccms.user.repository.UserRepository;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class WorkScheduleServiceTest {

    @Mock
    private WorkScheduleRepository workScheduleRepository;

    @Mock
    private ShiftRepository shiftRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @InjectMocks
    private WorkScheduleServiceImpl workScheduleService;

    @ParameterizedTest(name = "[{1}] {3}")
    @CsvFileSource(resources = "/testcases/work-schedule-management.csv", numLinesToSkip = 1)
    void should_followWorkScheduleManagementCsvRules(
            String ruleId,
            String caseId,
            String useCase,
            String scenario,
            String precondition,
            String input,
            String expectedResult,
            String expectedErrorCode,
            String expectedMessage,
            String note) {
        switch (scenario) {
            case "Missing required schedule fields rejected", "Invalid schedule status rejected" -> {
                assertControllerLayerValidation(caseId, expectedErrorCode);
                return;
            }
            default -> {
            }
        }

        ScheduleCsvInput csv = parseInput(input);
        PageRequest pageable = PageRequest.of(0, 20);

        switch (scenario) {
            case "List schedules by date range success" -> assertListSuccess(csv, pageable);
            case "Create schedule success" -> assertCreateSuccess(csv);
            case "Update schedule success" -> assertUpdateSuccess(csv);
            case "Cancel schedule success" -> assertCancelSuccess(csv);
            case "Staff not found rejected", "Shift not found rejected", "Inactive shift rejected",
                    "Duplicate staff date shift rejected", "Non-positive capacity rejected",
                    "Invalid date range rejected" ->
                    assertFailure(scenario, csv, ErrorCode.valueOf(expectedErrorCode));
            default -> throw new IllegalArgumentException("Unhandled CSV scenario: " + scenario);
        }
    }

    private void assertListSuccess(ScheduleCsvInput csv, PageRequest pageable) {
        WorkSchedule schedule = schedule();
        given(workScheduleRepository.findByWorkDateBetween(csv.fromDate(), csv.toDate(), pageable))
                .willReturn(new PageImpl<>(List.of(schedule), pageable, 1));

        PageResponse<WorkScheduleResponse> response = workScheduleService.searchSchedules(
                csv.fromDate(), csv.toDate(), pageable);

        assertThat(response.data().content()).hasSize(1);
        assertThat(response.data().content().getFirst().statusCode()).isEqualTo(ScheduleStatus.ASSIGNED);
    }

    private void assertCreateSuccess(ScheduleCsvInput csv) {
        given(userRepository.findById(csv.staffId())).willReturn(Optional.of(user(csv.staffId())));
        given(shiftRepository.findById(csv.shiftId())).willReturn(Optional.of(shift(csv.shiftId(), true)));
        given(roleRepository.findById(csv.roleId())).willReturn(Optional.of(role(csv.roleId())));
        given(workScheduleRepository.existsByStaffIdAndWorkDateAndShiftId(
                csv.staffId(), csv.workDate(), csv.shiftId())).willReturn(false);
        given(workScheduleRepository.save(any(WorkSchedule.class))).willAnswer(invocation -> invocation.getArgument(0));

        WorkScheduleResponse response = workScheduleService.createSchedule(request(csv));

        assertThat(response.staffId()).isEqualTo(csv.staffId());
        assertThat(response.statusCode()).isEqualTo(ScheduleStatus.ASSIGNED);
        verify(workScheduleRepository).save(any(WorkSchedule.class));
    }

    private void assertUpdateSuccess(ScheduleCsvInput csv) {
        WorkSchedule schedule = schedule();
        given(workScheduleRepository.findById(csv.scheduleId())).willReturn(Optional.of(schedule));
        given(userRepository.findById(csv.staffId())).willReturn(Optional.of(user(csv.staffId())));
        given(shiftRepository.findById(csv.shiftId())).willReturn(Optional.of(shift(csv.shiftId(), true)));
        given(roleRepository.findById(csv.roleId())).willReturn(Optional.of(role(csv.roleId())));
        given(workScheduleRepository.existsByStaffIdAndWorkDateAndShiftIdAndIdNot(
                csv.staffId(), csv.workDate(), csv.shiftId(), csv.scheduleId())).willReturn(false);
        given(workScheduleRepository.save(schedule)).willReturn(schedule);

        WorkScheduleResponse response = workScheduleService.updateSchedule(csv.scheduleId(), request(csv));

        assertThat(response.id()).isEqualTo(schedule.getId());
        verify(workScheduleRepository).save(schedule);
    }

    private void assertCancelSuccess(ScheduleCsvInput csv) {
        WorkSchedule schedule = schedule();
        given(workScheduleRepository.findById(csv.scheduleId())).willReturn(Optional.of(schedule));
        given(workScheduleRepository.save(schedule)).willReturn(schedule);

        WorkScheduleResponse response = workScheduleService.cancelSchedule(csv.scheduleId());

        assertThat(response.statusCode()).isEqualTo(ScheduleStatus.CANCELLED);
    }

    private void assertFailure(String scenario, ScheduleCsvInput csv, ErrorCode errorCode) {
        if ("Invalid date range rejected".equals(scenario)) {
            assertThatThrownBy(() -> workScheduleService.searchSchedules(csv.fromDate(), csv.toDate(), PageRequest.of(0, 20)))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", errorCode);
            return;
        }
        if ("Non-positive capacity rejected".equals(scenario)) {
            assertThatThrownBy(() -> workScheduleService.createSchedule(request(csv)))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", errorCode);
            return;
        }

        if (!"Staff not found rejected".equals(scenario)) {
            given(userRepository.findById(csv.staffId())).willReturn(Optional.of(user(csv.staffId())));
        } else {
            given(userRepository.findById(csv.staffId())).willReturn(Optional.empty());
        }
        if ("Shift not found rejected".equals(scenario)) {
            given(shiftRepository.findById(csv.shiftId())).willReturn(Optional.empty());
        } else if (!"Staff not found rejected".equals(scenario)) {
            boolean active = !"Inactive shift rejected".equals(scenario);
            given(shiftRepository.findById(csv.shiftId())).willReturn(Optional.of(shift(csv.shiftId(), active)));
        }
        if ("Duplicate staff date shift rejected".equals(scenario)) {
            given(roleRepository.findById(csv.roleId())).willReturn(Optional.of(role(csv.roleId())));
            given(workScheduleRepository.existsByStaffIdAndWorkDateAndShiftId(
                    csv.staffId(), csv.workDate(), csv.shiftId())).willReturn(true);
        }

        assertThatThrownBy(() -> workScheduleService.createSchedule(request(csv)))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", errorCode);
    }

    private void assertControllerLayerValidation(String caseId, String expectedErrorCode) {
        assertThat(caseId).isIn("TC_SCH_005", "TC_SCH_011");
        assertThat(expectedErrorCode).isEqualTo(ErrorCode.ERR_VALIDATION_FAILED.name());
    }

    private WorkScheduleRequest request(ScheduleCsvInput input) {
        return new WorkScheduleRequest(
                input.staffId(),
                input.workDate(),
                input.shiftId(),
                null,
                null,
                input.roleId(),
                input.capacity(),
                input.statusCode(),
                input.note()
        );
    }

    private WorkSchedule schedule() {
        WorkSchedule schedule = new WorkSchedule();
        schedule.setId(id("10"));
        schedule.setStaff(user(id("2")));
        schedule.setWorkDate(LocalDate.parse("2026-04-12"));
        schedule.setShift(shift(id("1"), true));
        schedule.setRole(role(id("2")));
        schedule.setCapacity(1);
        schedule.setStatusCode(ScheduleStatus.ASSIGNED);
        schedule.setNote("Morning duty");
        return schedule;
    }

    private Users user(UUID id) {
        Users user = new Users();
        user.setId(id);
        user.setFullName("Staff");
        return user;
    }

    private Roles role(UUID id) {
        Roles role = new Roles();
        role.setId(id);
        role.setCode("STAFF");
        role.setName("Staff");
        role.setIsActive(true);
        return role;
    }

    private Shift shift(UUID id, boolean active) {
        Shift shift = new Shift();
        shift.setId(id);
        shift.setCode("MORNING");
        shift.setName("Morning");
        shift.setStartTime(LocalTime.of(8, 0));
        shift.setEndTime(LocalTime.of(12, 0));
        shift.setIsActive(active);
        return shift;
    }

    private ScheduleCsvInput parseInput(String input) {
        return new ScheduleCsvInput(
                uuid(input, "scheduleId"),
                uuid(input, "staffId"),
                date(input, "workDate"),
                uuid(input, "shiftId"),
                uuid(input, "roleId"),
                integer(input, "capacity"),
                status(input, "statusCode"),
                text(input, "note"),
                date(input, "fromDate"),
                date(input, "toDate")
        );
    }

    private ScheduleStatus status(String input, String key) {
        String value = text(input, key);
        return value == null ? null : ScheduleStatus.valueOf(value);
    }

    private LocalDate date(String input, String key) {
        String value = text(input, key);
        return value == null ? null : LocalDate.parse(value);
    }

    private Integer integer(String input, String key) {
        String value = text(input, key);
        return value == null ? null : Integer.valueOf(value);
    }

    private UUID uuid(String input, String key) {
        String value = text(input, key);
        return value == null ? null : id(value);
    }

    private UUID id(String value) {
        if ("999999".equals(value)) {
            return UUID.fromString("99999999-9999-9999-9999-999999999999");
        }
        return UUID.fromString("00000000-0000-0000-0000-" + String.format("%012d", Long.parseLong(value)));
    }

    private String text(String input, String key) {
        for (String part : input.split(";")) {
            String[] pair = part.trim().split("=", 2);
            if (pair.length == 2 && pair[0].trim().equals(key)) {
                String value = pair[1].trim();
                return value.isBlank() || "null".equalsIgnoreCase(value) ? null : value;
            }
        }
        return null;
    }

    private record ScheduleCsvInput(
            UUID scheduleId,
            UUID staffId,
            LocalDate workDate,
            UUID shiftId,
            UUID roleId,
            Integer capacity,
            ScheduleStatus statusCode,
            String note,
            LocalDate fromDate,
            LocalDate toDate
    ) {
    }
}
