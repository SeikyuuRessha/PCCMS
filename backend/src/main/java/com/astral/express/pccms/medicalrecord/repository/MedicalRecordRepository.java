package com.astral.express.pccms.medicalrecord.repository;

import com.astral.express.pccms.medicalrecord.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, UUID> {
    List<MedicalRecord> findByVetIdOrderByCreatedAtDesc(UUID vetId);
    List<MedicalRecord> findAllByOrderByCreatedAtDesc();
    Optional<MedicalRecord> findByAppointmentId(UUID appointmentId);
}


