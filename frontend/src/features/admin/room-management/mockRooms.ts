import type { BoardingRoom } from "./types";

export const roomTypes = ["Thường", "VIP", "Cách ly"] as const;
export const roomStatuses = ["Trống", "Đang sử dụng", "Bảo trì"] as const;

export const roomTypeLabels: Record<(typeof roomTypes)[number], string> = {
    Thường: "Thường",
    VIP: "VIP",
    "Cách ly": "Cách ly",
};

export const roomStatusLabels: Record<(typeof roomStatuses)[number], string> = {
    Trống: "Trống",
    "Đang sử dụng": "Đang sử dụng",
    "Bảo trì": "Bảo trì",
};

export const mockRooms: BoardingRoom[] = [
    {
        id: "ROOM-001",
        code: "ROOM001",
        name: "Chuồng A01",
        type: "Thường",
        capacity: 1,
        status: "Trống",
        note: "Phòng tiêu chuẩn cho thú cưng nhỏ",
    },
    {
        id: "ROOM-002",
        code: "ROOM002",
        name: "Chuồng A02",
        type: "Thường",
        capacity: 1,
        status: "Đang sử dụng",
        note: "Đang có thú cưng lưu trú",
        isReferenced: true,
    },
    {
        id: "ROOM-003",
        code: "ROOM003",
        name: "Chuồng A03",
        type: "Thường",
        capacity: 2,
        status: "Trống",
        note: "Có camera",
    },
    {
        id: "ROOM-004",
        code: "ROOM004",
        name: "Phòng VIP 01",
        type: "VIP",
        capacity: 1,
        status: "Trống",
        note: "Có camera và điều hòa",
    },
    {
        id: "ROOM-005",
        code: "ROOM005",
        name: "Phòng VIP 02",
        type: "VIP",
        capacity: 1,
        status: "Đang sử dụng",
        note: "Phòng riêng",
        isReferenced: true,
    },
    {
        id: "ROOM-006",
        code: "ROOM006",
        name: "Khu cách ly 01",
        type: "Cách ly",
        capacity: 1,
        status: "Bảo trì",
        note: "Đang vệ sinh khử khuẩn",
    },
    {
        id: "ROOM-007",
        code: "ROOM007",
        name: "Khu cách ly 02",
        type: "Cách ly",
        capacity: 1,
        status: "Trống",
        note: "Dùng cho thú cần theo dõi",
    },
    {
        id: "ROOM-008",
        code: "ROOM008",
        name: "Chuồng B01",
        type: "Thường",
        capacity: 2,
        status: "Trống",
        note: "Phù hợp chó nhỏ",
    },
    {
        id: "ROOM-009",
        code: "ROOM009",
        name: "Chuồng B02",
        type: "Thường",
        capacity: 2,
        status: "Bảo trì",
        note: "Cần sửa khóa chuồng",
    },
    {
        id: "ROOM-010",
        code: "ROOM010",
        name: "Phòng mèo 01",
        type: "VIP",
        capacity: 1,
        status: "Trống",
        note: "Khu riêng cho mèo",
    },
    {
        id: "ROOM-011",
        code: "ROOM011",
        name: "Chuồng C01",
        type: "Thường",
        capacity: 1,
        status: "Trống",
        note: "Chuồng mới bổ sung",
    },
];
