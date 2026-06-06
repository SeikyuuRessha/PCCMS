package com.astral.express.pccms.medicine.repository;

import com.astral.express.pccms.medicine.entity.Medicine;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, UUID>, JpaSpecificationExecutor<Medicine> {

    boolean existsByMedicineCodeIgnoreCase(String medicineCode);

    boolean existsByMedicineCodeIgnoreCaseAndIdNot(String medicineCode, UUID id);

    boolean existsByNameIgnoreCaseAndUnitIgnoreCase(String name, String unit);

    boolean existsByNameIgnoreCaseAndUnitIgnoreCaseAndIdNot(String name, String unit, UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT m FROM Medicine m WHERE m.id = :id AND m.isActive = true")
    Optional<Medicine> findByIdWithLock(UUID id);

    @Query(value = "SELECT COUNT(*) FROM prescription_items WHERE medicine_id = :medicineId", nativeQuery = true)
    long countPrescriptionItems(@Param("medicineId") UUID medicineId);
}
