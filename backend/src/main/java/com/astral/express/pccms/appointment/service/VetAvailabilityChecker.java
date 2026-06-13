package com.astral.express.pccms.appointment.service;

import com.astral.express.pccms.schedule.repository.WorkScheduleRepository;
import com.astral.express.pccms.user.entity.Users;
import com.astral.express.pccms.user.repository.UserRepository;
import com.astral.express.pccms.common.exception.BusinessException;
import com.astral.express.pccms.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class VetAvailabilityChecker {
    private static final String VET_ROLE = "VETERINARIAN";
    private static final LocalTime CLINIC_OPEN = LocalTime.of(7, 0);
    private static final LocalTime CLINIC_CLOSE = LocalTime.of(22, 0);
    
    private final UserRepository userRepository;
    private final WorkScheduleRepository workScheduleRepository;
    private final AppointmentOverlapChecker overlapChecker;

    public boolean isVetOnDuty(LocalDate date, LocalTime slotStart, UUID vetId) {
        if (slotStart.isBefore(CLINIC_OPEN) || !slotStart.isBefore(CLINIC_CLOSE)) {
            return false;
        }

        List<UUID> scheduledVetIds = workScheduleRepository.findAvailableVetIds(date, slotStart);
        if (scheduledVetIds.isEmpty()) {
            List<UUID> allDayVets = workScheduleRepository.findVetIdsOnDutyForDate(date);
            if (!allDayVets.isEmpty()) {
                return false;
            }
            return userRepository.findActiveByRoleCode(VET_ROLE).stream()
                    .anyMatch(v -> v.getId().equals(vetId));
        }
        return scheduledVetIds.contains(vetId);
    }

    public List<UUID> resolveVetCandidates(LocalDate date, LocalTime slotStart) {
        if (slotStart.isBefore(CLINIC_OPEN) || !slotStart.isBefore(CLINIC_CLOSE)) {
            return List.of();
        }

        List<UUID> scheduledVetIds = workScheduleRepository.findAvailableVetIds(date, slotStart);
        if (!scheduledVetIds.isEmpty()) {
            return scheduledVetIds;
        }

        List<UUID> allDayVets = workScheduleRepository.findVetIdsOnDutyForDate(date);
        if (!allDayVets.isEmpty()) {
            return List.of();
        }

        return userRepository.findActiveByRoleCode(VET_ROLE).stream().map(Users::getId).toList();
    }

    public Users requireVetAvailable(LocalDate date, LocalTime slotStart, UUID requestedVetId,
                                     OffsetDateTime startAt, OffsetDateTime endAt) {
        if (requestedVetId != null) {
            Users vet = userRepository.findById(requestedVetId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.ERR_ACC_002_USER_NOT_FOUND));
            if (!VET_ROLE.equals(vet.getRole().getCode())) {
                throw new BusinessException(ErrorCode.ERR_APT_005_NO_VET_AVAILABLE);
            }
            if (!isVetOnDuty(date, slotStart, requestedVetId)
                    || overlapChecker.hasVetOverlap(requestedVetId, startAt, endAt)) {
                throw new BusinessException(ErrorCode.ERR_APT_009_SLOT_FULL);
            }
            return vet;
        }

        List<UUID> candidates = resolveVetCandidates(date, slotStart);
        return candidates.stream()
                .map(userRepository::findById)
                .flatMap(Optional::stream)
                .filter(v -> !overlapChecker.hasVetOverlap(v.getId(), startAt, endAt))
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_APT_005_NO_VET_AVAILABLE));
    }

    public boolean isVetFree(UUID vetId, OffsetDateTime startAt, OffsetDateTime endAt) {
        return !overlapChecker.hasVetOverlap(vetId, startAt, endAt);
    }

    public List<UUID> findVetIdsOnDutyForDate(LocalDate date) {
        return workScheduleRepository.findVetIdsOnDutyForDate(date);
    }
}
