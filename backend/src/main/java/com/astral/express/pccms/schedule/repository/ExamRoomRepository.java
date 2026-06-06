package com.astral.express.pccms.schedule.repository;

import com.astral.express.pccms.schedule.entity.ExamRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExamRoomRepository extends JpaRepository<ExamRoom, UUID> {
    List<ExamRoom> findByIsActiveTrueOrderByRoomCodeAsc();
}
