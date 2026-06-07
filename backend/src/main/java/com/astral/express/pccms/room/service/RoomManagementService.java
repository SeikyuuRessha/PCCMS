package com.astral.express.pccms.room.service;

import com.astral.express.pccms.common.dto.PageResponse;
import com.astral.express.pccms.room.dto.request.RoomRequest;
import com.astral.express.pccms.room.dto.response.RoomResponse;
import com.astral.express.pccms.room.entity.RoomStatus;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface RoomManagementService {
    PageResponse<RoomResponse> searchRooms(UUID roomTypeId, RoomStatus statusCode, Pageable pageable);

    RoomResponse createRoom(RoomRequest request);

    RoomResponse updateRoom(UUID roomId, RoomRequest request);

    RoomResponse updateRoomStatus(UUID roomId, RoomStatus statusCode);

    RoomResponse deactivateRoom(UUID roomId);
}
