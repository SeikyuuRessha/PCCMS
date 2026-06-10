package com.astral.express.pccms.medicine.controller;

import com.astral.express.pccms.common.exception.GlobalExceptionHandler;
import com.astral.express.pccms.medicine.dto.request.CreateMedicineUsageTemplateRequest;
import com.astral.express.pccms.medicine.dto.request.UpdateMedicineUsageTemplateRequest;
import com.astral.express.pccms.medicine.dto.response.MedicineUsageTemplateResponse;
import com.astral.express.pccms.medicine.service.MedicineUsageTemplateService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willDoNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class MedicineUsageTemplateControllerTest {

    private MockMvc mockMvc;

    @Mock
    private MedicineUsageTemplateService templateService;

    @InjectMocks
    private MedicineUsageTemplateController controller;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void should_CreateTemplate_when_ValidRequest() throws Exception {
        UUID medicineId = UUID.randomUUID();
        UUID templateId = UUID.randomUUID();
        
        CreateMedicineUsageTemplateRequest request = new CreateMedicineUsageTemplateRequest(
                "Twice a day", "1 pill", "Twice daily", 7, "Take after meals", false, 0
        );

        MedicineUsageTemplateResponse response = new MedicineUsageTemplateResponse(
                templateId, medicineId, "Twice a day", "1 pill", "Twice daily", 7, "Take after meals", false, 0, true
        );

        given(templateService.createTemplate(eq(medicineId), any(CreateMedicineUsageTemplateRequest.class)))
                .willReturn(response);

        mockMvc.perform(post("/api/v1/medicines/{medicineId}/usage-templates", medicineId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(templateId.toString()))
                .andExpect(jsonPath("$.data.label").value("Twice a day"));
    }

    @Test
    void should_UpdateTemplate_when_ValidRequest() throws Exception {
        UUID medicineId = UUID.randomUUID();
        UUID templateId = UUID.randomUUID();

        UpdateMedicineUsageTemplateRequest request = new UpdateMedicineUsageTemplateRequest(
                "Once a day", "2 pills", "Once daily", 3, "Take with water", true, 1, true
        );

        MedicineUsageTemplateResponse response = new MedicineUsageTemplateResponse(
                templateId, medicineId, "Once a day", "2 pills", "Once daily", 3, "Take with water", true, 1, true
        );

        given(templateService.updateTemplate(eq(medicineId), eq(templateId), any(UpdateMedicineUsageTemplateRequest.class)))
                .willReturn(response);

        mockMvc.perform(put("/api/v1/medicines/{medicineId}/usage-templates/{templateId}", medicineId, templateId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.label").value("Once a day"));
    }

    @Test
    void should_DeleteTemplate_when_ValidRequest() throws Exception {
        UUID medicineId = UUID.randomUUID();
        UUID templateId = UUID.randomUUID();

        willDoNothing().given(templateService).deleteTemplate(medicineId, templateId);

        mockMvc.perform(delete("/api/v1/medicines/{medicineId}/usage-templates/{templateId}", medicineId, templateId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void should_ReturnTemplateList_when_MedicineExists() throws Exception {
        UUID medicineId = UUID.randomUUID();
        UUID templateId = UUID.randomUUID();

        MedicineUsageTemplateResponse response = new MedicineUsageTemplateResponse(
                templateId, medicineId, "Morning", "1 pill", "Morning", 5, "Take empty stomach", false, 0, true
        );

        given(templateService.listByMedicine(medicineId)).willReturn(List.of(response));

        mockMvc.perform(get("/api/v1/medicines/{medicineId}/usage-templates", medicineId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].label").value("Morning"));
    }
}
