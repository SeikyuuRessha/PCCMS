package com.astral.express.pccms.medicalrecord.service;

import com.astral.express.pccms.medicalrecord.dto.request.FinalizeMedicalRecordRequest;
import com.astral.express.pccms.medicalrecord.dto.request.UpdateMedicalRecordRequest;
import com.astral.express.pccms.medicalrecord.dto.response.MedicalRecordResponse;

import java.util.List;
import java.util.UUID;

public interface MedicalRecordService {
    MedicalRecordResponse updateMedicalRecord(UUID recordId, UpdateMedicalRecordRequest request);
    MedicalRecordResponse finalizeMedicalRecord(UUID recordId, FinalizeMedicalRecordRequest request);
    MedicalRecordResponse getMedicalRecordById(UUID recordId);
    List<MedicalRecordResponse> getMedicalRecords(UUID vetId);
    MedicalRecordResponse getOrCreateMedicalRecordByAppointmentId(UUID appointmentId);
}


