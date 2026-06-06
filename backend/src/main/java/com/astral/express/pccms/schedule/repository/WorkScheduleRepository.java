package com.astral.express.pccms.schedule.repository;

import com.astral.express.pccms.schedule.entity.WorkSchedule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.UUID;

@Repository
public interface WorkScheduleRepository extends JpaRepository<WorkSchedule, UUID> {
    @EntityGraph(attributePaths = {"staff", "shift", "role", "examRoom", "station"})
    Page<WorkSchedule> findByWorkDateBetween(LocalDate fromDate, LocalDate toDate, Pageable pageable);

    @EntityGraph(attributePaths = {"staff", "shift", "role", "examRoom", "station"})
    Page<WorkSchedule> findByStaffIdAndWorkDateBetween(
            UUID staffId,
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable);

    boolean existsByStaffIdAndWorkDateAndShiftId(UUID staffId, LocalDate workDate, UUID shiftId);

    boolean existsByStaffIdAndWorkDateAndShiftIdAndIdNot(
            UUID staffId,
            LocalDate workDate,
            UUID shiftId,
            UUID id);
}
