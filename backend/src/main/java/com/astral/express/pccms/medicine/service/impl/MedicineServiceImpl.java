package com.astral.express.pccms.medicine.service.impl;

import com.astral.express.pccms.common.exception.BusinessException;
import com.astral.express.pccms.common.exception.ErrorCode;
import com.astral.express.pccms.common.dto.PageResponse;
import com.astral.express.pccms.medicine.dto.request.AddStockRequest;
import com.astral.express.pccms.medicine.dto.request.MedicineCreateRequest;
import com.astral.express.pccms.medicine.dto.request.MedicineUpdateRequest;
import com.astral.express.pccms.medicine.dto.response.MedicineResponse;
import com.astral.express.pccms.medicine.entity.Medicine;
import com.astral.express.pccms.medicine.entity.MedicineCategory;
import com.astral.express.pccms.medicine.mapper.MedicineMapper;
import com.astral.express.pccms.medicine.repository.MedicineCategoryRepository;
import com.astral.express.pccms.medicine.repository.MedicineRepository;
import com.astral.express.pccms.medicine.service.MedicineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MedicineServiceImpl implements MedicineService {

    private final MedicineRepository medicineRepository;
    private final MedicineCategoryRepository categoryRepository;
    private final MedicineMapper medicineMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MedicineResponse> searchMedicines(
            String keyword,
            UUID categoryId,
            Boolean isActive,
            Pageable pageable) {
        Specification<Medicine> specification = combine(
                keywordContains(keyword),
                categoryEquals(categoryId),
                activeEquals(isActive)
        );
        Page<Medicine> page = medicineRepository.findAll(specification, pageable);
        return PageResponse.of(page.map(medicineMapper::toMedicineResponse));
    }

    @Override
    @Transactional
    public MedicineResponse createMedicine(MedicineCreateRequest request) {
        validateStockAndPrice(request.currentStock(), request.unitPriceVnd());
        validateUniqueMedicineCode(request.medicineCode());
        validateUniqueNameAndUnit(request.name(), request.unit());
        MedicineCategory category = null;
        if (request.categoryId() != null) {
            category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.ERR_MED_006_MEDICINE_CATEGORY_NOT_FOUND));
            validateActiveCategory(category);
        }

        Medicine medicine = medicineMapper.toMedicine(request);
        medicine.setIsActive(request.isActive() == null || request.isActive());
        medicine.setCategory(category);
        
        medicine = medicineRepository.save(medicine);
        log.info("Created new medicine: {}", medicine.getId());
        return medicineMapper.toMedicineResponse(medicine);
    }

    @Override
    @Transactional
    public MedicineResponse updateMedicine(UUID id, MedicineUpdateRequest request) {
        validateStockAndPrice(request.currentStock(), request.unitPriceVnd());

        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_MED_004_MEDICINE_NOT_FOUND));

        if (medicineRepository.existsByMedicineCodeIgnoreCaseAndIdNot(request.medicineCode(), id)) {
            throw new BusinessException(ErrorCode.ERR_MED_005_MEDICINE_CODE_EXISTS);
        }

        if (medicineRepository.existsByNameIgnoreCaseAndUnitIgnoreCaseAndIdNot(request.name(), request.unit(), id)) {
            throw new BusinessException(ErrorCode.ERR_VALIDATION_FAILED);
        }

        medicineMapper.updateMedicineFromRequest(request, medicine);
        if (request.isActive() != null) {
            medicine.setIsActive(request.isActive());
        }
        
        if (request.categoryId() != null) {
            MedicineCategory category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.ERR_MED_006_MEDICINE_CATEGORY_NOT_FOUND));
            validateActiveCategory(category);
            medicine.setCategory(category);
        }
        
        medicine = medicineRepository.save(medicine);
        log.info("Updated medicine: {}", medicine.getId());
        return medicineMapper.toMedicineResponse(medicine);
    }

    @Override
    @Transactional(readOnly = true)
    public MedicineResponse getMedicine(UUID id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_MED_004_MEDICINE_NOT_FOUND));
        return medicineMapper.toMedicineResponse(medicine);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MedicineResponse> getAllMedicines(Pageable pageable) {
        return searchMedicines(null, null, null, pageable);
    }

    @Override
    @Transactional
    public void deleteMedicine(UUID id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_MED_004_MEDICINE_NOT_FOUND));
        if (medicineRepository.countPrescriptionItems(id) > 0) {
            throw new BusinessException(ErrorCode.ERR_VALIDATION_FAILED);
        }
        
        medicine.setIsActive(false);
        medicineRepository.save(medicine);
        log.info("Deleted (soft) medicine: {}", id);
    }

    @Override
    @Transactional
    public MedicineResponse addStock(UUID id, AddStockRequest request) {
        if (request.quantityToAdd() <= 0) {
            throw new BusinessException(ErrorCode.ERR_VALIDATION_FAILED);
        }

        Medicine medicine = medicineRepository.findByIdWithLock(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_MED_004_MEDICINE_NOT_FOUND));
        
        medicine.setCurrentStock(medicine.getCurrentStock() + request.quantityToAdd());
        medicine = medicineRepository.save(medicine);
        log.info("Added {} stock to medicine: {}", request.quantityToAdd(), id);
        return medicineMapper.toMedicineResponse(medicine);
    }

    private void validateStockAndPrice(Integer currentStock, BigDecimal unitPriceVnd) {
        if (currentStock == null || unitPriceVnd == null
                || currentStock < 0 || unitPriceVnd.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException(ErrorCode.ERR_VALIDATION_FAILED);
        }
    }

    private void validateUniqueMedicineCode(String medicineCode) {
        if (medicineRepository.existsByMedicineCodeIgnoreCase(medicineCode)) {
            throw new BusinessException(ErrorCode.ERR_MED_005_MEDICINE_CODE_EXISTS);
        }
    }

    private void validateUniqueNameAndUnit(String name, String unit) {
        if (medicineRepository.existsByNameIgnoreCaseAndUnitIgnoreCase(name, unit)) {
            throw new BusinessException(ErrorCode.ERR_VALIDATION_FAILED);
        }
    }

    private void validateActiveCategory(MedicineCategory category) {
        if (!Boolean.TRUE.equals(category.getIsActive())) {
            throw new BusinessException(ErrorCode.ERR_VALIDATION_FAILED);
        }
    }

    private Specification<Medicine> keywordContains(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return null;
        }
        String normalizedKeyword = keyword.trim().toLowerCase();
        String pattern = "%" + normalizedKeyword + "%";
        return (root, query, criteriaBuilder) -> criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(root.get("medicineCode")), pattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), pattern)
        );
    }

    private Specification<Medicine> categoryEquals(UUID categoryId) {
        if (categoryId == null) {
            return null;
        }
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("category").get("id"), categoryId);
    }

    private Specification<Medicine> activeEquals(Boolean isActive) {
        if (isActive == null) {
            return null;
        }
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("isActive"), isActive);
    }

    @SafeVarargs
    private final Specification<Medicine> combine(Specification<Medicine>... specifications) {
        List<Specification<Medicine>> activeSpecifications = new ArrayList<>();
        for (Specification<Medicine> specification : specifications) {
            if (specification != null) {
                activeSpecifications.add(specification);
            }
        }
        if (activeSpecifications.isEmpty()) {
            return null;
        }
        Specification<Medicine> combined = activeSpecifications.getFirst();
        for (int index = 1; index < activeSpecifications.size(); index++) {
            combined = combined.and(activeSpecifications.get(index));
        }
        return combined;
    }
}
