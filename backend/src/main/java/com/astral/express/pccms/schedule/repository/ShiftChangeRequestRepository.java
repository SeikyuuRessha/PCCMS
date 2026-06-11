package com.astral.express.pccms.schedule.repository;

import com.astral.express.pccms.schedule.entity.ShiftChangeRequest;
import com.astral.express.pccms.schedule.entity.ShiftRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ShiftChangeRequestRepository extends JpaRepository<ShiftChangeRequest, UUID> {
    @EntityGraph(attributePaths = {"schedule", "requestedBy", "targetStaff", "resolvedBy"})
    Page<ShiftChangeRequest> findByRequestedById(UUID requestedBy, Pageable pageable);

    @EntityGraph(attributePaths = {"schedule", "requestedBy", "targetStaff", "resolvedBy"})
    Page<ShiftChangeRequest> findByRequestedByIdAndStatusCode(
            UUID requestedBy,
            ShiftRequestStatus statusCode,
            Pageable pageable);

    boolean existsByScheduleIdAndRequestedByIdAndStatusCode(
            UUID scheduleId,
            UUID requestedBy,
            ShiftRequestStatus statusCode);

}
