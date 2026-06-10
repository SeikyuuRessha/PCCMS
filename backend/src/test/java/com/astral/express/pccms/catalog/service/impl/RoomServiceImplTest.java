package com.astral.express.pccms.catalog.service.impl;

import com.astral.express.pccms.catalog.dto.request.CreateRoomRequest;
import com.astral.express.pccms.catalog.dto.response.RoomResponse;
import com.astral.express.pccms.room.entity.Room;
import com.astral.express.pccms.room.entity.RoomStatus;
import com.astral.express.pccms.room.entity.RoomType;
import com.astral.express.pccms.room.repository.RoomRepository;
import com.astral.express.pccms.room.repository.RoomTypeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class RoomServiceImplTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private RoomTypeRepository roomTypeRepository;

    @InjectMocks
    private RoomServiceImpl roomService;

    @Test
    void should_GenerateRoomCode_When_RoomCodeIsBlank() {
        // GIVEN
        UUID typeId = UUID.randomUUID();
        CreateRoomRequest request = new CreateRoomRequest(
                "", "Phòng VIP 1", typeId, 10, RoomStatus.AVAILABLE, 1, "Mô tả"
        );

        RoomType roomType = new RoomType();
        roomType.setId(typeId);
        roomType.setName("Phòng VIP");

        given(roomTypeRepository.findById(typeId)).willReturn(Optional.of(roomType));
        given(roomRepository.existsByRoomCodeIgnoreCase(any(String.class))).willReturn(false);
        given(roomRepository.existsByName(request.name())).willReturn(false);

        Room savedRoom = new Room();
        savedRoom.setId(UUID.randomUUID());
        savedRoom.setName("Phòng VIP 1");
        savedRoom.setRoomCode("ROOM20230101120000"); // Mocked
        savedRoom.setRoomType(roomType);
        savedRoom.setStatusCode(RoomStatus.AVAILABLE);

        given(roomRepository.save(any(Room.class))).willReturn(savedRoom);

        // WHEN
        RoomResponse response = roomService.create(request);

        // THEN
        ArgumentCaptor<Room> roomCaptor = ArgumentCaptor.forClass(Room.class);
        verify(roomRepository).save(roomCaptor.capture());
        
        Room capturedRoom = roomCaptor.getValue();
        assertThat(capturedRoom.getRoomCode()).startsWith("ROOM");
        assertThat(capturedRoom.getRoomCode().length()).isEqualTo(18); // ROOM + 14 digits
        assertThat(response).isNotNull();
    }
}
