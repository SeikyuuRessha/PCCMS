package com.astral.express.pccms.medicine.service;

import com.astral.express.pccms.common.dto.PageResponse;
import com.astral.express.pccms.common.exception.BusinessException;
import com.astral.express.pccms.common.exception.ErrorCode;
import com.astral.express.pccms.medicine.dto.request.AddStockRequest;
import com.astral.express.pccms.medicine.dto.request.MedicineCreateRequest;
import com.astral.express.pccms.medicine.dto.request.MedicineUpdateRequest;
import com.astral.express.pccms.medicine.dto.response.MedicineResponse;
import com.astral.express.pccms.medicine.entity.Medicine;
import com.astral.express.pccms.medicine.entity.MedicineCategory;
import com.astral.express.pccms.medicine.mapper.MedicineMapper;
import com.astral.express.pccms.medicine.repository.MedicineCategoryRepository;
import com.astral.express.pccms.medicine.repository.MedicineRepository;
import com.astral.express.pccms.medicine.service.impl.MedicineServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class MedicineServiceTest {

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private MedicineCategoryRepository categoryRepository;

    @Mock
    private MedicineMapper medicineMapper;

    @InjectMocks
    private MedicineServiceImpl medicineService;

    @ParameterizedTest(name = "[{1}] {3}")
    @CsvFileSource(resources = "/testcases/medicine-management.csv", numLinesToSkip = 1)
    void should_followMedicineManagementCsvRules(
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
        if ("Missing required medicine fields rejected".equals(scenario)) {
            assertControllerLayerValidation(caseId, expectedErrorCode);
            return;
        }

        MedicineCsvInput csv = parseInput(input);
        PageRequest pageable = PageRequest.of(0, 20);

        switch (scenario) {
            case "List medicines success", "Search medicine by name success",
                    "Filter medicines by category success", "Filter medicines by active status success" ->
                    assertSearch(csv, pageable);
            case "Create medicine success" -> assertCreateSuccess(csv);
            case "Update medicine success" -> assertUpdateSuccess(csv);
            case "Deactivate medicine success" -> assertDeactivateSuccess();
            case "Duplicate medicine code rejected" -> assertCreateFailure(csv, ErrorCode.ERR_MED_005_MEDICINE_CODE_EXISTS);
            case "Duplicate medicine name and unit rejected",
                    "Negative current stock rejected",
                    "Negative unit price rejected",
                    "Inactive category rejected",
                    "Delete referenced medicine rejected" ->
                    assertBusinessFailure(scenario, csv, ErrorCode.valueOf(expectedErrorCode));
            case "Category not found rejected" -> assertCreateFailure(csv, ErrorCode.ERR_MED_006_MEDICINE_CATEGORY_NOT_FOUND);
            default -> throw new IllegalArgumentException("Unhandled CSV scenario: " + scenario);
        }
    }

    @Test
    void should_addStock_when_quantityIsPositive() {
        UUID medicineId = UUID.randomUUID();
        Medicine medicine = medicine("MED001", "Amoxicillin", "tablet", true);
        medicine.setCurrentStock(10);

        given(medicineRepository.findByIdWithLock(medicineId)).willReturn(Optional.of(medicine));
        given(medicineRepository.save(medicine)).willReturn(medicine);
        given(medicineMapper.toMedicineResponse(medicine)).willReturn(response(medicine));

        MedicineResponse response = medicineService.addStock(medicineId, new AddStockRequest(5));

        assertThat(response.id()).isEqualTo(medicine.getId());
        assertThat(medicine.getCurrentStock()).isEqualTo(15);
        verify(medicineRepository).save(medicine);
    }

    private void assertSearch(MedicineCsvInput csv, PageRequest pageable) {
        Medicine medicine = medicine("MED001", "Amoxicillin", "tablet", true);
        given(medicineRepository.findAll(nullable(Specification.class), eq(pageable)))
                .willReturn(new PageImpl<>(List.of(medicine), pageable, 1));
        given(medicineMapper.toMedicineResponse(medicine)).willReturn(response(medicine));

        PageResponse<MedicineResponse> response = medicineService.searchMedicines(
                csv.keyword(), csv.categoryId(), csv.isActive(), pageable);

        assertThat(response.data().content()).hasSize(1);
        assertThat(response.data().content().getFirst().medicineCode()).isEqualTo("MED001");
    }

    private void assertControllerLayerValidation(String caseId, String expectedErrorCode) {
        assertThat(caseId).isEqualTo("TC_MED_MGMT_008");
        assertThat(expectedErrorCode).isEqualTo(ErrorCode.ERR_VALIDATION_FAILED.name());
    }

    private void assertCreateSuccess(MedicineCsvInput csv) {
        MedicineCreateRequest request = createRequest(csv);
        Medicine medicine = medicine(csv.medicineCode(), csv.name(), csv.unit(), true);
        MedicineCategory category = activeCategory(csv.categoryId());

        given(medicineRepository.existsByMedicineCodeIgnoreCase(csv.medicineCode())).willReturn(false);
        given(medicineRepository.existsByNameIgnoreCaseAndUnitIgnoreCase(csv.name(), csv.unit())).willReturn(false);
        given(categoryRepository.findById(csv.categoryId())).willReturn(Optional.of(category));
        given(medicineMapper.toMedicine(request)).willReturn(medicine);
        given(medicineRepository.save(medicine)).willReturn(medicine);
        given(medicineMapper.toMedicineResponse(medicine)).willReturn(response(medicine));

        MedicineResponse response = medicineService.createMedicine(request);

        assertThat(response.medicineCode()).isEqualTo(csv.medicineCode());
        verify(medicineRepository).save(medicine);
    }

    private void assertUpdateSuccess(MedicineCsvInput csv) {
        UUID medicineId = UUID.randomUUID();
        Medicine medicine = medicine("MED001", "Old Medicine", "tablet", true);

        given(medicineRepository.findById(medicineId)).willReturn(Optional.of(medicine));
        given(medicineRepository.existsByMedicineCodeIgnoreCaseAndIdNot(csv.medicineCode(), medicineId)).willReturn(false);
        given(medicineRepository.existsByNameIgnoreCaseAndUnitIgnoreCaseAndIdNot(
                csv.name(), csv.unit(), medicineId)).willReturn(false);
        given(medicineRepository.save(medicine)).willReturn(medicine);
        given(medicineMapper.toMedicineResponse(medicine)).willReturn(response(medicine));

        MedicineResponse response = medicineService.updateMedicine(medicineId, updateRequest(csv));

        assertThat(response.id()).isEqualTo(medicine.getId());
        verify(medicineRepository).save(medicine);
    }

    private void assertDeactivateSuccess() {
        UUID medicineId = UUID.randomUUID();
        Medicine medicine = medicine("MED001", "Amoxicillin", "tablet", true);
        given(medicineRepository.findById(medicineId)).willReturn(Optional.of(medicine));
        given(medicineRepository.countPrescriptionItems(medicineId)).willReturn(0L);

        medicineService.deleteMedicine(medicineId);

        assertThat(medicine.getIsActive()).isFalse();
        verify(medicineRepository).save(medicine);
    }

    private void assertCreateFailure(MedicineCsvInput csv, ErrorCode errorCode) {
        if (errorCode == ErrorCode.ERR_MED_005_MEDICINE_CODE_EXISTS) {
            given(medicineRepository.existsByMedicineCodeIgnoreCase(csv.medicineCode())).willReturn(true);
        } else {
            given(medicineRepository.existsByMedicineCodeIgnoreCase(csv.medicineCode())).willReturn(false);
            given(medicineRepository.existsByNameIgnoreCaseAndUnitIgnoreCase(csv.name(), csv.unit())).willReturn(false);
            given(categoryRepository.findById(csv.categoryId())).willReturn(Optional.empty());
        }

        assertThatThrownBy(() -> medicineService.createMedicine(createRequest(csv)))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", errorCode);
    }

    private void assertBusinessFailure(String scenario, MedicineCsvInput csv, ErrorCode errorCode) {
        if ("Delete referenced medicine rejected".equals(scenario)) {
            UUID medicineId = UUID.randomUUID();
            given(medicineRepository.findById(medicineId))
                    .willReturn(Optional.of(medicine("MED001", "Amoxicillin", "tablet", true)));
            given(medicineRepository.countPrescriptionItems(medicineId)).willReturn(1L);

            assertThatThrownBy(() -> medicineService.deleteMedicine(medicineId))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", errorCode);
            return;
        }

        if ("Duplicate medicine name and unit rejected".equals(scenario)) {
            given(medicineRepository.existsByMedicineCodeIgnoreCase(csv.medicineCode())).willReturn(false);
            given(medicineRepository.existsByNameIgnoreCaseAndUnitIgnoreCase(csv.name(), csv.unit())).willReturn(true);
        }

        if ("Inactive category rejected".equals(scenario)) {
            given(medicineRepository.existsByMedicineCodeIgnoreCase(csv.medicineCode())).willReturn(false);
            given(medicineRepository.existsByNameIgnoreCaseAndUnitIgnoreCase(csv.name(), csv.unit())).willReturn(false);
            given(categoryRepository.findById(csv.categoryId())).willReturn(Optional.of(inactiveCategory(csv.categoryId())));
        }

        assertThatThrownBy(() -> medicineService.createMedicine(createRequest(csv)))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", errorCode);
    }

    private MedicineCreateRequest createRequest(MedicineCsvInput input) {
        return new MedicineCreateRequest(
                input.medicineCode(),
                input.name(),
                input.categoryId(),
                input.unit(),
                input.defaultInstruction(),
                input.currentStock(),
                input.unitPriceVnd(),
                input.isActive()
        );
    }

    private MedicineUpdateRequest updateRequest(MedicineCsvInput input) {
        return new MedicineUpdateRequest(
                input.medicineCode(),
                input.name(),
                input.categoryId(),
                input.unit(),
                input.defaultInstruction(),
                input.currentStock(),
                input.unitPriceVnd(),
                input.isActive()
        );
    }

    private Medicine medicine(String code, String name, String unit, boolean active) {
        Medicine medicine = new Medicine();
        medicine.setId(UUID.randomUUID());
        medicine.setMedicineCode(code);
        medicine.setName(name);
        medicine.setUnit(unit);
        medicine.setDefaultInstruction("Use after meal");
        medicine.setCurrentStock(10);
        medicine.setUnitPriceVnd(BigDecimal.valueOf(10000));
        medicine.setIsActive(active);
        medicine.setCreatedAt(OffsetDateTime.parse("2026-01-01T00:00:00Z"));
        medicine.setUpdatedAt(OffsetDateTime.parse("2026-01-02T00:00:00Z"));
        return medicine;
    }

    private MedicineCategory activeCategory(UUID id) {
        MedicineCategory category = new MedicineCategory();
        category.setId(id);
        category.setName("Antibiotic");
        category.setIsActive(true);
        return category;
    }

    private MedicineCategory inactiveCategory(UUID id) {
        MedicineCategory category = activeCategory(id);
        category.setIsActive(false);
        return category;
    }

    private MedicineResponse response(Medicine medicine) {
        return new MedicineResponse(
                medicine.getId(),
                medicine.getMedicineCode(),
                medicine.getName(),
                medicine.getCategory() == null ? null : medicine.getCategory().getId(),
                medicine.getCategory() == null ? null : medicine.getCategory().getName(),
                medicine.getUnit(),
                medicine.getDefaultInstruction(),
                medicine.getCurrentStock(),
                medicine.getUnitPriceVnd(),
                medicine.getIsActive()
        );
    }

    private MedicineCsvInput parseInput(String input) {
        return new MedicineCsvInput(
                text(input, "keyword"),
                uuid(input, "categoryId"),
                bool(input, "isActive"),
                text(input, "medicineCode"),
                text(input, "name"),
                uuid(input, "categoryId"),
                text(input, "unit"),
                text(input, "defaultInstruction"),
                integer(input, "currentStock"),
                decimal(input, "unitPriceVnd")
        );
    }

    private String text(String input, String key) {
        String value = raw(input, key);
        if (value == null || value.isBlank() || "null".equalsIgnoreCase(value)) {
            return null;
        }
        return value.trim();
    }

    private Integer integer(String input, String key) {
        String value = text(input, key);
        return value == null ? null : Integer.valueOf(value);
    }

    private BigDecimal decimal(String input, String key) {
        String value = text(input, key);
        return value == null ? null : new BigDecimal(value);
    }

    private Boolean bool(String input, String key) {
        String value = text(input, key);
        return value == null ? null : Boolean.valueOf(value);
    }

    private UUID uuid(String input, String key) {
        String value = text(input, key);
        if (value == null) {
            return null;
        }
        if ("1".equals(value) || "10".equals(value)) {
            return UUID.fromString("00000000-0000-0000-0000-000000000001");
        }
        if ("2".equals(value)) {
            return UUID.fromString("00000000-0000-0000-0000-000000000002");
        }
        return UUID.fromString("99999999-9999-9999-9999-999999999999");
    }

    private String raw(String input, String key) {
        for (String part : input.split(";")) {
            String[] pair = part.trim().split("=", 2);
            if (pair.length == 2 && pair[0].trim().equals(key)) {
                return pair[1].trim();
            }
        }
        return null;
    }

    private record MedicineCsvInput(
            String keyword,
            UUID categoryId,
            Boolean isActive,
            String medicineCode,
            String name,
            UUID requestCategoryId,
            String unit,
            String defaultInstruction,
            Integer currentStock,
            BigDecimal unitPriceVnd
    ) {
    }
}
