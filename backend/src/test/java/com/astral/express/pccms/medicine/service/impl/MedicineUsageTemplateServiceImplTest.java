package com.astral.express.pccms.medicine.service.impl;

import com.astral.express.pccms.common.exception.BusinessException;
import com.astral.express.pccms.common.exception.ErrorCode;
import com.astral.express.pccms.medicine.dto.request.CreateMedicineUsageTemplateRequest;
import com.astral.express.pccms.medicine.dto.request.UpdateMedicineUsageTemplateRequest;
import com.astral.express.pccms.medicine.dto.response.MedicineUsageTemplateResponse;
import com.astral.express.pccms.medicine.entity.Medicine;
import com.astral.express.pccms.medicine.entity.MedicineUsageTemplate;
import com.astral.express.pccms.medicine.repository.MedicineRepository;
import com.astral.express.pccms.medicine.repository.MedicineUsageTemplateRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
class MedicineUsageTemplateServiceImplTest {

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private MedicineUsageTemplateRepository templateRepository;

    @InjectMocks
    private MedicineUsageTemplateServiceImpl templateService;

    @Test
    void should_CreateTemplate_when_ValidRequest() {
        UUID medicineId = UUID.randomUUID();
        CreateMedicineUsageTemplateRequest request = new CreateMedicineUsageTemplateRequest(
                "Label", "Dosage", "Freq", 3, "Inst", true, 1
        );

        Medicine medicine = new Medicine();
        medicine.setId(medicineId);

        given(medicineRepository.findById(medicineId)).willReturn(Optional.of(medicine));
        given(templateRepository.existsByLabelAndMedicineId("Label", medicineId)).willReturn(false);
        
        MedicineUsageTemplate savedTemplate = new MedicineUsageTemplate(
                UUID.randomUUID(), medicine, "Label", "Dosage", "Freq", 3, "Inst", true, 1, true
        );
        given(templateRepository.save(any(MedicineUsageTemplate.class))).willReturn(savedTemplate);

        MedicineUsageTemplateResponse response = templateService.createTemplate(medicineId, request);

        assertThat(response).isNotNull();
        assertThat(response.label()).isEqualTo("Label");
    }

    @Test
    void should_ThrowException_when_CreatingDuplicateTemplate() {
        UUID medicineId = UUID.randomUUID();
        CreateMedicineUsageTemplateRequest request = new CreateMedicineUsageTemplateRequest(
                "Label", "Dosage", "Freq", 3, "Inst", true, 1
        );

        Medicine medicine = new Medicine();
        medicine.setId(medicineId);

        given(medicineRepository.findById(medicineId)).willReturn(Optional.of(medicine));
        given(templateRepository.existsByLabelAndMedicineId("Label", medicineId)).willReturn(true);

        assertThatThrownBy(() -> templateService.createTemplate(medicineId, request))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.ERR_MED_012_TEMPLATE_NAME_EXISTS);
    }

    @Test
    void should_UpdateTemplate_when_ValidRequest() {
        UUID medicineId = UUID.randomUUID();
        UUID templateId = UUID.randomUUID();
        
        UpdateMedicineUsageTemplateRequest request = new UpdateMedicineUsageTemplateRequest(
                "Label", "Dosage", "Freq", 3, "Inst", true, 1, true
        );

        Medicine medicine = new Medicine();
        medicine.setId(medicineId);

        MedicineUsageTemplate existingTemplate = new MedicineUsageTemplate(
                templateId, medicine, "Old Label", null, null, null, "Old Inst", false, 0, true
        );

        given(templateRepository.findById(templateId)).willReturn(Optional.of(existingTemplate));
        given(templateRepository.existsByLabelAndMedicineIdAndIdNot("Label", medicineId, templateId)).willReturn(false);
        given(templateRepository.save(any(MedicineUsageTemplate.class))).willReturn(existingTemplate);

        MedicineUsageTemplateResponse response = templateService.updateTemplate(medicineId, templateId, request);

        assertThat(response.label()).isEqualTo("Label");
        assertThat(response.instruction()).isEqualTo("Inst");
    }

    @Test
    void should_DeleteTemplate_when_ValidRequest() {
        UUID medicineId = UUID.randomUUID();
        UUID templateId = UUID.randomUUID();

        Medicine medicine = new Medicine();
        medicine.setId(medicineId);

        MedicineUsageTemplate existingTemplate = new MedicineUsageTemplate(
                templateId, medicine, "Label", null, null, null, "Inst", false, 0, true
        );

        given(templateRepository.findById(templateId)).willReturn(Optional.of(existingTemplate));

        templateService.deleteTemplate(medicineId, templateId);

        assertThat(existingTemplate.getIsActive()).isFalse();
        verify(templateRepository).save(existingTemplate);
    }

    @Test
    void should_ListTemplates_when_ValidMedicineId() {
        UUID medicineId = UUID.randomUUID();
        Medicine medicine = new Medicine();
        medicine.setId(medicineId);

        MedicineUsageTemplate template = new MedicineUsageTemplate(
                UUID.randomUUID(), medicine, "Label", null, null, null, "Inst", false, 0, true
        );

        given(templateRepository.findByMedicineIdAndIsActiveTrueOrderBySortOrderAsc(medicineId))
                .willReturn(List.of(template));

        List<MedicineUsageTemplateResponse> list = templateService.listByMedicine(medicineId);

        assertThat(list).hasSize(1);
        assertThat(list.get(0).label()).isEqualTo("Label");
    }
}
