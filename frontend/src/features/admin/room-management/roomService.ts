import api, { getApiData, getPageContent } from "~/api/api";
import { mockRooms } from "./mockRooms";
import type { BoardingRoom, RoomFormValues, RoomSearchParams, RoomStatus } from "./types";

type BackendRoomStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" | "INACTIVE";

interface BackendRoom {
    id: string;
    roomCode?: string;
    code?: string;
    name?: string;
    roomName?: string;
    roomTypeId?: string;
    roomTypeName?: string;
    typeName?: string;
    floor?: number;
    capacity?: number;
    statusCode?: BackendRoomStatus;
    status?: BackendRoomStatus;
    note?: string;
    description?: string;
    isActive?: boolean;
}

let fallbackStore: BoardingRoom[] = mockRooms.map((room) => ({ ...room }));

const cloneRoom = (room: BoardingRoom): BoardingRoom => ({ ...room });

const statusToBackend: Record<RoomStatus, BackendRoomStatus> = {
    Trống: "AVAILABLE",
    "Đang sử dụng": "OCCUPIED",
    "Bảo trì": "MAINTENANCE",
    "Ngừng hoạt động": "INACTIVE",
};

const statusFromBackend = (status?: BackendRoomStatus, isActive?: boolean): RoomStatus => {
    if (isActive === false || status === "INACTIVE") {
         return "Ngừng hoạt động";
    }
    switch (status) {
        case "OCCUPIED":
            return "Đang sử dụng";
        case "MAINTENANCE":
             return "Bảo trì";
        default:
            return "Trống";
    }
};

function toRoom(item: BackendRoom): BoardingRoom {
    return {
        id: item.id,
        code: item.roomCode ?? item.code ?? "",
        name: item.roomName ?? item.name ?? "",
        roomTypeId: item.roomTypeId,
        type: (item.roomTypeName ?? item.typeName ?? "Thường") as BoardingRoom["type"],
        floor: item.floor,
        capacity: item.capacity ?? 0,
        status: statusFromBackend(item.statusCode ?? item.status, item.isActive),
        note: item.note ?? item.description ?? "",
    };
}

function localSearch(params: RoomSearchParams) {
    const keyword = params.keyword.trim().toLowerCase();

    return fallbackStore
        .filter((room) => {
            const matchesKeyword =
                !keyword || room.code.toLowerCase().includes(keyword) || room.name.toLowerCase().includes(keyword);
            const matchesType = !params.roomTypeId || room.roomTypeId === params.roomTypeId;
            const matchesStatus = params.status
                ? room.status === params.status
                : room.status !== "Ngừng hoạt động";
            const matchesFloor = !params.floor.trim() || String(room.floor ?? "") === params.floor.trim();
            const matchesCapacity = !params.capacity || String(room.capacity) === params.capacity.trim();
            return matchesKeyword && matchesType && matchesStatus && matchesFloor && matchesCapacity;
        })
        .map(cloneRoom);
}

const isValidPositiveInteger = (value: string) => /^[1-9]\d*$/.test(value.trim());

const validateRequiredFields = (payload: RoomFormValues) => {
    if (
        !payload.code.trim() ||
        !payload.name.trim() ||
        !payload.roomTypeId.trim() ||
        !payload.floor.trim() ||
        !payload.capacity.trim() ||
        !payload.status
    ) {
        throw new Error("Vui lòng nhập đầy đủ thông tin bắt buộc");
    }
    if (!isValidPositiveInteger(payload.floor)) {
       throw new Error("Tầng phải là số nguyên dương");
    }
    if (!isValidPositiveInteger(payload.capacity)) {
        throw new Error("Sức chứa phải là số nguyên dương");
    }
};

function toPayload(payload: RoomFormValues) {
    return {
        roomCode: payload.code.trim(),
        name: payload.name.trim(),
        roomTypeId: payload.roomTypeId.trim(),
        floor: Number(payload.floor),
        capacity: Number(payload.capacity),
        statusCode: statusToBackend[payload.status as RoomStatus],
        description: payload.note.trim(),
    };
}

export const getRooms = async () => {
    try {
        const response = await api.get("/admin/rooms", { params: { page: 0, size: 50 } });
        return getPageContent<BackendRoom>(getApiData<unknown>(response))
            .map(toRoom)
            .filter((room) => room.status !== "Ngừng hoạt động");
    } catch {
        return fallbackStore
            .filter((room) => room.status !== "Ngừng hoạt động")
            .map(cloneRoom);
    }
};

export const searchRooms = async (params: RoomSearchParams) => {
    try {
        const response = await api.get("/admin/rooms", {
            params: {
                roomTypeId: params.roomTypeId || undefined,
                statusCode: params.status ? statusToBackend[params.status] : undefined,
                page: 0,
                size: 50,
            },
        });
        const rooms = getPageContent<BackendRoom>(getApiData<unknown>(response)).map(toRoom);
        const keyword = params.keyword.trim().toLowerCase();
        return rooms.filter((room) => {
            const matchesKeyword =
                !keyword || room.code.toLowerCase().includes(keyword) || room.name.toLowerCase().includes(keyword);
            const matchesType = !params.roomTypeId || room.roomTypeId === params.roomTypeId;
            const matchesStatus = params.status
                ? room.status === params.status
                : room.status !== "Ngừng hoạt động";
            const matchesFloor = !params.floor.trim() || String(room.floor ?? "") === params.floor.trim();
            const matchesCapacity = !params.capacity || String(room.capacity) === params.capacity.trim();
            return matchesKeyword && matchesType && matchesStatus && matchesFloor && matchesCapacity;
           
        });
    } catch {
        return localSearch(params);
    }
};

export const createRoom = async (payload: RoomFormValues) => {
    validateRequiredFields(payload);
    const response = await api.post("/admin/rooms", toPayload(payload));
    return toRoom(getApiData<BackendRoom>(response));
};

export const updateRoom = async (id: string, payload: RoomFormValues) => {
    validateRequiredFields(payload);
    const response = await api.put(`/admin/rooms/${id}`, toPayload(payload));
    return toRoom(getApiData<BackendRoom>(response));
};

export const deleteRoom = async (id: string) => {
    await api.delete(`/admin/rooms/${id}`);
};
