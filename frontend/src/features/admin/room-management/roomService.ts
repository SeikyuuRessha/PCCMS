import { mockRooms } from "./mockRooms";
import type { BoardingRoom, RoomFormValues, RoomSearchParams, RoomStatus, RoomType } from "./types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let roomsStore: BoardingRoom[] = mockRooms.map((room) => ({ ...room }));

const cloneRoom = (room: BoardingRoom): BoardingRoom => ({ ...room });

const isValidPositiveInteger = (value: string) => /^[1-9]\d*$/.test(value.trim());

const findDuplicate = (payload: RoomFormValues, excludeId?: string) =>
    roomsStore.find(
        (room) =>
            room.id !== excludeId &&
            (room.code.trim().toLowerCase() === payload.code.trim().toLowerCase() ||
                room.name.trim().toLowerCase() === payload.name.trim().toLowerCase())
    );

const validateRequiredFields = (payload: RoomFormValues) => {
    if (!payload.code.trim() || !payload.name.trim() || !payload.type || !payload.capacity.trim() || !payload.status) {
        throw new Error("Vui lòng nhập đầy đủ thông tin bắt buộc");
    }
};

const normalizeRoomType = (value: string) => value as RoomType;
const normalizeRoomStatus = (value: string) => value as RoomStatus;

export const getRooms = async () => {
    await delay(250);
    return roomsStore.map((room) => cloneRoom(room));
};

export const searchRooms = async (params: RoomSearchParams) => {
    await delay(300);
    const keyword = params.keyword.trim().toLowerCase();

    return roomsStore.filter((room) => {
        const matchesKeyword = !keyword || room.code.toLowerCase().includes(keyword) || room.name.toLowerCase().includes(keyword);
        const matchesType = !params.type || room.type === params.type;
        const matchesStatus = !params.status || room.status === params.status;
        const matchesCapacity = !params.capacity || String(room.capacity) === params.capacity.trim();
        return matchesKeyword && matchesType && matchesStatus && matchesCapacity;
    }).map((room) => cloneRoom(room));
};

export const createRoom = async (payload: RoomFormValues) => {
    await delay(300);
    validateRequiredFields(payload);

    if (!isValidPositiveInteger(payload.capacity)) {
        throw new Error("Sức chứa phải là số nguyên dương");
    }

    if (findDuplicate(payload)) {
        throw new Error("Mã phòng hoặc tên phòng đã tồn tại");
    }

    const room: BoardingRoom = {
        id: `ROOM-${String(roomsStore.length + 1).padStart(3, "0")}`,
        code: payload.code.trim(),
        name: payload.name.trim(),
        type: normalizeRoomType(payload.type),
        capacity: Number(payload.capacity),
        status: normalizeRoomStatus(payload.status),
        note: payload.note.trim(),
    };

    roomsStore = [room, ...roomsStore];
    return cloneRoom(room);
};

export const updateRoom = async (id: string, payload: RoomFormValues) => {
    await delay(300);
    const index = roomsStore.findIndex((room) => room.id === id);

    if (index === -1) {
        throw new Error("Không tìm thấy phòng cần cập nhật");
    }

    validateRequiredFields(payload);

    if (!isValidPositiveInteger(payload.capacity)) {
        throw new Error("Sức chứa phải là số nguyên dương");
    }

    if (findDuplicate(payload, id)) {
        throw new Error("Mã phòng hoặc tên phòng đã tồn tại");
    }

    const updated: BoardingRoom = {
        ...roomsStore[index],
        code: payload.code.trim(),
        name: payload.name.trim(),
        type: normalizeRoomType(payload.type),
        capacity: Number(payload.capacity),
        status: normalizeRoomStatus(payload.status),
        note: payload.note.trim(),
    };

    roomsStore[index] = updated;
    return cloneRoom(updated);
};

export const deleteRoom = async (id: string) => {
    await delay(250);
    const room = roomsStore.find((item) => item.id === id);

    if (!room) {
        throw new Error("Không tìm thấy phòng cần xóa");
    }

    if (room.status === "Đang sử dụng" || room.isReferenced) {
        throw new Error("Phòng đang được sử dụng nên không thể xóa");
    }

    roomsStore = roomsStore.filter((item) => item.id !== id);
};
