package com.astral.express.pccms.room.repository;

import com.astral.express.pccms.room.entity.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID>, JpaSpecificationExecutor<Room> {

    boolean existsByRoomCodeIgnoreCase(String roomCode);

    boolean existsByRoomCodeIgnoreCaseAndIdNot(String roomCode, UUID id);

    @Query(value = "SELECT COUNT(*) FROM room_allocations WHERE room_id = :roomId", nativeQuery = true)
    long countRoomAllocations(@Param("roomId") UUID roomId);

    @Query(
            value = """
                    SELECT r.*
                    FROM rooms r
                    WHERE (:roomTypeId IS NULL OR r.room_type_id = :roomTypeId)
                      AND (:statusCode IS NULL OR r.status_code = CAST(:statusCode AS room_status_enum))
                    ORDER BY r.created_at DESC
                    """,
            countQuery = """
                    SELECT COUNT(*)
                    FROM rooms r
                    WHERE (:roomTypeId IS NULL OR r.room_type_id = :roomTypeId)
                      AND (:statusCode IS NULL OR r.status_code = CAST(:statusCode AS room_status_enum))
                    """,
            nativeQuery = true)
    Page<Room> searchRooms(
            @Param("roomTypeId") UUID roomTypeId,
            @Param("statusCode") String statusCode,
            Pageable pageable);
}
