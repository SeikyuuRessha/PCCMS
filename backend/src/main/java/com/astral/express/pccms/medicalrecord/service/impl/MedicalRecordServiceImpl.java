package com.astral.express.pccms.medicalrecord.service.impl;

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
import com.astral.express.pccms.appointment.service.AppointmentServiceFacade;
import com.astral.express.pccms.appointment.dto.response.AppointmentResponse;
import com.astral.express.pccms.identity.security.SecurityHelper;
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
public class MedicalRecordServiceImpl implements MedicalRecordService {
    private final MedicalRecordRepository medicalRecordRepository;
    private final MedicalRecordMapper medicalRecordMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final AppointmentServiceFacade appointmentService;
    private final SecurityHelper securityHelper;
    private final PetRepository petRepository;
    private final UserRepository userRepository;


    @Override
    @Transactional
    public MedicalRecordResponse updateMedicalRecord(UUID recordId, UpdateMedicalRecordRequest request) {
        // Find record
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_400_BAD_REQUEST)); // Or not found exception

        // Verify status
        if (record.getRecordStatus() != RecordStatus.DRAFT) {
            throw new BusinessException(ErrorCode.ERR_MR_006_RECORD_NOT_DRAFT);
        }

        // Validate vitals
        validateVitals(request.temperatureC(), request.heartRateBpm(), request.respiratoryRateBpm(),
                request.spo2Percent(), request.weightKg());

        // Update fields
        record.setTemperatureC(request.temperatureC());
        record.setHeartRateBpm(request.heartRateBpm());
        record.setRespiratoryRateBpm(request.respiratoryRateBpm());
        record.setWeightKg(request.weightKg());
        record.setBloodPressure(request.bloodPressure());
        record.setSpo2Percent(request.spo2Percent());
        record.setMucousMembraneColor(request.mucousMembraneColor());
        record.setCapillaryRefillSeconds(request.capillaryRefillSeconds());
        record.setPreliminaryDiagnosis(request.preliminaryDiagnosis());
        record.setTreatmentNote(request.treatmentNote());

        return enrichResponse(medicalRecordMapper.toResponse(medicalRecordRepository.save(record)));
    }

    @Override
    @Transactional
    public MedicalRecordResponse finalizeMedicalRecord(UUID recordId, FinalizeMedicalRecordRequest request) {
        // Find record
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_400_BAD_REQUEST)); // Or not found exception

        // Verify status
        if (record.getRecordStatus() != RecordStatus.DRAFT) {
            throw new BusinessException(ErrorCode.ERR_MR_006_RECORD_NOT_DRAFT);
        }

        // Verify final diagnosis
        if (request.finalDiagnosis() == null || request.finalDiagnosis().trim().isEmpty()) {
            throw new BusinessException(ErrorCode.ERR_MR_007_MISSING_FINAL_DIAGNOSIS);
        }

        // Verify at least one vital sign exists
        if (!hasAtLeastOneVitalSign(record)) {
            throw new BusinessException(ErrorCode.ERR_MR_008_MISSING_VITAL_SIGNS);
        }

        // Update record
        record.setFinalDiagnosis(request.finalDiagnosis());
        record.setTreatmentNote(request.treatmentNote());
        record.setFollowUpAt(request.followUpAt());
        
        record.setRecordStatus(RecordStatus.FINALIZED);
        record.setLockedAt(OffsetDateTime.now());

        MedicalRecord savedRecord = medicalRecordRepository.save(record);
        appointmentService.completeMedicalAppointment(savedRecord.getAppointmentId(), currentUserIdOrNull());
        log.info("Medical record {} finalized for pet {}", recordId, record.getPetId());

        eventPublisher.publishEvent(new MedicalRecordFinalizedEvent(
                savedRecord.getId(),
                savedRecord.getPetId(),
                savedRecord.getVetId()
        ));

        return enrichResponse(medicalRecordMapper.toResponse(savedRecord));
    }

    private void validateVitals(BigDecimal temperature, Integer heartRate, Integer respiratoryRate, Integer spo2, BigDecimal weight) {
        if (temperature != null && temperature.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException(ErrorCode.ERR_MR_001_INVALID_TEMPERATURE);
        }
        if (heartRate != null && heartRate < 0) {
            throw new BusinessException(ErrorCode.ERR_MR_002_INVALID_HEART_RATE);
        }
        if (respiratoryRate != null && respiratoryRate < 0) {
            throw new BusinessException(ErrorCode.ERR_MR_003_INVALID_RESPIRATORY_RATE);
        }
        if (spo2 != null && (spo2 < 0 || spo2 > 100)) {
            throw new BusinessException(ErrorCode.ERR_MR_004_INVALID_SPO2);
        }
        if (weight != null && weight.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException(ErrorCode.ERR_MR_005_INVALID_WEIGHT);
        }
    }

    private boolean hasAtLeastOneVitalSign(MedicalRecord record) {
        return record.getTemperatureC() != null
                || record.getHeartRateBpm() != null
                || record.getRespiratoryRateBpm() != null
                || record.getSpo2Percent() != null
                || record.getWeightKg() != null
                || record.getBloodPressure() != null
                || record.getCapillaryRefillSeconds() != null
                || record.getMucousMembraneColor() != null;
    }

    @Override
    public MedicalRecordResponse getMedicalRecordById(UUID recordId) {
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_400_BAD_REQUEST));
        return enrichResponse(medicalRecordMapper.toResponse(record));
    }

    @Override
    public List<MedicalRecordResponse> getMedicalRecords(UUID vetId) {
        List<MedicalRecord> records;
        if (vetId != null) {
            records = medicalRecordRepository.findByVetIdOrderByCreatedAtDesc(vetId);
        } else {
            records = medicalRecordRepository.findAllByOrderByCreatedAtDesc();
        }
        return records.stream()
                .map(medicalRecordMapper::toResponse)
                .map(this::enrichResponse)
                .toList();
    }

    @Override
    @Transactional
    public MedicalRecordResponse getOrCreateMedicalRecordByAppointmentId(UUID appointmentId) {
        AppointmentResponse appointment = shouldStartExamForCurrentUser()
                ? appointmentService.startExam(appointmentId, currentUserIdOrNull())
                : appointmentService.getAppointmentById(appointmentId);

        return medicalRecordRepository.findByAppointmentId(appointmentId)
                .map(medicalRecordMapper::toResponse)
                .orElseGet(() -> {
                    String recordCode = "MR-" + appointment.appointmentCode();

                    MedicalRecord record = MedicalRecord.builder()
                            .recordCode(recordCode)
                            .appointmentId(appointmentId)
                            .petId(appointment.petId())
                            .vetId(appointment.assignedVetId())
                            .recordStatus(RecordStatus.DRAFT)
                            .build();

                    return enrichResponse(medicalRecordMapper.toResponse(medicalRecordRepository.save(record)));
                });
    }

    private boolean shouldStartExamForCurrentUser() {
        return securityHelper != null && securityHelper.hasAnyRole("VETERINARIAN");
    }

    private UUID currentUserIdOrNull() {
        return securityHelper == null ? null : securityHelper.getCurrentUserId();
    }

    private MedicalRecordResponse enrichResponse(MedicalRecordResponse response) {
        String petName = petRepository.findById(response.petId())
                .map(Pets::getName)
                .orElse("Unknown Pet");

        String vetName = userRepository.findById(response.vetId())
                .map(Users::getFullName)
                .orElse("Unknown Vet");

        return new MedicalRecordResponse(
                response.id(),
                response.recordCode(),
                response.appointmentId(),
                response.petId(),
                petName,
                response.vetId(),
                vetName,
                response.recordStatus(),
                response.temperatureC(),
                response.heartRateBpm(),
                response.respiratoryRateBpm(),
                response.weightKg(),
                response.bloodPressure(),
                response.spo2Percent(),
                response.mucousMembraneColor(),
                response.capillaryRefillSeconds(),
                response.preliminaryDiagnosis(),
                response.finalDiagnosis(),
                response.treatmentNote(),
                response.followUpAt(),
                response.lockedAt(),
                response.createdAt(),
                response.updatedAt()
        );
    }
}
