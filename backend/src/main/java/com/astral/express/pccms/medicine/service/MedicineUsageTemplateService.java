package com.astral.express.pccms.medicine.service;

import com.astral.express.pccms.medicine.dto.request.CreateMedicineUsageTemplateRequest;
import com.astral.express.pccms.medicine.dto.request.UpdateMedicineUsageTemplateRequest;
import com.astral.express.pccms.medicine.dto.response.MedicineUsageTemplateResponse;

import java.util.List;
import java.util.UUID;

public interface MedicineUsageTemplateService {
    MedicineUsageTemplateResponse createTemplate(UUID medicineId, CreateMedicineUsageTemplateRequest request);
    MedicineUsageTemplateResponse updateTemplate(UUID medicineId, UUID templateId, UpdateMedicineUsageTemplateRequest request);
    void deleteTemplate(UUID medicineId, UUID templateId);
    List<MedicineUsageTemplateResponse> listByMedicine(UUID medicineId);
}
