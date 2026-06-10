package com.astral.express.pccms.medicalrecord.service;

import com.astral.express.pccms.medicalrecord.dto.request.CreatePrescriptionRequest;
import com.astral.express.pccms.medicalrecord.dto.response.PrescriptionResponse;

import java.util.List;
import java.util.UUID;

public interface PrescriptionService {
    PrescriptionResponse createPrescription(UUID medicalRecordId, CreatePrescriptionRequest request);

    List<PrescriptionResponse> listPrescriptions(UUID medicalRecordId);
}
