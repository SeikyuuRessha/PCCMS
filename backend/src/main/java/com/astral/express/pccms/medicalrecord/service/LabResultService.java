package com.astral.express.pccms.medicalrecord.service;

import com.astral.express.pccms.medicalrecord.dto.request.CreateLabResultRequest;
import com.astral.express.pccms.medicalrecord.dto.response.LabResultResponse;

import java.util.List;
import java.util.UUID;

public interface LabResultService {
    List<LabResultResponse> listLabResults(UUID medicalRecordId);

    LabResultResponse createLabResult(UUID medicalRecordId, CreateLabResultRequest request);
}
