package com.astral.express.pccms.medicalrecord.service;

import com.astral.express.pccms.common.exception.BusinessException;
import com.astral.express.pccms.common.exception.ErrorCode;
import com.astral.express.pccms.medicalrecord.dto.request.FinalizeMedicalRecordRequest;
import com.astral.express.pccms.medicalrecord.dto.request.UpdateMedicalRecordRequest;
import com.astral.express.pccms.medicalrecord.dto.response.MedicalRecordResponse;
import com.astral.express.pccms.medicalrecord.entity.MedicalRecord;
import com.astral.express.pccms.medicalrecord.entity.RecordStatus;
import com.astral.express.pccms.medicalrecord.mapper.MedicalRecordMapper;
import com.astral.express.pccms.medicalrecord.repository.MedicalRecordRepository;
import com.astral.express.pccms.medicalrecord.event.MedicalRecordFinalizedEvent;
import com.astral.express.pccms.appointment.service.AppointmentLifecycleUseCase;
import com.astral.express.pccms.appointment.service.AppointmentQueryUseCase;
import com.astral.express.pccms.appointment.dto.response.AppointmentResponse;
import com.astral.express.pccms.identity.security.SecurityContextService;
import com.astral.express.pccms.medicalrecord.service.MedicalRecordService;
import com.astral.express.pccms.pet.entity.Pets;
import com.astral.express.pccms.pet.repository.PetRepository;
import com.astral.express.pccms.user.entity.Users;
import com.astral.express.pccms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MedicalRecordService {
    private final MedicalRecordRepository medicalRecordRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final AppointmentLifecycleUseCase appointmentLifecycleUseCase;
    private final AppointmentQueryUseCase appointmentQueryUseCase;
    private final SecurityContextService SecurityContextService;
@Transactional
    public MedicalRecordResponse updateMedicalRecord(UUID recordId, UpdateMedicalRecordRequest request) {
        // Find record
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_400_BAD_REQUEST)); // Or not found exception

        record.updateVitals(
                request.temperatureC(),
                request.heartRateBpm(),
                request.respiratoryRateBpm(),
                request.spo2Percent(),
                request.weightKg(),
                request.bloodPressure(),
                request.mucousMembraneColor(),
                request.capillaryRefillSeconds(),
                request.preliminaryDiagnosis(),
                request.treatmentNote()
        );

        return medicalRecordRepository.findResponseById(medicalRecordRepository.save(record).getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_400_BAD_REQUEST));
    }
@Transactional
    public MedicalRecordResponse finalizeMedicalRecord(UUID recordId, FinalizeMedicalRecordRequest request) {
        // Find record
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_400_BAD_REQUEST)); // Or not found exception

        record.finalizeRecord(request.finalDiagnosis(), request.treatmentNote(), request.followUpAt());

        MedicalRecord savedRecord = medicalRecordRepository.save(record);
        appointmentLifecycleUseCase.completeMedicalAppointment(savedRecord.getAppointmentId(), currentUserIdOrNull());
        log.info("Medical record {} finalized for pet {}", recordId, record.getPetId());

        eventPublisher.publishEvent(new MedicalRecordFinalizedEvent(
                savedRecord.getId(),
                savedRecord.getPetId(),
                savedRecord.getVetId()
        ));

        return medicalRecordRepository.findResponseById(savedRecord.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_400_BAD_REQUEST));
    }

    // Helper methods have been moved to the domain model.
public MedicalRecordResponse getMedicalRecordById(UUID recordId) {
        return medicalRecordRepository.findResponseById(recordId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_400_BAD_REQUEST));
    }
public List<MedicalRecordResponse> getMedicalRecords(UUID vetId) {
        if (vetId != null) {
            return medicalRecordRepository.findResponsesByVetId(vetId);
        }
        return medicalRecordRepository.findAllResponses();
    }
@Transactional
    public MedicalRecordResponse getOrCreateMedicalRecordByAppointmentId(UUID appointmentId) {
        AppointmentResponse appointment = shouldStartExamForCurrentUser()
                ? appointmentLifecycleUseCase.startExam(appointmentId, currentUserIdOrNull())
                : appointmentQueryUseCase.getAppointmentById(appointmentId);

        return medicalRecordRepository.findResponseByAppointmentId(appointmentId)
                .orElseGet(() -> {
                    String recordCode = "MR-" + appointment.appointmentCode();

                    MedicalRecord record = MedicalRecord.builder()
                            .recordCode(recordCode)
                            .appointmentId(appointmentId)
                            .petId(appointment.petId())
                            .vetId(appointment.assignedVetId())
                            .recordStatus(RecordStatus.DRAFT)
                            .build();

                    return medicalRecordRepository.findResponseById(medicalRecordRepository.save(record).getId())
                            .orElseThrow(() -> new BusinessException(ErrorCode.ERR_400_BAD_REQUEST));
                });
    }

    private boolean shouldStartExamForCurrentUser() {
        return SecurityContextService != null && SecurityContextService.hasAnyRole("VETERINARIAN");
    }

    private UUID currentUserIdOrNull() {
        return SecurityContextService == null ? null : SecurityContextService.getCurrentUserId();
    }
}


